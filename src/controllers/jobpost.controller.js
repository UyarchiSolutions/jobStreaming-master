const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const Jobpost = require('../services/jobpost.service');

// create jobAlert

const get_my_job_post = catchAsync(async (req, res) => {
  const data = await Jobpost.get_my_job_post(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_my_job_post_draft = catchAsync(async (req, res) => {
  const data = await Jobpost.get_my_job_post_draft(req);
  res.status(httpStatus.CREATED).send(data);
});

const toggle_job_post = catchAsync(async (req, res) => {
  const data = await Jobpost.toggle_job_post(req);
  res.status(httpStatus.CREATED).send(data);
});
const toggle_job_stream = catchAsync(async (req, res) => {
  const data = await Jobpost.toggle_job_stream(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_post_details = catchAsync(async (req, res) => {
  const data = await Jobpost.get_post_details(req);
  res.status(httpStatus.CREATED).send(data);
});
const update_employer_post = catchAsync(async (req, res) => {
  const data = await Jobpost.update_employer_post(req);
  res.status(httpStatus.CREATED).send(data);
});

const update_employer_post_draft = catchAsync(async (req, res) => {
  const data = await Jobpost.update_employer_post_draft(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_active_postes = catchAsync(async (req, res) => {
  const data = await Jobpost.get_active_postes(req);
  res.status(httpStatus.CREATED).send(data);
});

const create_stream_request = catchAsync(async (req, res) => {
  const data = await Jobpost.create_stream_request(req);
  res.status(httpStatus.CREATED).send(data);
});

const update_stream_request = catchAsync(async (req, res) => {
  const data = await Jobpost.update_stream_request(req);
  res.status(httpStatus.CREATED).send(data);
});


const get_my_job_stream = catchAsync(async (req, res) => {
  const data = await Jobpost.get_my_job_stream(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_post_details_single = catchAsync(async (req, res) => {
  const data = await Jobpost.get_post_details_single(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_post_details_candidateAuth = catchAsync(async (req, res) => {
  const data = await Jobpost.get_post_details_candidateAuth(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_post_details_completed = catchAsync(async (req, res) => {
  const data = await Jobpost.get_post_details_completed(req);
  res.status(httpStatus.CREATED).send(data);
});




const apply_candidate_jobpost_onlive = catchAsync(async (req, res) => {
  const data = await Jobpost.apply_candidate_jobpost_onlive(req);
  res.status(httpStatus.CREATED).send(data);
});

const apply_candidate_jobpost_completed = catchAsync(async (req, res) => {
  const data = await Jobpost.apply_candidate_jobpost_completed(req);
  res.status(httpStatus.CREATED).send(data);
});

const apply_candidate_jobpost = catchAsync(async (req, res) => {
  const data = await Jobpost.apply_candidate_jobpost(req);
  res.status(httpStatus.CREATED).send(data);
});


const saved_post_candidate = catchAsync(async (req, res) => {
  const data = await Jobpost.saved_post_candidate(req);
  res.status(httpStatus.CREATED).send(data);
});




// manage recruiters 

const create_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.create_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});


const update_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.update_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.get_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_all_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.get_all_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});

const delete_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.delete_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});

const toggle_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.toggle_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});


const list_recruiters = catchAsync(async (req, res) => {
  const data = await Jobpost.list_recruiters(req);
  res.status(httpStatus.CREATED).send(data);
});







// manage Interviewers 

const create_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.create_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});


const update_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.update_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.get_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});

const get_all_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.get_all_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});

const delete_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.delete_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});

const toggle_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.toggle_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});


const list_interviewer = catchAsync(async (req, res) => {
  const data = await Jobpost.list_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});


const resume_interviewer= catchAsync(async (req, res) => {
  const data = await Jobpost.resume_interviewer(req);
  res.status(httpStatus.CREATED).send(data);
});








module.exports = {
  get_my_job_post,
  toggle_job_post,
  get_post_details,
  update_employer_post,
  update_employer_post_draft,
  get_my_job_post_draft,
  get_active_postes,
  create_stream_request,
  get_my_job_stream,
  update_stream_request,
  get_post_details_single,
  get_post_details_candidateAuth,
  apply_candidate_jobpost_onlive,
  apply_candidate_jobpost_completed,
  apply_candidate_jobpost,
  saved_post_candidate,
  toggle_job_stream,
  create_recruiters,
  update_recruiters,
  get_recruiters,
  get_all_recruiters,
  delete_recruiters,
  toggle_recruiters,
  list_recruiters,
  get_post_details_completed,
  create_interviewer,
  update_interviewer,
  get_interviewer,
  get_all_interviewer,
  delete_interviewer,
  toggle_interviewer,
  list_interviewer,
  resume_interviewer
};
