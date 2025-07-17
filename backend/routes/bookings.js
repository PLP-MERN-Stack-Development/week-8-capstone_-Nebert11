const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new booking
router.post('/', auth, [
  body('therapistId').isMongoId().withMessage('Valid therapist ID is required'),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('duration').isInt({ min: 30, max: 120 }).withMessage('Duration must be between 30 and 120 minutes'),
  body('sessionType').optional().isIn(['individual', 'couples', 'family', 'group']).withMessage('Invalid session type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { therapistId, sessionDate, duration, sessionType = 'individual', notes } = req.body;
    const patientId = req.user._id;

    // Verify therapist exists and is active
    const therapist = await User.findOne({
      _id: therapistId,
      role: 'therapist',
      isActive: true,
      'therapistProfile.verified': true
    });

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found or not verified' });
    }

    // Check if the time slot is available
    const existingBooking = await Booking.findOne({
      therapistId,
      sessionDate: new Date(sessionDate),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    // Calculate price
    const price = (therapist.therapistProfile.hourlyRate * duration) / 60;

    // Create booking
    const booking = new Booking({
      patientId,
      therapistId,
      sessionDate: new Date(sessionDate),
      duration,
      sessionType,
      price,
      notes: { patient: notes }
    });

    await booking.save();

    // Populate booking details for response
    await booking.populate([
      { path: 'patientId', select: 'firstName lastName email' },
      { path: 'therapistId', select: 'firstName lastName therapistProfile.specialties' }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's bookings
router.get('/', auth, async (req, res) => {
  try {
    const { status, upcoming, past } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    
    // Set query based on user role
    if (userRole === 'patient') {
      query.patientId = userId;
    } else if (userRole === 'therapist') {
      query.therapistId = userId;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.sessionDate = { $gte: new Date() };
    } else if (past === 'true') {
      query.sessionDate = { $lt: new Date() };
    }

    const bookings = await Booking.find(query)
      .populate('patientId', 'firstName lastName email avatar')
      .populate('therapistId', 'firstName lastName therapistProfile.specialties')
      .sort({ sessionDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific booking
router.get('/:id', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const booking = await Booking.findById(bookingId)
      .populate('patientId', 'firstName lastName email avatar')
      .populate('therapistId', 'firstName lastName therapistProfile.specialties therapistProfile.hourlyRate');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const hasAccess = 
      (userRole === 'patient' && booking.patientId._id.toString() === userId.toString()) ||
      (userRole === 'therapist' && booking.therapistId._id.toString() === userId.toString()) ||
      userRole === 'admin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking
router.put('/:id', auth, [
  body('sessionDate').optional().isISO8601().withMessage('Valid session date is required'),
  body('duration').optional().isInt({ min: 30, max: 120 }).withMessage('Duration must be between 30 and 120 minutes'),
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookingId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { sessionDate, duration, status, notes } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const canUpdate = 
      (userRole === 'patient' && booking.patientId.toString() === userId.toString()) ||
      (userRole === 'therapist' && booking.therapistId.toString() === userId.toString()) ||
      userRole === 'admin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields based on user role
    if (sessionDate && (userRole === 'patient' || userRole === 'admin')) {
      // Check if new time slot is available
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: bookingId },
        therapistId: booking.therapistId,
        sessionDate: new Date(sessionDate),
        status: { $in: ['pending', 'confirmed'] }
      });

      if (conflictingBooking) {
        return res.status(400).json({ message: 'New time slot is not available' });
      }

      booking.sessionDate = new Date(sessionDate);
    }

    if (duration && (userRole === 'patient' || userRole === 'admin')) {
      booking.duration = duration;
      // Recalculate price if duration changes
      const therapist = await User.findById(booking.therapistId);
      booking.price = (therapist.therapistProfile.hourlyRate * duration) / 60;
    }

    if (status) {
      booking.status = status;
      
      if (status === 'cancelled') {
        booking.cancelledBy = userId;
        booking.cancelledAt = new Date();
      }
    }

    // Update notes based on user role
    if (notes) {
      if (userRole === 'patient') {
        booking.notes.patient = notes;
      } else if (userRole === 'therapist') {
        booking.notes.therapist = notes;
      } else if (userRole === 'admin') {
        booking.notes.admin = notes;
      }
    }

    await booking.save();

    // Populate for response
    await booking.populate([
      { path: 'patientId', select: 'firstName lastName email' },
      { path: 'therapistId', select: 'firstName lastName therapistProfile.specialties' }
    ]);

    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const canCancel = 
      (userRole === 'patient' && booking.patientId.toString() === userId.toString()) ||
      (userRole === 'therapist' && booking.therapistId.toString() === userId.toString()) ||
      userRole === 'admin';

    if (!canCancel) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledBy = userId;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;

    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add feedback to completed booking
router.post('/:id/feedback', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookingId = req.params.id;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only patients can leave feedback and only for completed sessions
    if (booking.patientId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed sessions' });
    }

    // Update feedback
    booking.feedback = {
      patientRating: rating,
      patientComment: comment,
      submittedAt: new Date()
    };

    await booking.save();

    // Update therapist's overall rating
    const therapistBookings = await Booking.find({
      therapistId: booking.therapistId,
      status: 'completed',
      'feedback.patientRating': { $exists: true }
    });

    if (therapistBookings.length > 0) {
      const totalRating = therapistBookings.reduce((sum, b) => sum + b.feedback.patientRating, 0);
      const averageRating = totalRating / therapistBookings.length;

      await User.findByIdAndUpdate(booking.therapistId, {
        'therapistProfile.rating': Math.round(averageRating * 10) / 10,
        'therapistProfile.totalReviews': therapistBookings.length
      });
    }

    res.json({
      message: 'Feedback submitted successfully',
      feedback: booking.feedback
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get booking statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole !== 'therapist' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    let matchQuery = {};
    if (userRole === 'therapist') {
      matchQuery.therapistId = userId;
    }

    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0] }
          },
          averageRating: {
            $avg: '$feedback.patientRating'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalBookings: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalRevenue: 0,
      averageRating: 0
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;