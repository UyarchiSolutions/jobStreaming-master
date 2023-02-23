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

const create_enquiry_dummy = catchAsync(async (req, res) => {
  const data = await faqeService.create_enquiry_dummy(req.body);
  res.send(data);
});


const get_all_enquiry = catchAsync(async (req, res) => {
  const data = await faqeService.get_all_enquiry(req.params.range, req.params.page);
  res.send(data);
});

const get_id_enquiry = catchAsync(async (req, res) => {
  const data = await faqeService.get_id_enquiry(req.params.id);
  res.send(data);
});

const get_Enquiry_update = catchAsync(async (req, res) => {
  const data = await faqeService.get_Enquiry_update(req.params.id, req.body);
  res.send(data);
});

const reply_enquiry = catchAsync(async (req, res) => {
  const data = await faqeService.reply_enquiry(req.body);
  res.send(data);
});

const create_report = catchAsync(async (req, res) => {
  const userId = req.userId;
  const data = await faqeService.create_report(userId, req.body);
  res.send(data);
});


const all_report = catchAsync(async (req, res) => {
  const data = await faqeService.all_report(req.params.range, req.params.page);
  res.send(data);
});

const deactive_admin = catchAsync(async (req, res) => {
  const data = await faqeService.deactive_admin(req.params.id);
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
  get_all_enquiry,
  get_id_enquiry,
  create_enquiry_dummy,
  get_Enquiry_update,
  reply_enquiry,
  create_report,
  all_report,
  deactive_admin,
};