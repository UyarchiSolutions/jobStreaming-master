const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const jobAlert = require('../models/jobAlert.model');
const { EmployerPlan } = require('../models/plans.mode');
const moment = require('moment');

const GstCalculation = (amount, gstRate) => {
  if (isNaN(amount) || isNaN(gstRate) || amount < 0 || gstRate < 0) {
    return 'Invalid input. Please provide valid numbers.';
  }
  // Calculate the GST amount
  const gstAmount = (parseInt(amount) * gstRate) / 100;

  // Calculate the total amount including GST
  const totalAmount = parseInt(amount) + gstAmount;

  return {
    originalAmount: amount,
    gstRate: gstRate,
    gstAmount: gstAmount,
    totalAmount: totalAmount,
  };
};

const createEmployerPlan = async (body) => {
  let values = await EmployerPlan.create({
    ...body,
    ...{ planType: 'normal', Time: new Date().getTime(), DateIso: moment() },
  });
  return values;
};

const getPlanes = async () => {
  let values = await EmployerPlan.aggregate([
    {
      $match: {
        active: true,
        userType: { $ne: 'Candidate' },
      },
    },
  ]);
  return values;
};

const getPlanesForCandidate = async () => {
  let values = await EmployerPlan.aggregate([
    {
      $match: {
        active: true,
        userType: { $eq: 'Candidate' },
      },
    },
  ]);
  return values;
};

module.exports = {
  createEmployerPlan,
  getPlanes,
  getPlanesForCandidate,
};
