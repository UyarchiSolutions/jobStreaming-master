const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const faqeService = require('../services/admin.askQuestions.service');

const createfaqe = catchAsync(async (req, res) => {
  const data = await faqeService.createFaqe(req.body);
  res.status(httpStatus.CREATED).send(data);
});

const getAll_faqe = catchAsync(async (req, res) => {
  const data = await faqeService.getAllFaqe(req.params.range, req.params.page);
  res.send(data);
});


const get_Faqe_id = catchAsync(async (req, res) => {
  const data = await faqeService.get_Faqe_id(req.params.id);
  res.send(data);
});

const get_Faqe_update = catchAsync(async (req, res) => {
  const data = await faqeService.get_Faqe_update(req.params.id, req.body);
  res.send(data);
});

const get_Faqe_delete = catchAsync(async (req, res) => {
  const data = await faqeService.get_Faqe_delete(req.params.id);
  res.send(data);
});

const exiting_faqe_data = catchAsync(async (req, res) => {
  const data = await faqeService.exiting_faqe_data();
  res.send(data);
});

const create_enquiry_candidate = catchAsync(async (req, res) => {
  const userId = req.userId;
  const data = await faqeService.create_enquiry_candidate(userId, req.body);
  res.send(data);
});

module.exports = {
  createfaqe,
  getAll_faqe,
  get_Faqe_id,
  get_Faqe_update,
  get_Faqe_delete,
  exiting_faqe_data,
  create_enquiry_candidate,
};