const mongoose = require('mongoose');
const { v4 } = require('uuid');

const ClimbCandidateSchema = new mongoose.Schema(
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
    slotbooked: {
      type: Boolean,
      default: false,
    },
    Instituitionname: {
      type: String,
    },
    affiliateduniversity: {
      type: String,
    },
    Education: {
      type: String,
    },
    course: {
      type: String,
    },
    yearOfPassing: {
      type: String,
    },
    intrest: {
      type: Array,
      default: [],
    },
    techIntrest: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: 'Pending',
    },
    clear: {
      type: Boolean,
      default: false,
    },
    resume: {
      type: String,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true }
);

const ClimbCandidate = mongoose.model('climbcandidate', ClimbCandidateSchema);

const SaveCandidateOTPSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    OTP: {
      type: Number,
    },
    Mobile: {
      type: Number,
    },
    Used: {
      type: Boolean,
      default: false,
    },
    ExpireTime: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CandOTP = mongoose.model('ClimbOTP', SaveCandidateOTPSchema);

module.exports = {
  ClimbCandidate,
  CandOTP,
};
