const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const Jobpost = require('../services/jobpost.service');

// create jobAlert

const get_my_job_post = catchAsync(async (req, res) => {
  const data = await Jobpost.get_my_job_post(req);
  res.status(httpStatus.CREATED).send(data);
});

const toggle_job_post= catchAsync(async (req, res) => {
  const data = await Jobpost.toggle_job_post(req);
  res.status(httpStatus.CREATED).send(data);
});

module.exports = {
  get_my_job_post,
  toggle_job_post

};
