// backend/models/Message.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    related_donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },

    related_request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
    },

    message_text: {
      type: String,
      required: true,
    },

    is_read: {
      type: Boolean,
      default: false,
    },

    read_at: {
      type: Date,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
