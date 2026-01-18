const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => require('uuid').v4(),
    unique: true,
    index: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },

  action: {
    type: String,
    enum: ['CREATED', 'ACCEPTED', 'REJECTED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'],
    required: true
  },

  description: {
    type: String
  },

  details: {
    type: mongoose.Schema.Types.Mixed
  }

}, {
  collection: 'activity_logs',
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
