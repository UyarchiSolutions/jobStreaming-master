const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const AgriEventService = require('../services/agri.Event.service');
const { candiRegReceveMail } = require('../services/email.service');

const createAgriEvent = catchAsync(async (req, res) => {
  const data = await AgriEventService.createAgriEvent(req);
  await candiRegReceveMail(data);
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

const createCandidateReview = catchAsync(async (req, res) => {
  const data = await AgriEventService.createCandidateReview(req);
  res.send(data);
});

const ExcelDatas = catchAsync(async (req, res) => {
  const data = await AgriEventService.ExcelDatas(req);
  res.send(data);
});

module.exports = {
  createAgriEvent,
  createSlots,
  slotDetailsAgri,
  updateCandidate,
  getUserById,
  createCandidateReview,
  ExcelDatas,
};
