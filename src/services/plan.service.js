const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const jobAlert = require('../models/jobAlert.model');
const { EmployerPlan } = require('../models/plans.mode');
const moment = require('moment');

const createEmployerPlan = async (body) => {
  let values = await EmployerPlan.create({
    ...body,
    ...{ planType: 'normal', Time: new Date().getTime(), DateIso: moment() },
  });
  return values;
};

module.exports = {
  createEmployerPlan,
};
