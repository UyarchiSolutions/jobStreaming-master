const mongoose = require('mongoose');
const { v4 } = require('uuid');

const AgriCandidateSchema = new mongoose.Schema(
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
    mobile: {
      type: String,
    },
    location: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    skills: {
      type: Array,
      default: [],
    },
    collageName: {
      type: String,
    },
    batchFrom: {
      type: String,
    },
    batchTo: {
      type: String,
    },
    sslc: {
      type: String,
    },
    hsc: {
      type: String,
    },
    dob: {
      type: String,
    },
    language: {
      type: Array,
      default: [],
    },
    booked: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    intrest: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const AgriCandidate = mongoose.model('agricandidate', AgriCandidateSchema);

const event_slot_AgriSchema = new mongoose.Schema(
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
    sortCount: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const AgriEventSlot = mongoose.model('AgriEventSlot', event_slot_AgriSchema);

module.exports = {
  AgriCandidate,
  AgriEventSlot,
};
