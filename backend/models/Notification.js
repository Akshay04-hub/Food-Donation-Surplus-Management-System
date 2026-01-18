// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    default: () => require('uuid').v4(),
    index: true
  },

  // reference to the user who receives the notification
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: [
      'DONATION_AVAILABLE',
      'DONATION_ACCEPTED',
      'DONATION_REJECTED',
      'REQUEST_RECEIVED',
      'PICKUP_CONFIRMED',
      'DONATION_PICKED',
      'RATING_RECEIVED',
      'ORGANIZATION_APPROVED',
      'ORGANIZATION_REJECTED',
      'NEW_MESSAGE'
    ],
    required: true
  },

  title: { type: String, required: true, maxlength: 255 },
  message: { type: String, required: true },

  // related entity (optional): keep an id and type, id stored as ObjectId for references
  related_entity_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'related_entity_type' },
  related_entity_type: { type: String }, // e.g. 'Donation', 'Pickup', 'Message'

  is_read: { type: Boolean, default: false },

  action_url: { type: String, maxlength: 500 },

  // Allow arbitrary metadata if you want to store extra bits
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  collection: 'notifications',
  timestamps: true // adds createdAt & updatedAt
});

module.exports = mongoose.model('Notification', notificationSchema);
