const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const climbeventService = require('../services/event-climb.service');
const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');

const createEventClimb = catchAsync(async (req, res) => {
  const data = await climbeventService.createEventCLimb(req);
  console.log(data)
  await emailService.sendsuccessTestMail(data);
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
  const data = await climbeventService.getAllRegistered_Candidate(req.query);
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

const getDetailsByCandidate = catchAsync(async (req, res) => {
  const data = await climbeventService.getDetailsByCandidate(req);
  res.send(data);
});

const updateProfileCandidate = catchAsync(async (req, res) => {
  const data = await climbeventService.updateProfileCandidate(req);
  res.send(data);
});

const verify_cand = catchAsync(async (req, res) => {
  const data = await climbeventService.verify_cand(req);
  res.send(data);
});

const updateTestWarmy = catchAsync(async (req, res) => {
  const data = await climbeventService.updateTestWarmy(req);
  await emailService.sendsuccessTestMail(data);
  res.send(data);
});

const insertSlotsTest = catchAsync(async (req, res) => {
  const data = await climbeventService.insertSlotsTest(req);
  res.send(data);
});

const slotDetailsTest = catchAsync(async (req, res) => {
  const data = await climbeventService.slotDetailsTest();
  res.send(data);
});

const createTestCandidates = catchAsync(async (req, res) => {
  const data = await climbeventService.createTestCandidates(req);
  res.send(data);
});

const getTestUsers = catchAsync(async (req, res) => {
  const data = await climbeventService.getTestUsers(req);
  res.send(data);
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await climbeventService.updateStatus(req);
  res.send(data);
});

module.exports = {
  createEventClimb,
  getSlots,
  insertSlots,
  getAllRegistered_Candidate,
  getSlotDetails_WithCandidate,
  getCandidateBySlot,
  CandidateLogin,
  getDetailsByCandidate,
  updateProfileCandidate,
  verify_cand,
  updateTestWarmy,
  insertSlotsTest,
  slotDetailsTest,
  createTestCandidates,
  getTestUsers,
  updateStatus,
};
