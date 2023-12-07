const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const AgriEventService = require('../services/agri.Event.service');

const createAgriEvent = catchAsync(async (req, res) => {
  const data = await AgriEventService.createAgriEvent(req);
  res.send(data);
});

const createSlots = catchAsync(async (req, res) => {
  const data = await AgriEventService.createSlots(req);
  res.send(data);
});

const slotDetailsAgri = catchAsync(async (req, res) => {
  const data = await AgriEventService.slotDetailsAgri();
  res.send(data);
});

const updateCandidate = catchAsync(async (req, res) => {
  const data = await AgriEventService.updateCandidate(req);
  res.send(data);
});

const getUserById = catchAsync(async (req, res) => {
  const data = await AgriEventService.getUserById(req);
  res.send(data);
});

module.exports = {
  createAgriEvent,
  createSlots,
  slotDetailsAgri,
  updateCandidate,
  getUserById,
};
