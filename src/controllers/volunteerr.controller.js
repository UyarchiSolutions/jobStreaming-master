const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const VolunteerService = require('../services/volunteer.service');
const { volunteerMailVerification } = require('../services/email.service');

const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');

const createVolunteer = catchAsync(async (req, res) => {
  const data = await VolunteerService.createVolunteer(req);
  await volunteerMailVerification(data);
  res.send(data);
});

const setPassword = catchAsync(async (req, res) => {
  const data = await VolunteerService.setPassword(req);
  res.send(data);
});

const Login = catchAsync(async (req, res) => {
  const data = await VolunteerService.Login(req);
  const token = await tokenService.generateAuthTokens(data);
  res.send(token);
});

const getProfile = catchAsync(async (req, res) => {
  const data = await VolunteerService.getProfile(req);
  res.send(data);
});

const MatchCandidate = catchAsync(async (req, res) => {
  const data = await VolunteerService.MatchCandidate(req);
  res.send(data);
});

const CandidateIntrestUpdate = catchAsync(async (req, res) => {
  const data = await VolunteerService.CandidateIntrestUpdate(req);
  res.send(data);
});

const uploadProfileImage = catchAsync(async (req, res) => {
  const data = await VolunteerService.uploadProfileImage(req);
  res.send(data);
});

const getVolunteersDetails = catchAsync(async (req, res) => {
  const data = await VolunteerService.getVolunteersDetails(req);
  res.send(data);
});

module.exports = {
  createVolunteer,
  setPassword,
  Login,
  getProfile,
  MatchCandidate,
  CandidateIntrestUpdate,
  uploadProfileImage,
  getVolunteersDetails,
};
