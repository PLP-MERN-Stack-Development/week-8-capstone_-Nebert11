const express = require('express');
const { body, validationResult } = require('express-validator');
const MoodEntry = require('../models/MoodEntry');
const auth = require('../middleware/auth');
const aiService = require('../services/openai');

const router = express.Router();

// Create a new mood entry
router.post('/', auth, [
  body('mood').isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
  body('energy').isInt({ min: 1, max: 10 }).withMessage('Energy must be between 1 and 10'),
  body('anxiety').isInt({ min: 1, max: 10 }).withMessage('Anxiety must be between 1 and 10'),
  body('sleep.hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
  body('sleep.quality').optional().isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be between 1 and 10'),
  body('activities').optional().isArray().withMessage('Activities must be an array'),
  body('triggers').optional().isArray().withMessage('Triggers must be an array'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      mood,
      energy,
      anxiety,
      sleep,
      activities = [],
      triggers = [],
      notes,
      location,
      weather,
      medications = []
    } = req.body;

    const userId = req.user._id;

    // Check if user already has an entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await MoodEntry.findOne({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (existingEntry) {
      return res.status(400).json({ 
        message: 'Mood entry for today already exists. Use PUT to update.' 
      });
    }

    // Create mood entry
    const moodEntry = new MoodEntry({
      userId,
      mood,
      energy,
      anxiety,
      sleep,
      activities,
      triggers,
      notes,
      location,
      weather,
      medications
    });

    await moodEntry.save();

    // Generate insights if we have enough historical data
    try {
      const recentEntries = await MoodEntry.find({ userId })
        .sort({ createdAt: -1 })
        .limit(30);

      if (recentEntries.length >= 7) {
        const moodData = recentEntries.map(entry => ({
          date: entry.createdAt,
          mood: entry.mood,
          energy: entry.energy,
          anxiety: entry.anxiety,
          activities: entry.activities,
          triggers: entry.triggers,
          sleep: entry.sleep
        }));

        const insights = await aiService.generateMoodInsights(moodData);
        if (insights) {
          moodEntry.insights = insights;
          await moodEntry.save();
        }
      }
    } catch (aiError) {
      console.error('AI insights generation failed:', aiError);
      // Continue without insights if AI fails
    }

    res.status(201).json({
      message: 'Mood entry created successfully',
      entry: moodEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's mood entries
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 30, 
      startDate, 
      endDate, 
      minMood, 
      maxMood,
      activities,
      triggers 
    } = req.query;

    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { userId };

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Mood range filter
    if (minMood || maxMood) {
      query.mood = {};
      if (minMood) query.mood.$gte = parseInt(minMood);
      if (maxMood) query.mood.$lte = parseInt(maxMood);
    }

    // Activities filter
    if (activities) {
      const activityArray = Array.isArray(activities) ? activities : [activities];
      query.activities = { $in: activityArray };
    }

    // Triggers filter
    if (triggers) {
      const triggerArray = Array.isArray(triggers) ? triggers : [triggers];
      query.triggers = { $in: triggerArray };
    }

    const entries = await MoodEntry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MoodEntry.countDocuments(query);

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

// Get specific mood entry
router.get('/:id', auth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user._id;

    const entry = await MoodEntry.findOne({ _id: entryId, userId });

    if (!entry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update mood entry
router.put('/:id', auth, [
  body('mood').optional().isInt({ min: 1, max: 10 }).withMessage('Mood must be between 1 and 10'),
  body('energy').optional().isInt({ min: 1, max: 10 }).withMessage('Energy must be between 1 and 10'),
  body('anxiety').optional().isInt({ min: 1, max: 10 }).withMessage('Anxiety must be between 1 and 10'),
  body('sleep.hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Sleep hours must be between 0 and 24'),
  body('sleep.quality').optional().isInt({ min: 1, max: 10 }).withMessage('Sleep quality must be between 1 and 10'),
  body('activities').optional().isArray().withMessage('Activities must be an array'),
  body('triggers').optional().isArray().withMessage('Triggers must be an array'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entryId = req.params.id;
    const userId = req.user._id;
    const updateData = req.body;

    const entry = await MoodEntry.findOne({ _id: entryId, userId });

    if (!entry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        entry[key] = updateData[key];
      }
    });

    await entry.save();

    res.json({
      message: 'Mood entry updated successfully',
      entry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete mood entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const userId = req.user._id;

    const entry = await MoodEntry.findOneAndDelete({ _id: entryId, userId });

    if (!entry) {
      return res.status(404).json({ message: 'Mood entry not found' });
    }

    res.json({ message: 'Mood entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mood statistics and insights
router.get('/insights/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const entries = await MoodEntry.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    if (entries.length === 0) {
      return res.json({
        message: 'No mood data available for the selected period',
        insights: null
      });
    }

    // Calculate basic statistics
    const stats = {
      totalEntries: entries.length,
      averageMood: entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length,
      averageEnergy: entries.reduce((sum, entry) => sum + entry.energy, 0) / entries.length,
      averageAnxiety: entries.reduce((sum, entry) => sum + entry.anxiety, 0) / entries.length,
      moodTrend: entries.map(entry => ({
        date: entry.createdAt.toISOString().split('T')[0],
        mood: entry.mood,
        energy: entry.energy,
        anxiety: entry.anxiety
      })),
      commonActivities: {},
      commonTriggers: {},
      sleepPattern: {
        averageHours: 0,
        averageQuality: 0
      }
    };

    // Count activities and triggers
    entries.forEach(entry => {
      entry.activities.forEach(activity => {
        stats.commonActivities[activity] = (stats.commonActivities[activity] || 0) + 1;
      });
      
      entry.triggers.forEach(trigger => {
        stats.commonTriggers[trigger] = (stats.commonTriggers[trigger] || 0) + 1;
      });

      if (entry.sleep?.hours) {
        stats.sleepPattern.averageHours += entry.sleep.hours;
      }
      if (entry.sleep?.quality) {
        stats.sleepPattern.averageQuality += entry.sleep.quality;
      }
    });

    // Convert to sorted arrays
    stats.commonActivities = Object.entries(stats.commonActivities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([activity, count]) => ({ activity, count }));

    stats.commonTriggers = Object.entries(stats.commonTriggers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trigger, count]) => ({ trigger, count }));

    // Calculate sleep averages
    const sleepEntries = entries.filter(e => e.sleep?.hours).length;
    if (sleepEntries > 0) {
      stats.sleepPattern.averageHours /= sleepEntries;
      stats.sleepPattern.averageQuality /= sleepEntries;
    }

    // Generate AI insights
    try {
      const moodData = entries.map(entry => ({
        date: entry.createdAt,
        mood: entry.mood,
        energy: entry.energy,
        anxiety: entry.anxiety,
        activities: entry.activities,
        triggers: entry.triggers,
        sleep: entry.sleep
      }));

      const aiInsights = await aiService.generateMoodInsights(moodData);
      stats.aiInsights = aiInsights;
    } catch (aiError) {
      console.error('AI insights failed:', aiError);
      stats.aiInsights = null;
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get mood correlations
router.get('/insights/correlations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const entries = await MoodEntry.find({
      userId,
      createdAt: { $gte: startDate }
    });

    if (entries.length < 7) {
      return res.json({
        message: 'Need at least 7 entries for correlation analysis',
        correlations: null
      });
    }

    // Calculate correlations
    const correlations = {
      moodVsEnergy: calculateCorrelation(entries, 'mood', 'energy'),
      moodVsAnxiety: calculateCorrelation(entries, 'mood', 'anxiety'),
      energyVsAnxiety: calculateCorrelation(entries, 'energy', 'anxiety'),
      sleepVsMood: calculateSleepCorrelation(entries, 'mood'),
      sleepVsEnergy: calculateSleepCorrelation(entries, 'energy'),
      activityImpact: calculateActivityImpact(entries),
      triggerImpact: calculateTriggerImpact(entries)
    };

    res.json({ correlations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper functions for correlation calculations
function calculateCorrelation(entries, field1, field2) {
  const n = entries.length;
  const sum1 = entries.reduce((sum, entry) => sum + entry[field1], 0);
  const sum2 = entries.reduce((sum, entry) => sum + entry[field2], 0);
  const sum1Sq = entries.reduce((sum, entry) => sum + entry[field1] * entry[field1], 0);
  const sum2Sq = entries.reduce((sum, entry) => sum + entry[field2] * entry[field2], 0);
  const pSum = entries.reduce((sum, entry) => sum + entry[field1] * entry[field2], 0);

  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

  return den === 0 ? 0 : num / den;
}

function calculateSleepCorrelation(entries, field) {
  const sleepEntries = entries.filter(entry => entry.sleep?.hours);
  if (sleepEntries.length < 3) return null;

  return calculateCorrelation(
    sleepEntries.map(entry => ({ sleep: entry.sleep.hours, [field]: entry[field] })),
    'sleep',
    field
  );
}

function calculateActivityImpact(entries) {
  const activityImpact = {};
  
  entries.forEach(entry => {
    entry.activities.forEach(activity => {
      if (!activityImpact[activity]) {
        activityImpact[activity] = { moods: [], count: 0 };
      }
      activityImpact[activity].moods.push(entry.mood);
      activityImpact[activity].count++;
    });
  });

  // Calculate average mood for each activity
  Object.keys(activityImpact).forEach(activity => {
    const data = activityImpact[activity];
    data.averageMood = data.moods.reduce((sum, mood) => sum + mood, 0) / data.moods.length;
    delete data.moods; // Remove raw data
  });

  return activityImpact;
}

function calculateTriggerImpact(entries) {
  const triggerImpact = {};
  
  entries.forEach(entry => {
    entry.triggers.forEach(trigger => {
      if (!triggerImpact[trigger]) {
        triggerImpact[trigger] = { moods: [], count: 0 };
      }
      triggerImpact[trigger].moods.push(entry.mood);
      triggerImpact[trigger].count++;
    });
  });

  // Calculate average mood for each trigger
  Object.keys(triggerImpact).forEach(trigger => {
    const data = triggerImpact[trigger];
    data.averageMood = data.moods.reduce((sum, mood) => sum + mood, 0) / data.moods.length;
    delete data.moods; // Remove raw data
  });

  return triggerImpact;
}

module.exports = router;