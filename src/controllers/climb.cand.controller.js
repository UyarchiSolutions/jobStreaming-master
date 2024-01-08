const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ClimbCandService = require('../services/climb.cand.service');
const Token = require('../services/token.service');

const createClimbCand = catchAsync(async (req, res) => {
  const data = await ClimbCandService.createClimbCand(req);
  res.send(data);
});

const ResumeUploadCand = catchAsync(async (req, res) => {
  const data = await ClimbCandService.ResumeUploadCand(req);
  res.send(data);
});

const updateClimbCand = catchAsync(async (req, res) => {
  const data = await ClimbCandService.updateClimbCand(req);
  res.send(data);
});

const VerifyOTP = catchAsync(async (req, res) => {
  const data = await ClimbCandService.VerifyOTP(req);
  res.send(data);
});

const SetPassword = catchAsync(async (req, res) => {
  const data = await ClimbCandService.SetPassword(req);
  res.send(data);
});

const LoginClimbCandidate = catchAsync(async (req, res) => {
  const data = await ClimbCandService.LoginClimbCandidate(req);
  let token = await Token.generateAuthTokens(data);
  console.log(token);
  res.send({ data, token });
});

module.exports = {
  createClimbCand,
  ResumeUploadCand,
  updateClimbCand,
  VerifyOTP,
  SetPassword,
  LoginClimbCandidate,
};
