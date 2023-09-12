const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');

const userEmpSchema = mongoose.Schema(
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
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    adminStatus: {
      type: String,
      default: 'Pending',
    },
    // role: {
    //   type: String,
    //   enum: roles,
    //   default: 'user',
    // },
    companyType: {
      type: String,
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    lat: {
      type: String,
    },
    long: {
      type: String,
    },
    logo: {
      type: String,
    },
    aboutCompany: {
      type: String,
    },
    choosefile: {
      type: String,
    },
    location: {
      type: String,
    },
    freePlanCount: {
      type: Number,
      default: 1,
    },
    latestdate: {
      type: String,
    },
    registrationType: {
      type: String,
    },
    industryType: {
      type: String,
    },
    companyWebsite: {
      type: String,
    },
    postedBy: {
      type: String,
    },
    data: {
      type: Boolean,
      default: true,
    },
    companyDescription: {
      type: String,
    },
    companyAddress: {
      type: String,
    },
    lat: {
      type: String,
    },
    long: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userEmpSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userEmpSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userEmpSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const EmployerRegistration = mongoose.model('employerRegistration', userEmpSchema);
module.exports = EmployerRegistration;
