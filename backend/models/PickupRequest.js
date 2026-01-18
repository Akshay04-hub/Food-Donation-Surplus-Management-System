// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');
// const { v4: uuidv4 } = require('uuid');

// const PickupRequest = sequelize.define('PickupRequest', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   uuid: {
//     type: DataTypes.UUID,
//     defaultValue: uuidv4,
//     unique: true
//   },
//   donation_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   receiver_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   organization_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   requested_quantity: {
//     type: DataTypes.INTEGER,
//     allowNull: false
//   },
//   status: {
//     type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED', 'REJECTED'),
//     defaultValue: 'PENDING'
//   },
//   pickup_date: {
//     type: DataTypes.DATE
//   },
//   pickup_time: {
//     type: DataTypes.TIME
//   },
//   special_instructions: {
//     type: DataTypes.TEXT
//   },
//   rejection_reason: {
//     type: DataTypes.STRING(500)
//   },
//   completed_at: {
//     type: DataTypes.DATE
//   }
// }, {
//   tableName: 'pickup_requests',
//   timestamps: true,
//   underscored: true
// });

// module.exports = PickupRequest;


// backend/models/PickupRequest.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const pickupRequestSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },

  // references (previously *_id integers)
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

  requested_quantity: { type: Number, required: true },

  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PICKED_UP', 'CANCELLED', 'REJECTED'],
    default: 'PENDING'
  },

  pickup_date: { type: Date },        // date/time when scheduled
  pickup_time: { type: String },      // keep as string (HH:MM) or use Date if full datetime needed

  special_instructions: { type: String },
  rejection_reason: { type: String, maxlength: 500 },

  completed_at: { type: Date }
}, {
  collection: 'pickup_requests',
  timestamps: true
});

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
