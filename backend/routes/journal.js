const express = require('express');
const { body, validationResult } = require('express-validator');
const JournalEntry = require('../models/JournalEntry');
const auth = require('../middleware/auth');
const aiService = require('../services/openai');

const router = express.Router();

// Create a new journal entry
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('mood').isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, mood, tags = [], isPrivate = true } = req.body;
    const userId = req.user._id;

    // Create journal entry
    const journalEntry = new JournalEntry({
      userId,
      title,
      content,
      mood,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      isPrivate
    });

    // Get AI analysis of the journal entry
    try {
      const analysis = await aiService.analyzeJournalEntry(content, userId);
      if (analysis) {
        journalEntry.aiAnalysis = analysis;
        
        // Flag entry if high risk detected
        if (analysis.riskLevel === 'high') {
          journalEntry.isFlagged = true;
          journalEntry.flagReason = 'High risk content detected by AI analysis';
        }
      }
    } catch (aiError) {
      console.error('AI analysis failed:', aiError);
      // Continue without AI analysis if it fails
    }

    await journalEntry.save();

    res.status(201).json({
      message: 'Journal entry created successfully',
      entry: journalEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's journal entries
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, mood, tags, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user._id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = { userId };

    // Apply filters
    if (mood) {
      const moodRange = mood.split('-');
      if (moodRange.length === 2) {
        query.mood = { $gte: parseInt(moodRange[0]), $lte: parseInt(moodRange[1]) };
      } else {
        query.mood = parseInt(mood);
      }
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray.map(tag => tag.toLowerCase()) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const entries = await JournalEntry.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-aiAnalysis'); // Don't include AI analysis in list view

    const total = await JournalEntry.countDocuments(query);

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

// Get specific journal entry
router.get('/:id', auth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user._id;

    const entry = await JournalEntry.findOne({ _id: entryId, userId });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update journal entry
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('mood').optional().isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entryId = req.params.id;
    const userId = req.user._id;
    const { title, content, mood, tags, isPrivate } = req.body;

    const entry = await JournalEntry.findOne({ _id: entryId, userId });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Store previous version in history
    entry.history.push({
      content: entry.content,
      editedAt: entry.updatedAt,
      version: entry.version
    });

    // Update fields
    if (title !== undefined) entry.title = title;
    if (content !== undefined) {
      entry.content = content;
      
      // Re-analyze with AI if content changed
      try {
        const analysis = await aiService.analyzeJournalEntry(content, userId);
        if (analysis) {
          entry.aiAnalysis = analysis;
          
          // Update flag status
          if (analysis.riskLevel === 'high') {
            entry.isFlagged = true;
            entry.flagReason = 'High risk content detected by AI analysis';
          } else {
            entry.isFlagged = false;
            entry.flagReason = undefined;
          }
        }
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
      }
    }
    if (mood !== undefined) entry.mood = mood;
    if (tags !== undefined) entry.tags = tags.map(tag => tag.toLowerCase().trim());
    if (isPrivate !== undefined) entry.isPrivate = isPrivate;

    entry.version += 1;
    await entry.save();

    res.json({
      message: 'Journal entry updated successfully',
      entry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete journal entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user._id;

    const entry = await JournalEntry.findOneAndDelete({ _id: entryId, userId });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get journal statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const stats = await JournalEntry.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          averageMood: { $avg: '$mood' },
          moodTrend: {
            $push: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              mood: '$mood'
            }
          },
          commonTags: { $push: '$tags' },
          wordCount: { $sum: { $size: { $split: ['$content', ' '] } } }
        }
      }
    ]);

    const result = stats[0] || {
      totalEntries: 0,
      averageMood: 0,
      moodTrend: [],
      commonTags: [],
      wordCount: 0
    };

    // Process common tags
    if (result.commonTags.length > 0) {
      const tagCounts = {};
      result.commonTags.flat().forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      result.commonTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));
    }

    // Group mood trend by date and calculate daily averages
    const moodByDate = {};
    result.moodTrend.forEach(({ date, mood }) => {
      if (!moodByDate[date]) {
        moodByDate[date] = { total: 0, count: 0 };
      }
      moodByDate[date].total += mood;
      moodByDate[date].count += 1;
    });

    result.moodTrend = Object.entries(moodByDate)
      .map(([date, { total, count }]) => ({
        date,
        mood: Math.round((total / count) * 10) / 10
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mood insights
router.get('/insights/mood', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await JournalEntry.find({
      userId,
      createdAt: { $gte: startDate }
    }).select('mood createdAt tags aiAnalysis.emotions');

    if (entries.length === 0) {
      return res.json({
        message: 'Not enough data for insights',
        insights: null
      });
    }

    // Prepare data for AI analysis
    const moodData = entries.map(entry => ({
      date: entry.createdAt,
      mood: entry.mood,
      tags: entry.tags,
      emotions: entry.aiAnalysis?.emotions || []
    }));

    try {
      const insights = await aiService.generateMoodInsights(moodData);
      res.json({ insights });
    } catch (aiError) {
      console.error('AI insights failed:', aiError);
      
      // Fallback to basic statistical insights
      const averageMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length;
      const moodTrend = entries.length > 1 ? 
        (entries[entries.length - 1].mood - entries[0].mood) : 0;

      res.json({
        insights: {
          patterns: [`Average mood: ${averageMood.toFixed(1)}/10`],
          triggers: ['Unable to analyze triggers'],
          recommendations: ['Continue journaling regularly', 'Consider professional support if needed'],
          alerts: moodTrend < -2 ? [{ 
            type: 'mood_decline', 
            message: 'Mood appears to be declining', 
            severity: 'medium' 
          }] : []
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;