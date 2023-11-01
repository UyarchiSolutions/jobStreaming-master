const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const candidateDetailsService = require('../services/candidateDetails.service');
const User = require('../models/user.model');

const createkeySkill = catchAsync(async (req, res) => {
  console.log(req.userId);
  const userId = req.userId;
  const user = await candidateDetailsService.createkeySkill(userId, req.body);
  // console.log(req.files)
  if (req.files) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'resumes/images/' + files.filename;
    });
    user.image = path;
  }
  res.status(httpStatus.CREATED).send({ user });
  await user.save();
});

const getByIdUser = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.getByIdUser(userId);
  res.send({ user });
});

const updateById = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.updateById(userId, req.body);
  console.log(req.files);
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'resumes/images/' + files.filename;
    });
    user.image = path;
  }
  await user.save();
  res.send({ user });
});

const updateByIdImage = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.updateByIdImage(req.params.id, req.body);
  // console.log(req.files)
  if (req.files.length != 0) {
    let path = '';
    req.files.forEach(function (files, index, arr) {
      path = 'resumes/images/' + files.filename;
    });
    user.image = path;
  }
  await user.save();
  res.send({ user });
});

const updateEducation = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.updateEducation(userId, req.body);
  await user.save();
  res.send(user);
});

const edit_details = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.edit_details(userId, req.body);
  res.send(user);
});

const deleteById = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.deleteById(req.params.id);
  res.send({ user });
});

const candidateSearch = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.candidateSearch(req.body);
  res.send({ user });
});

const getByIdEmployerDetailsShownCandidate = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.getByIdEmployerDetailsShownCandidate(req.params.id, userId);
  res.send(user);
});

const createCandidatePostjob = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.createCandidatePostjob(userId, req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const createCandidateSavejob = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.createCandidateSavejob(userId, req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const getByIdAppliedJobs = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.getByIdAppliedJobs(userId, req.params.search, req.query);
  res.send(user);
});

const applyJobsView = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.applyJobsView(req.params.userId);
  res.send(user);
});

const deleteByIdSavejOb = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.deleteByIdSavejOb(req.params.id);
  res.send(user);
});

const getByIdSavedJobs = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.getByIdSavedJobs(userId, req.query);
  res.send(user);
});

const getByIdSavedJobsView = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.getByIdSavedJobs(req.params.userId);
  res.send(user);
});

// const createSearchCandidate = catchAsync(async (req, res) => {
//   const user = await candidateDetailsService.createSearchCandidate(req.body);
//   res.status(httpStatus.CREATED).send({ user }
//     );
//   });

const autojobSearch = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.autojobSearch(userId);
  res.send(user);
});

const createdSearchhistory = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.createdSearchhistory(userId, req.body);
  res.send(user);
});

const createdSearchhistoryData = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await candidateDetailsService.createdSearchhistoryData(userId, req.body);
  res.send(user);
});

const CandidateRegistrations = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.CandidateRegistrations(req.params.page);
  res.send(user);
});

const updateByIdCandidateRegistration = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.updateByIdCandidateRegistration(req.params.id, req.body);
  res.send(user);
});

const createSetSearchEmployerData = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await candidateDetailsService.createSetSearchEmployerData(userId, req.body);
  res.status(httpStatus.CREATED).send({ user });
});

const updateByIdcandidataSearchEmployerSet = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.updateByIdcandidataSearchEmployerSet(req.params.id, req.body);
  res.send(user);
});

const SearchByIdcandidataSearchEmployerSet = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await candidateDetailsService.SearchByIdcandidataSearchEmployerSet(userId);
  res.send(user);
});

const getByIdEmployerDetails = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.getByIdEmployerDetails(req.params.id);
  res.send(user);
});

const candidateSearch_front_page = catchAsync(async (req, res) => {
  const userId = req.userId?req.userId:"";
  const user = await candidateDetailsService.candidateSearch_front_page(userId, req.body);
  res.send(user);
});

const recentSearch = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await candidateDetailsService.recentSearch(userId);
  res.send(user);
});

const educationDetails = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await candidateDetailsService.educationDetails(userId, req.body);
  res.send(user);
});

const languages = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.languages();
  res.send(user);
});

const recentSearch_byId = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.recentSearch_byId(req.params.id);
  res.send(user);
});

const candidate_detials = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.candidate_detials(req.params.id, req.params.jobid);
  res.send(user);
});

const createdSearchhistoryData_byId = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.createdSearchhistoryData_byId(req.params.id);
  res.send(user);
});

const candidate_detials_id = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.candidate_detials_id(req.params.id);
  res.send(user);
});

const get_all_candidates = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.get_all_candidates(req.body);
  res.send(user);
});

const CandidateRegistration_names = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.CandidateRegistration_names(req.params.key);
  res.send(user);
});

const CandidateRegistration_number = catchAsync(async (req, res) => {
  const user = await candidateDetailsService.CandidateRegistration_number(req.params.key);
  res.send(user);
});

const DeleteResume = catchAsync(async (req, res) => {
  let userId = req.userId;
  const users = await candidateDetailsService.DeleteResume(userId);
  res.send(users);
});

const getAllAppliedJobsByCandidate = catchAsync(async (req, res) => {
  let userId = req.userId;
  const jobs = await candidateDetailsService.getAllAppliedJobsByCandidate(userId);
  res.send(jobs);
});

const recentSearchByCandidate = catchAsync(async (req, res) => {
  let userId = req.userId;
  const jobs = await candidateDetailsService.recentSearchByCandidate(req.body, userId);
  res.send(jobs);
});

const get_SavedJobs_Candidate = catchAsync(async (req, res) => {
  let userId = req.userId;
  const jobs = await candidateDetailsService.get_SavedJobs_Candidate(userId);
  res.send(jobs);
});

module.exports = {
  createkeySkill,
  getByIdUser,
  updateById,
  deleteById,
  candidateSearch,
  getByIdEmployerDetailsShownCandidate,
  createCandidatePostjob,
  createCandidateSavejob,
  getByIdAppliedJobs,
  deleteByIdSavejOb,
  getByIdSavedJobs,
  applyJobsView,
  getByIdSavedJobsView,
  autojobSearch,
  createdSearchhistory,
  CandidateRegistrations,
  updateByIdCandidateRegistration,
  createSetSearchEmployerData,
  updateByIdcandidataSearchEmployerSet,
  SearchByIdcandidataSearchEmployerSet,
  getByIdEmployerDetails,
  candidateSearch_front_page,
  recentSearch,
  updateByIdImage,
  educationDetails,
  languages,
  createdSearchhistoryData,
  recentSearch_byId,
  candidate_detials,
  updateEducation,
  createdSearchhistoryData_byId,
  edit_details,
  candidate_detials_id,
  get_all_candidates,
  CandidateRegistration_names,
  CandidateRegistration_number,
  // createSearchCandidate,
  DeleteResume,
  getAllAppliedJobsByCandidate,
  recentSearchByCandidate,
  get_SavedJobs_Candidate,
};
