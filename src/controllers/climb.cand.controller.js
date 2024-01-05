const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ClimbCandService = require('../services/climb.cand.service');

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

module.exports = {
  createClimbCand,
  ResumeUploadCand,
  updateClimbCand,
};
