const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const interview = require('../../services/candidate/interview.service');


const create_new_interview = catchAsync(async (req, res) => {
  const data = await interview.create_new_interview(req);
  res.status(httpStatus.CREATED).send(data);
});


const attachment_interview = catchAsync(async (req, res) => {
  const data = await interview.attachment_interview(req);
  res.status(httpStatus.CREATED).send(data);
});







module.exports = {
  create_new_interview,
  attachment_interview

};


