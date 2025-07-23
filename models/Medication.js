const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  dosage: {
    amount: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  frequency: {
    times: { type: Number, required: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' }
  },
  reminderTimes: [{
    type: String,
    required: true
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  instructions: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medication', medicationSchema);