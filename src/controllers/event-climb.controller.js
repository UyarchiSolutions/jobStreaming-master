const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const climbeventService = require('../services/event-climb.service');

const createEventClimb = catchAsync(async (req, res) => {
  const data = await climbeventService.createEventCLimb(req);
  res.send(data);
});

const getSlots = catchAsync(async (req, res) => {
  const data = await climbeventService.slotDetails();
  res.send(data);
});

const insertSlots = catchAsync(async (req, res) => {
  const data = await climbeventService.insertSlots(req.body);
  res.send(data);
});

const getAllRegistered_Candidate = catchAsync(async (req, res) => {
  const data = await climbeventService.getAllRegistered_Candidate();
  res.send(data);
});

module.exports = {
  createEventClimb,
  getSlots,
  insertSlots,
  getAllRegistered_Candidate,
};
