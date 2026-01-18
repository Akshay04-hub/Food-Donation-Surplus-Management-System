// backend/models/Rating.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RatingSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },

    // user who gives the rating
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // user who receives the rating
    rated_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // optional links
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review_text: {
      type: String,
    }
  },
  {
    collection: 'ratings',
    timestamps: true,
  }
);

module.exports = mongoose.model('Rating', RatingSchema);
