const mongoose = require('mongoose');
const { v4 } = require('uuid');

const ClicmbEventRegisterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
    },
    mail: {
      type: String,
    },
    gender: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    currentLocation: {
      type: String,
    },
    education: {
      type: String,
    },
    year_of_passedout: {
      type: String,
    },
    resumeName: {
      type: String,
    },
    date: {
      type: String,
    },
    slot: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const EventRegister = mongoose.model('climbeventregister', ClicmbEventRegisterSchema);

module.exports = { EventRegister };
