const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const interview = require('../../services/candidate/interview.service');


const create_new_interview = catchAsync(async (req, res) => {
  const data = await interview.create_new_interview(req);
  res.status(httpStatus.CREATED).send(data);
});

const update_interview= catchAsync(async (req, res) => {
  const data = await interview.update_interview(req);
  res.status(httpStatus.CREATED).send(data);
});


const attachment_interview = catchAsync(async (req, res) => {
  const data = await interview.attachment_interview(req);
  res.status(httpStatus.CREATED).send(data);
});


const get_interview = catchAsync(async (req, res) => {
  const data = await interview.get_interview(req);
  res.status(httpStatus.CREATED).send(data);
});


const get_interview_details= catchAsync(async (req, res) => {
  const data = await interview.get_interview_details(req);
  res.status(httpStatus.CREATED).send(data);
});


const interviewer_login= catchAsync(async (req, res) => {
  const data = await interview.interviewer_login(req);
  res.status(httpStatus.CREATED).send(data);
});


const stream_details= catchAsync(async (req, res) => {
  const data = await interview.stream_details(req);
  res.status(httpStatus.CREATED).send(data);
});








module.exports = {
  create_new_interview,
  attachment_interview,
  get_interview,
  update_interview,
  get_interview_details,
  interviewer_login,
  stream_details
};


