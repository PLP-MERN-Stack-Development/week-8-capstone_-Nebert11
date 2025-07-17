const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 50 // in minutes
  },
  sessionType: {
    type: String,
    enum: ['individual', 'couples', 'family', 'group'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    patient: String,
    therapist: String,
    admin: String
  },
  price: {
    type: Number,
    required: true
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: String,
  
  // Session details
  meetingLink: String,
  remindersSent: {
    type: Number,
    default: 0
  },
  
  // Cancellation information
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  cancellationReason: String,
  
  // Feedback
  feedback: {
    patientRating: {
      type: Number,
      min: 1,
      max: 5
    },
    patientComment: String,
    therapistNotes: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
bookingSchema.index({ patientId: 1, sessionDate: -1 });
bookingSchema.index({ therapistId: 1, sessionDate: -1 });
bookingSchema.index({ status: 1, sessionDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);