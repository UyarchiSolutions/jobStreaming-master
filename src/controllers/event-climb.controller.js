const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const climbeventService = require('../services/event-climb.service');
const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');

const createEventClimb = catchAsync(async (req, res) => {
  const data = await climbeventService.createEventCLimb(req);
  console.log(data);
  await emailService.sendsuccessTestMail(data);
  res.send(data);
});

const createEventClimb_intern = catchAsync(async (req, res) => {
  console.log('dfjhhjjhmjh');
  const data = await climbeventService.createEventCLimb_intern(req);
  console.log(data);
  await emailService.sendsuccessTestMail(data);
  res.send(data);
});

const createEventClimb_it = catchAsync(async (req, res) => {
  console.log('dfjhhjjhmjh');
  const data = await climbeventService.createEventClimb_it(req);
  console.log(data);
  await emailService.sendsuccessTestMail(data);
  res.send(data);
});

const createEventClimb_hr = catchAsync(async (req, res) => {
  console.log('dfjhhjjhmjh');
  const data = await climbeventService.createEventClimb_hr(req);
  console.log(data);
  await emailService.sendsuccessTestMail(data);
  res.send(data);
});

const getSlots = catchAsync(async (req, res) => {
  const data = await climbeventService.slotDetails();
  res.send(data);
});
// slotDetails_intern

const getSlots_intern = catchAsync(async (req, res) => {
  const data = await climbeventService.slotDetails_intern();
  res.send(data);
});

const insertSlots = catchAsync(async (req, res) => {
  const data = await climbeventService.insertSlots(req.body);
  res.send(data);
});

const insertSlots_intern = catchAsync(async (req, res) => {
  const data = await climbeventService.insertSlots_intern(req.body);
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

const updateTestWarmyNew = catchAsync(async (req, res) => {
  const data = await climbeventService.updateTestWarmyNew(req);
  await emailService.sendsuccessTestMailNew(data);
  res.send(data);
});

const updateTestIntern = catchAsync(async (req, res) => {
  const data = await climbeventService.updateTestIntern(req);
  await emailService.sendsuccessTestMailNew(data);
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

const getTestUsersNew = catchAsync(async (req, res) => {
  const data = await climbeventService.getTestUsersNew(req);
  res.send(data);
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await climbeventService.updateStatus(req);
  res.send(data);
});

const insertSlotsTestNew = catchAsync(async (req, res) => {
  const data = await climbeventService.insertSlotsTestNew(req);
  res.send(data);
});

const slotDetailsTestNewHR = catchAsync(async (req, res) => {
  const data = await climbeventService.slotDetailsTestNewHR();
  res.send(data);
});

const slotDetailsTestNewTech = catchAsync(async (req, res) => {
  const data = await climbeventService.slotDetailsTestNewTech();
  res.send(data);
});

const getWorkShopCand = catchAsync(async (req, res) => {
  const data = await climbeventService.getWorkShopCand(req);
  res.send(data);
});

const verify_cand_Intern = catchAsync(async (req, res) => {
  const data = await climbeventService.verify_cand_Intern(req);
  res.send(data);
});

const getInternSlots = catchAsync(async (req, res) => {
  const data = await climbeventService.getInternSlots(req);
  res.send(data);
});

const getWorkshopCandidatesBySlot = catchAsync(async (req, res) => {
  const data = await climbeventService.getWorkshopCandidatesBySlot(req);
  res.send(data);
});

const generate_pdf = catchAsync(async (req, res) => {
  console.log(true)
  const data = await climbeventService.generate_pdf(req);
  res.send(data);
});

const verify_mobile= catchAsync(async (req, res) => {
  console.log(true)
  const data = await climbeventService.verify_mobile(req);
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
  insertSlotsTestNew,
  slotDetailsTestNewHR,
  slotDetailsTestNewTech,
  updateTestWarmyNew,
  getTestUsersNew,
  insertSlots_intern,
  getSlots_intern,
  createEventClimb_intern,
  getWorkShopCand,
  verify_cand_Intern,
  updateTestIntern,
  getInternSlots,
  getWorkshopCandidatesBySlot,
  createEventClimb_it,
  createEventClimb_hr,
  generate_pdf,
  verify_mobile
};
