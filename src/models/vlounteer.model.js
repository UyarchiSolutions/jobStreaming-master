const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { v4 } = require('uuid');

const VolunteerSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  Role: {
    type: String,
  },
  password: {
    type: String,
  },
  mobileNumber: {
    type: Number,
  },
  email: {
    type: String,
  },
  experience: {
    type: Object,
  },
  hrExperience: {
    type: Object,
  },
  workStatus: {
    type: String,
  },
  currentCTC: {
    type: String,
  },
  currentLocation: {
    type: String,
  },
  language: {
    type: Object,
  },
  coreExperience: {
    type: Object,
  },
  skills: {
    type: Object,
  },
  currentSkill: {
    type: Object,
  },
  evalutionSkill: {
    type: Object,
  },
  profileImage: {
    type: String,
  },
  DOB: {
    type: String,
  },
  currentIntestry: {
    type: String,
  },
  currentDepartment: {
    type: String,
  },
  roleCategory: {
    type: String,
  },
  Role: {
    type: Object,
  },
  Education: {
    type: Object,
  },
});

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
VolunteerSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

VolunteerSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const Volunteer = mongoose.model('volunteer', VolunteerSchema);

module.exports = {
  Volunteer,
};
