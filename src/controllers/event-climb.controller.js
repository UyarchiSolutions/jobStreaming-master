const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const climbeventService = require('../services/event-climb.service');

const createEventClimb = catchAsync(async (req, res) => {
  const data = await climbeventService.createEventCLimb(req);
  res.send(data);
});

module.exports = {
  createEventClimb,
};
