const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const donationSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },

  // references to other collections (replace 'User' / 'Organization' with actual model names)
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

  food_type: { type: String, maxlength: 100, required: true },

  food_category: {
    type: String,
    enum: ['COOKED', 'RAW', 'PACKAGED', 'BEVERAGES', 'DAIRY', 'BAKERY', 'FRUITS', 'VEGETABLES'],
    required: true
  },

  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['KG', 'LITER', 'PIECES', 'DOZEN', 'BOXES'], default: 'KG' },

  description: { type: String },

  preparation_date: { type: Date, required: true },
  expiry_date: { type: Date, required: true },

  storage_condition: { type: String, maxlength: 100 },

  // use Number for lat/lng — store as decimal degrees (optional)
  location_latitude: { type: Number, default: null },
  location_longitude: { type: Number, default: null },

  address: { type: String, maxlength: 500, required: true },
  city: { type: String, maxlength: 100, required: true },

  contact_name: { type: String, maxlength: 100, required: true },
  contact_phone: {
    type: String,
    maxlength: 20,
    required: true,
    validate: {
      validator: (v) => /^\d{10}$/.test(v),
      message: 'Contact phone must be exactly 10 digits'
    }
  },
  contact_email: { type: String, maxlength: 255 },

  image_url: { type: String, maxlength: 500 },

  status: {
    type: String,
    enum: ['AVAILABLE', 'REQUESTED', 'ALLOCATED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
    default: 'AVAILABLE'
  },

  // Which organization/user accepted this donation (for NGOs)
  accepted_by: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    role: { type: String, enum: ['NGO', 'VOLUNTEER'] },
    rejected: { type: Boolean, default: false }
  },


  availability_count: { type: Number, default: 1 }
}, {
  collection: 'donations',
  timestamps: true
});

// Optional: compound index for location search (if you use geo queries later)
// donationSchema.index({ location: '2dsphere' });

// If you want to keep integer-like createdAt id sequences you can add plugins, but not necessary.

module.exports = mongoose.model('Donation', donationSchema);
