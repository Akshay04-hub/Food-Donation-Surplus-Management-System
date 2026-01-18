const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    validate: {
      validator: (v) => !v || /^\d{10}$/.test(v),
      message: 'Phone number must be exactly 10 digits'
    }
  },
  role: {
    type: String,
    enum: ['DONOR', 'NGO', 'VOLUNTEER', 'ADMIN'],
    default: 'DONOR'
  },
  // Donor type (if role is DONOR)
  donor_type: {
    type: String,
    enum: ['HOME', 'HOSTELS', 'RESTAURANTS'],
    default: null
  },
  // Donor-specific fields based on donor_type
  // For HOSTELS
  hostel_name: {
    type: String
  },
  // For RESTAURANTS
  restaurant_name: {
    type: String
  },
  owner_name: {
    type: String
  },
  // For HOME/HOSTELS/RESTAURANTS (common field)
  address: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  profile_image_url: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  zip_code: {
    type: String
  },
  // NGO-specific fields
  ngo_name: {
    type: String
  },
  ngo_address: {
    type: String
  },
  last_login: {
    type: Date
  },
  // Points System
  redeemable_points: {
    type: Number,
    default: 0,
    min: 0
  },
  total_points_earned: {
    type: Number,
    default: 0
  },
  total_points_redeemed: {
    type: Number,
    default: 0
  },
  points_last_updated: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
