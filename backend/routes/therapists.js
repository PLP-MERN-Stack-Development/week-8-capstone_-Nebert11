const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all therapists with filtering
router.get('/', async (req, res) => {
  try {
    const { specialty, location, minRating, maxRate, availability } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { role: 'therapist', isActive: true, 'therapistProfile.verified': true };

    // Apply filters
    if (specialty) {
      query['therapistProfile.specialties'] = { $in: [specialty] };
    }
    if (minRating) {
      query['therapistProfile.rating'] = { $gte: parseFloat(minRating) };
    }
    if (maxRate) {
      query['therapistProfile.hourlyRate'] = { $lte: parseFloat(maxRate) };
    }

    const therapists = await User.find(query)
      .select('-password')
      .sort({ 'therapistProfile.rating': -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      therapists,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get therapist by ID
router.get('/:id', async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'therapist',
      isActive: true
    }).select('-password');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    res.json(therapist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update therapist profile (therapists only)
router.put('/profile', auth, [
  body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('hourlyRate').optional().isNumeric().withMessage('Hourly rate must be a number'),
  body('specialties').optional().isArray().withMessage('Specialties must be an array')
], async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ message: 'Access denied. Therapists only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      bio,
      specialties,
      hourlyRate,
      experience,
      education,
      certifications,
      languages,
      availability
    } = req.body;

    const user = await User.findById(req.user._id);
    
    // Update therapist profile
    if (bio !== undefined) user.therapistProfile.bio = bio;
    if (specialties) user.therapistProfile.specialties = specialties;
    if (hourlyRate !== undefined) user.therapistProfile.hourlyRate = hourlyRate;
    if (experience !== undefined) user.therapistProfile.experience = experience;
    if (education) user.therapistProfile.education = education;
    if (certifications) user.therapistProfile.certifications = certifications;
    if (languages) user.therapistProfile.languages = languages;
    if (availability) user.therapistProfile.availability = availability;

    await user.save();

    res.json({
      message: 'Therapist profile updated successfully',
      therapistProfile: user.therapistProfile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get therapist's bookings
router.get('/bookings/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ message: 'Access denied. Therapists only.' });
    }

    const { status, date } = req.query;
    let query = { therapistId: req.user._id };

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.sessionDate = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('patientId', 'firstName lastName email avatar')
      .sort({ sessionDate: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get therapist availability
router.get('/:id/availability', async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'therapist',
      isActive: true
    }).select('therapistProfile.availability');

    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    // Get existing bookings for the next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const bookings = await Booking.find({
      therapistId: req.params.id,
      sessionDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['pending', 'confirmed'] }
    }).select('sessionDate duration');

    res.json({
      availability: therapist.therapistProfile.availability,
      bookedSlots: bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;