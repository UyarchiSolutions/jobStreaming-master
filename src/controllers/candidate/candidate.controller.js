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
const applied_candidate_details = catchAsync(async (req, res) => {
  const data = await AgoraAppId.applied_candidate_details(req);
  res.status(httpStatus.CREATED).send(data);
});

const shortlist_candidate = catchAsync(async (req, res) => {
  const data = await AgoraAppId.shortlist_candidate(req);
  res.status(httpStatus.CREATED).send(data);
});

const reject_candidate = catchAsync(async (req, res) => {
  const data = await AgoraAppId.reject_candidate(req);
  res.status(httpStatus.CREATED).send(data);
});

const shortlist_candidate_multible = catchAsync(async (req, res) => {
  const data = await AgoraAppId.shortlist_candidate_multible(req);
  res.status(httpStatus.CREATED).send(data);
});
const reject_candidate_multible = catchAsync(async (req, res) => {
  const data = await AgoraAppId.reject_candidate_multible(req);
  res.status(httpStatus.CREATED).send(data);
});

const undo_candidate = catchAsync(async (req, res) => {
  const data = await AgoraAppId.undo_candidate(req);
  res.status(httpStatus.CREATED).send(data);
});

const move_to_interview = catchAsync(async (req, res) => {
  const data = await AgoraAppId.move_to_interview(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_my_interviews = catchAsync(async (req, res) => {
  const data = await AgoraAppId.get_my_interviews(req);
  res.status(httpStatus.CREATED).send(data);
});





module.exports = {
  get_all_candidates,
  get_applied_jobs,
  get_candidate_applies,
  applied_candidate_details,
  shortlist_candidate,
  reject_candidate,
  undo_candidate,
  move_to_interview,
  shortlist_candidate_multible,
  reject_candidate_multible,
  get_my_interviews

};


