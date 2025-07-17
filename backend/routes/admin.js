const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const JournalEntry = require('../models/JournalEntry');
const MoodEntry = require('../models/MoodEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Apply auth and admin check to all routes
router.use(auth);
router.use(requireAdmin);

// Dashboard overview statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTherapists,
      totalPatients,
      activeUsers,
      totalBookings,
      completedSessions,
      totalMessages,
      flaggedContent,
      recentRegistrations
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'therapist' }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ isActive: true, lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Message.countDocuments(),
      Message.countDocuments({ isFlagged: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt')
    ]);

    // Calculate revenue (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' },
          averageSessionPrice: { $avg: '$price' }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, averageSessionPrice: 0 };

    res.json({
      overview: {
        totalUsers,
        totalTherapists,
        totalPatients,
        activeUsers,
        totalBookings,
        completedSessions,
        totalMessages,
        flaggedContent,
        monthlyRevenue: revenue.totalRevenue,
        averageSessionPrice: revenue.averageSessionPrice
      },
      recentRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    // Apply filters
    if (role && role !== 'all') {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific user details
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional user statistics
    const [bookingCount, messageCount, journalCount, moodCount] = await Promise.all([
      Booking.countDocuments({
        $or: [{ patientId: user._id }, { therapistId: user._id }]
      }),
      Message.countDocuments({
        $or: [{ senderId: user._id }, { receiverId: user._id }]
      }),
      JournalEntry.countDocuments({ userId: user._id }),
      MoodEntry.countDocuments({ userId: user._id })
    ]);

    res.json({
      user,
      statistics: {
        bookingCount,
        messageCount,
        journalCount,
        moodCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive, reason } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    // Log the action (you might want to create an audit log model)
    console.log(`Admin ${req.user._id} ${isActive ? 'activated' : 'deactivated'} user ${userId}. Reason: ${reason || 'None provided'}`);

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify therapist
router.put('/therapists/:id/verify', [
  body('verified').isBoolean().withMessage('verified must be a boolean'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { verified, notes } = req.body;
    const therapistId = req.params.id;

    const therapist = await User.findOne({ _id: therapistId, role: 'therapist' });
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    therapist.therapistProfile.verified = verified;
    await therapist.save();

    // Log the action
    console.log(`Admin ${req.user._id} ${verified ? 'verified' : 'unverified'} therapist ${therapistId}. Notes: ${notes || 'None'}`);

    res.json({
      message: `Therapist ${verified ? 'verified' : 'unverified'} successfully`,
      therapist: {
        id: therapist._id,
        firstName: therapist.firstName,
        lastName: therapist.lastName,
        verified: therapist.therapistProfile.verified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Content moderation - Get flagged messages
router.get('/moderation/messages', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { isFlagged: true };
    
    if (status === 'pending') {
      query.moderatedBy = { $exists: false };
    } else if (status === 'reviewed') {
      query.moderatedBy = { $exists: true };
    }

    const messages = await Message.find(query)
      .populate('senderId', 'firstName lastName email')
      .populate('receiverId', 'firstName lastName email')
      .populate('moderatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Moderate flagged message
router.put('/moderation/messages/:id', [
  body('action').isIn(['approve', 'remove', 'warn']).withMessage('Invalid action'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, notes } = req.body;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Update message based on action
    if (action === 'remove') {
      message.isDeleted = true;
    } else if (action === 'approve') {
      message.isFlagged = false;
    }

    message.moderatedBy = req.user._id;
    message.moderatedAt = new Date();

    await message.save();

    // Log the moderation action
    console.log(`Admin ${req.user._id} ${action}d message ${messageId}. Notes: ${notes || 'None'}`);

    res.json({
      message: `Message ${action}d successfully`,
      messageId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get flagged journal entries
router.get('/moderation/journal', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const entries = await JournalEntry.find({ isFlagged: true })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await JournalEntry.countDocuments({ isFlagged: true });

    res.json({
      entries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// System analytics
router.get('/analytics/usage', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      userGrowth,
      sessionStats,
      messageStats,
      popularFeatures
    ] = await Promise.all([
      // User growth over time
      User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              role: '$role'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),

      // Session statistics
      Booking.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$price' }
          }
        }
      ]),

      // Message statistics
      Message.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              isAI: '$isAIResponse'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),

      // Popular features (based on usage)
      Promise.all([
        JournalEntry.countDocuments({ createdAt: { $gte: startDate } }),
        MoodEntry.countDocuments({ createdAt: { $gte: startDate } }),
        Message.countDocuments({ createdAt: { $gte: startDate }, isAIResponse: true }),
        Booking.countDocuments({ createdAt: { $gte: startDate } })
      ])
    ]);

    const [journalUsage, moodUsage, aiChatUsage, bookingUsage] = popularFeatures;

    res.json({
      userGrowth,
      sessionStats,
      messageStats,
      featureUsage: {
        journal: journalUsage,
        moodTracking: moodUsage,
        aiChat: aiChatUsage,
        booking: bookingUsage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// System health check
router.get('/system/health', async (req, res) => {
  try {
    const [
      dbStatus,
      activeConnections,
      errorLogs,
      systemLoad
    ] = await Promise.all([
      // Database connection status
      User.findOne().then(() => 'connected').catch(() => 'disconnected'),
      
      // Active user sessions (simplified)
      User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // last 5 minutes
      }),
      
      // Recent error count (you'd implement proper error logging)
      Message.countDocuments({ 
        isFlagged: true, 
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
      }),
      
      // System metrics (simplified)
      {
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    ]);

    res.json({
      status: 'healthy',
      database: dbStatus,
      activeConnections,
      recentErrors: errorLogs,
      system: systemLoad,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Export data (for compliance/backup)
router.get('/export/users', async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      
      // Simple CSV conversion (you might want to use a proper CSV library)
      const csvContent = [
        Object.keys(csv[0]).join(','),
        ...csv.map(row => Object.values(row).join(','))
      ].join('\n');
      
      res.send(csvContent);
    } else {
      res.json({ users, exportedAt: new Date() });
    }
  } catch (error) {
    res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

module.exports = router;