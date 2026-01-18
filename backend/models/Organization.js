// backend/models/Organization.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const organizationSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },

  name: { type: String, required: true, maxlength: 255 },

  organization_type: {
    type: String,
    enum: ['NGO', 'CHARITY', 'RESTAURANT', 'HOTEL', 'INDIVIDUAL', 'EVENT_ORGANIZER'],
    required: true
  },

  description: { type: String },

  registration_number: { type: String, maxlength: 100 },
  website: { type: String, maxlength: 500 },

  email: { type: String, required: true, maxlength: 255 },
  phone: { type: String, required: true, maxlength: 20 },

  location_latitude: { type: Number },
  location_longitude: { type: Number },

  address: { type: String, required: true, maxlength: 500 },
  city: { type: String, required: true, maxlength: 100 },
  state: { type: String, required: true, maxlength: 100 },
  zip_code: { type: String, maxlength: 10 },

  verification_status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },

  // references to User model
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified_date: { type: Date },

  is_active: { type: Boolean, default: true },

  registration_document_url: { type: String, maxlength: 500 },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ,
  // Ratings stored as subdocuments to allow average calculation and optional comments
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  average_rating: { type: Number, default: 0 },
  rating_count: { type: Number, default: 0 }
  ,
  // Automated acceptance-based score (derived from how often the org accepts donations)
  accepted_count: { type: Number, default: 0 },
  decision_count: { type: Number, default: 0 },
  acceptance_score: { type: Number, default: 0 }
}, {
  collection: 'organizations',
  timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
