const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const VolunteerService = require('../services/volunteer.service');

const createVolunteer = catchAsync(async (req, res) => {
  const data = await VolunteerService.createVolunteer(req);
  res.send(data);
});

module.exports = {
  createVolunteer,
};
