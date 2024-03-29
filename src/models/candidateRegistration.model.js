const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');

const userSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      // used by the toJSON plugin
    },
    // role: {
    //   type: String,
    //   enum: roles,
    //   default: 'user',
    // },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    resume: {
      type: String,
    },
    workStatus: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    adminStatus: {
      type: String,
      default: 'Pending',
      required: true,
    },
    lat: {
      type: String,
    },
    long: {
      type: String,
    },
    location: {
      type: String,
    },
    latestdate: {
      type: String,
    },
    date: {
      type: String,
    },
    data: {
      type: Boolean,
      default: true,
    },
    prevCompany: {
      type: String,
    },
    prevCompanyRole: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const CandidateRegistration = mongoose.model('candidateRegistration', userSchema);
module.exports = CandidateRegistration;
