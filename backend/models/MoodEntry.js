const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  energy: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  anxiety: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sleep: {
    hours: Number,
    quality: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  activities: [{
    type: String,
    enum: ['exercise', 'meditation', 'therapy', 'socializing', 'work', 'hobbies', 'relaxation']
  }],
  triggers: [{
    type: String,
    enum: ['stress', 'work', 'relationships', 'health', 'finances', 'family', 'other']
  }],
  notes: String,
  
  // Location and context
  location: {
    type: String,
    enum: ['home', 'work', 'outdoors', 'social', 'travel', 'other']
  },
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy']
  },
  
  // Medication tracking
  medications: [{
    name: String,
    dosage: String,
    taken: Boolean,
    time: Date
  }],
  
  // Automated insights
  insights: {
    patterns: [String],
    recommendations: [String],
    alerts: [{
      type: String,
      message: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }]
  }
}, {
  timestamps: true
});

// Index for efficient querying
moodEntrySchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ userId: 1, mood: 1 });
moodEntrySchema.index({ createdAt: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);