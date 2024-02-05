const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const Jobpost = require('../services/jobpost.service');

// create jobAlert

const get_my_job_post = catchAsync(async (req, res) => {
  const data = await Jobpost.get_my_job_post(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_my_job_post_draft= catchAsync(async (req, res) => {
  const data = await Jobpost.get_my_job_post_draft(req);
  res.status(httpStatus.CREATED).send(data);
});

const toggle_job_post= catchAsync(async (req, res) => {
  const data = await Jobpost.toggle_job_post(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_post_details= catchAsync(async (req, res) => {
  const data = await Jobpost.get_post_details(req);
  res.status(httpStatus.CREATED).send(data);
});
const update_employer_post= catchAsync(async (req, res) => {
  const data = await Jobpost.update_employer_post(req);
  res.status(httpStatus.CREATED).send(data);
});

const update_employer_post_draft= catchAsync(async (req, res) => {
  const data = await Jobpost.update_employer_post_draft(req);
  res.status(httpStatus.CREATED).send(data);
});

module.exports = {
  get_my_job_post,
  toggle_job_post,
  get_post_details,
  update_employer_post,
  update_employer_post_draft,
  get_my_job_post_draft
};
