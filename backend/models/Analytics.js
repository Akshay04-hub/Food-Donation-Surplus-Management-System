// backend/models/Analytics.js
const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true
    },

    total_donations_count: {
      type: Number,
      default: 0
    },

    total_pickups_count: {
      type: Number,
      default: 0
    },

    total_food_quantity_kg: {
      type: Number,
      default: 0
    },

    people_helped_count: {
      type: Number,
      default: 0
    },

    active_donors_count: {
      type: Number,
      default: 0
    },

    active_receivers_count: {
      type: Number,
      default: 0
    },

    active_organizations_count: {
      type: Number,
      default: 0
    },

    food_saved_from_waste_kg: {
      type: Number,
      default: 0
    },

    average_rating: {
      type: Number,
      default: 0
    }
  },
  {
    collection: 'analytics',
    timestamps: true
  }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
