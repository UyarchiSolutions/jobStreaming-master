const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const AgoraAppId = require('../../services/candidate/candidate.service');


const get_all_candidates = catchAsync(async (req, res) => {
  const data = await AgoraAppId.get_all_candidates(req);
  res.status(httpStatus.CREATED).send(data);
});


const get_applied_jobs = catchAsync(async (req, res) => {
  const data = await AgoraAppId.get_applied_jobs(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_candidate_applies = catchAsync(async (req, res) => {
  const data = await AgoraAppId.get_candidate_applies(req);
  res.status(httpStatus.CREATED).send(data);
});



module.exports = {
  get_all_candidates,
  get_applied_jobs,
  get_candidate_applies

};


