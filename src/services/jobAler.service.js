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
  return data;
};

const getjobAlertbyUser = async (userId) => {
  const data = await jobAlert.findOne({ userId: userId }).sort({ createdAt: -1 });
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Job ALert Not Available for this user');
  }
  return data;
};

const updateJobAlert = async (id, body) => {
  let data = await jobAlert.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Job ALert Not Available for this user');
  }
  data = await jobAlert.findByIdAndUpdate({ _id: id }, body, { new: true });
  return data;
};

module.exports = {
  createjobAlert,
  getjobAlertbyUser,
  updateJobAlert,
};
