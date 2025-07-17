const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  
  // AI Analysis
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed']
    },
    emotions: [{
      emotion: String,
      confidence: Number
    }],
    keyThemes: [String],
    suggestedActions: [String],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  
  // Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  history: [{
    content: String,
    editedAt: Date,
    version: Number
  }]
}, {
  timestamps: true
});

// Index for efficient querying
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, mood: 1 });
journalEntrySchema.index({ tags: 1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);