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
    uploadResume: {
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
    terms: {
      type: Boolean,
    },
    profiles: {
      type: Object,
      default: {},
    },
    profileUpdated: {
      type: Boolean,
      default: false,
    },
    sortcount: {
      type: Number,
    },
    testEntry: {
      type: Boolean,
      default: false,
    },
    testProfile: {
      type: Object,
    },
  },
  { timestamps: true }
);

const EventRegister = mongoose.model('climbeventregister', ClicmbEventRegisterSchema);

const event_slot = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    date: {
      type: String,
    },
    slot: {
      type: String,
    },
    no_of_count: {
      type: Number,
    },
    booked_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Eventslot = mongoose.model('eventslot', event_slot);

module.exports = { EventRegister, Eventslot };
