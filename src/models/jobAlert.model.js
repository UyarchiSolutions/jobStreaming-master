const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const jobAlertSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    keyWords: {
      type: Array,
      default: [],
    },
    userId: {
      type: String,
    },
    cities: {
      type: Array,
    },
    salaryFrom: {
      type: Number,
    },
    salaryTo: {
      type: Number,
    },
    currentIndestry: {
      type: String,
    },
    currentDepartment: {
      type: String,
    },
    jobRole: {
      type: String,
    },
    experienceYearSet: {
      type: Number,
    },
    experienceMonthSet: {
      type: Number,
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

const JobAlert = mongoose.model('jobAlert', jobAlertSchema);
module.exports = JobAlert;
