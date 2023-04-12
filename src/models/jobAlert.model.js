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
    cities: {
      type: Array,
    },
    salaryFrom: {
      type: String,
    },
    salaryTo: {
      type: String,
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
    experienceYearSet:{
        type:String,
    },
    experienceMonthSet:{
        type:String
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
