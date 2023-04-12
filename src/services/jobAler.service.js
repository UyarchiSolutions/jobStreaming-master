const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const jobAlert = require('../models/jobAlert.model');

// create job Alert

const createjobAlert = async (body, userId) => {
  let findData = await jobAlert.findOne({ userId: userId }).sort({ createdAt: -1 });
  if (findData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already available alert in this user');
  }
  let values = { ...body, ...{ userId: userId } };
  const data = await jobAlert.create(values);
};

module.exports = {
  createjobAlert,
};
