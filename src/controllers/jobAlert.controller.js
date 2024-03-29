const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const JobAlertervice = require('../services/jobAler.service');

// create jobAlert

const createjobAlert = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await JobAlertervice.createjobAlert(req.body, userId);
  res.status(httpStatus.CREATED).send(data);
});

const updateJobAlert = catchAsync(async (req, res) => {
  const data = await JobAlertervice.updateJobAlert(req.params.id, req.body);
  res.send(data);
});

const getjobAlertbyUser = catchAsync(async (req, res) => {
  const userId = req.userId;
  const data = await JobAlertervice.getjobAlertbyUser(userId);
  res.send(data);
});

const getJobAlert_Response = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await JobAlertervice.getJobAlert_Response(userId);
  res.send(data);
});

module.exports = {
  createjobAlert,
  updateJobAlert,
  getJobAlert_Response,
  getjobAlertbyUser,
};
