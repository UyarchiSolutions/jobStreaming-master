const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const JobAlertervice = require('../services/jobAler.service');

// create jobAlert

const createjobAlert = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await JobAlertervice.createjobAlert(req.body, userId);
  res.status(httpStatus.CREATED).send(data);
});

module.exports = {
  createjobAlert,
};
