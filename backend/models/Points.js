const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const pointsSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transaction_type: {
    type: String,
    enum: ['DONATION', 'PICKUP', 'VOLUNTEER_ACTIVITY', 'REDEMPTION', 'BONUS', 'ADJUSTMENT'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  related_donation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  related_pickup_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PickupRequest'
  },
  reference_id: {
    type: String,
    index: true
  },
  is_reversed: {
    type: Boolean,
    default: false
  },
  reversal_reason: {
    type: String
  },
  reversed_at: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for user transactions
pointsSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Points', pointsSchema);
