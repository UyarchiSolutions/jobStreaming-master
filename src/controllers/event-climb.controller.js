const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const climbeventService = require('../services/event-climb.service');
const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');

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

const getSlotDetails_WithCandidate = catchAsync(async (req, res) => {
  const data = await climbeventService.getSlotDetails_WithCandidate();
  res.send(data);
});

const getCandidateBySlot = catchAsync(async (req, res) => {
  const data = await climbeventService.getCandidateBySlot(req);
  res.send(data);
});

const CandidateLogin = catchAsync(async (req, res) => {
  const data = await climbeventService.CandidateLogin(req);
  const tokens = await tokenService.generateAuthTokens(data);
  res.send(tokens);
});

module.exports = {
  createEventClimb,
  getSlots,
  insertSlots,
  getAllRegistered_Candidate,
  getSlotDetails_WithCandidate,
  getCandidateBySlot,
  CandidateLogin,
};
