const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const PlansService = require('../services/plan.service');

const createEmployerPlan = catchAsync(async (req, res) => {
  const data = await PlansService.createEmployerPlan(req.body);
  res.send(data);
});

const getPlanes = catchAsync(async (req, res) => {
  const data = await PlansService.getPlanes();
  res.send(data);
});

const getPlanesForCandidate = catchAsync(async (req, res) => {
  const data = await PlansService.getPlanesForCandidate();
  res.send(data);
});

const purchasedPlanes = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await PlansService.purchasedPlanes(req.body, userId);
  res.send(data);
});

const getPurchasedPlanesByUser = catchAsync(async (req, res) => {
  let userId = req.userId;
  const data = await PlansService.getPurchasedPlanesByUser(userId);
  res.send(data);
});

module.exports = {
  createEmployerPlan,
  getPlanes,
  getPlanesForCandidate,
  purchasedPlanes,
  getPurchasedPlanesByUser,
};
