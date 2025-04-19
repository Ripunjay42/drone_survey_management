// server/models/droneModel.js
const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a drone name'],
      trim: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Please add a serial number'],
      unique: true,
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please add a drone model'],
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'in-mission', 'maintenance', 'offline'],
      default: 'available'
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    maxFlightTime: {
      type: Number, // in minutes
      required: true,
      min: 5,
      max: 180
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Drone', droneSchema);