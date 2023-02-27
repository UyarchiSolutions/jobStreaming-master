const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const employerCandidateSearch = require('../services/employerCandidateSearch.service');


const createCandidateSearch = catchAsync(async (req, res) => {
    let userId = req.userId
  const user = await employerCandidateSearch.createCandidateSearch(userId, req.body);
  res.status(httpStatus.CREATED).send({ user }
    );
});

const createSaveSeprate = catchAsync(async (req, res) => {
    let userId = req.userId
  const user = await employerCandidateSearch.createSaveSeprate(userId, req.body);
  res.status(httpStatus.CREATED).send(user);
});


const getSaveSeprate = catchAsync(async (req, res) => {
    let userId = req.userId
  const user = await employerCandidateSearch.getSaveSeprate(userId, req.params.range, req.params.page);
  res.status(httpStatus.CREATED).send(user);
});

const delete_Seprate_saveCandidate = catchAsync(async (req, res) => {
  const user = await employerCandidateSearch.delete_Seprate_saveCandidate(req.params.id);
  res.send(user)
});

const searchQuery = catchAsync(async(req,res) => {
    // console.log(req.query)
    const user = await employerCandidateSearch.searchCandidate(req.body)
    res.send({user})
})

const employerSearchCandidate = catchAsync(async(req,res) => {
    // console.log(req.query)
    const user = await employerCandidateSearch.employerSearchCandidate(req.params.id)
    res.send({user})
})

const createSavetoFolder = catchAsync(async (req, res) => {
    const userId = req.userId
  const user = await employerCandidateSearch.createSavetoFolder(userId, req.body);
  res.status(httpStatus.CREATED).send(user);
});


const employerPost_Jobs = catchAsync(async (req, res) => {
    const userId = req.userId
  const user = await employerCandidateSearch.employerPost_Jobs(userId);
  res.send({user})
});

const employer_job_post_edit = catchAsync(async (req, res) => {
  const user = await employerCandidateSearch.employer_job_post_edit(req.params.id, req.body);
  res.send({user})
});


const candidate_applied_Details = catchAsync(async (req, res) => {
    const user = await employerCandidateSearch.candidate_applied_Details(req.params.id);
    res.send({user})
});

const candidate_applied_Details_view = catchAsync(async (req, res) => {
    const user = await employerCandidateSearch.candidate_applied_Details_view(req.params.id);
    res.send({user})
});

const saveSearchData_EmployerSide = catchAsync(async (req, res) => {
    const userId = req.userId
    const user = await employerCandidateSearch.saveSearchData_EmployerSide(userId);
    res.send({user})
});

const employerRemovePostJobs = catchAsync(async(req,res) => {
    const user = await employerCandidateSearch.employerRemovePostJobs(req.params.id)
    res.send()
})


const allFolderData = catchAsync(async(req,res) => {
    // const userId = req.userId
    const user = await employerCandidateSearch.allFolderData(req.query.id, req.query.folderName)
    res.send(user)
})



const candidatdeSaveJobRemove = catchAsync(async (req, res) => {
    const user = await employerCandidateSearch.candidatdeSaveJobRemove(req.params.id);
     res.send()
  });


  const saveFolderData_view = catchAsync(async(req,res) => {
    const userId = req.userId
    const user = await employerCandidateSearch.saveFolderData_view(userId)
    res.send({user})
})

const outSearch_employer = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.outSearch_employer(userId, req.body)
  res.send({user})
})

const outSearchSave = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.outSearchSave(userId, req.body)
  res.send(user)
})


const outSearchRecentSearch = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.outSearchRecentSearch(userId, req.body)
  res.send(user)
})


const outSearchSaveData = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.outSearchSaveData(userId, req.body)
  res.send(user)
})

const recent_search_byId = catchAsync(async(req,res) => {
  const user = await employerCandidateSearch.recent_search_byId(req.params.id)
  res.send(user)
})

const recent_searchSave_byId = catchAsync(async(req,res) => {
  const user = await employerCandidateSearch.recent_searchSave_byId(req.params.id)
  res.send(user)
})

const delete_folder = catchAsync(async(req,res) => {
  const user = await employerCandidateSearch.delete_folder(req.params.id, req.params.folder)
  res.send(user)
})

const delete_one_data = catchAsync(async(req,res) => {
  const user = await employerCandidateSearch.delete_one_data(req.body)
  res.send(user)
})

const saveFolderData_view_All_data = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.saveFolderData_view_All_data(userId)
  res.send({user})
})

const outSearchSaveData_all = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.outSearchSaveData_all(userId)
  res.send({user})
})

const edit_all_folder = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerCandidateSearch.edit_all_folder(userId, req.body)
  res.send(user)
})

const recent_saver_search_delete = catchAsync(async(req,res) => {
  const user = await employerCandidateSearch.recent_saver_search_delete(req.body)
  res.send(user)
})
module.exports = {
    createCandidateSearch,
    searchQuery,
    employerSearchCandidate,
    createSavetoFolder,
    employerPost_Jobs,
    employer_job_post_edit,
    candidate_applied_Details,
    candidate_applied_Details_view,
    saveSearchData_EmployerSide,
    employerRemovePostJobs,
    allFolderData,
    candidatdeSaveJobRemove,
    saveFolderData_view,
    createSaveSeprate,
    getSaveSeprate,
    delete_Seprate_saveCandidate,
    outSearch_employer,
    outSearchSave,
    outSearchRecentSearch,
    outSearchSaveData,
    recent_search_byId,
    recent_searchSave_byId,
    delete_folder,
    delete_one_data,
    saveFolderData_view_All_data,
    outSearchSaveData_all,
    edit_all_folder,
    recent_saver_search_delete,
};