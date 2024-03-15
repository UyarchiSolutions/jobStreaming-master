const express = require('express');
const validate = require('../../middlewares/validate');
const employerCandidateSearch = require('../../controllers/employerCandidateSearch.controller');
const authorization = require('../../controllers/empVEridy.controller');

const router = express.Router();

// router.route('/').post(authorization, employerCandidateSearch.createCandidateSearch);
// router.route('/createSaveSeprate').post(authorization, employerCandidateSearch.createSaveSeprate);
// router.route('/searchQuery').post(employerCandidateSearch.searchQuery);
// router.route('/employerSearchCandidate/:id').get(employerCandidateSearch.employerSearchCandidate);
// router.route('/createSavetoFolder').post(authorization, employerCandidateSearch.createSavetoFolder);
// router.route('/employerPost_Jobs').get(authorization, employerCandidateSearch.employerPost_Jobs);
// router.route('/employer_job_post_edit/:id').put(employerCandidateSearch.employer_job_post_edit);
// router.route('/candidate_applied_Details/:id').get(employerCandidateSearch.candidate_applied_Details);
// router.route('/candidate_applied_Details_view/:id').get(employerCandidateSearch.candidate_applied_Details_view);
// router.route('/saveSearchData_EmployerSide').get(authorization, employerCandidateSearch.saveSearchData_EmployerSide);
// router.route('/employerRemovePostJobs/:id').delete(employerCandidateSearch.employerRemovePostJobs);
// router.route('/allFolderData').get(employerCandidateSearch.allFolderData);
// router.route('/candidatdeSaveJobRemove/:id').delete(employerCandidateSearch.candidatdeSaveJobRemove);
// router.route('/saveFolderData_view').get(authorization, employerCandidateSearch.saveFolderData_view);
// router.route('/getSaveSeprate/:range/:page').get(authorization, employerCandidateSearch.getSaveSeprate);
// router.route('/delete_Seprate_saveCandidate/:id').delete(employerCandidateSearch.delete_Seprate_saveCandidate);
// router.route('/outSearch_employer').post(authorization, employerCandidateSearch.outSearch_employer);
// router.route('/outSearchSave').post(authorization, employerCandidateSearch.outSearchSave);
// router.route('/outSearchRecentSearch').get(authorization, employerCandidateSearch.outSearchRecentSearch);
// router.route('/outSearchSaveData').get(authorization, employerCandidateSearch.outSearchSaveData);
// router.route('/recent_searchSave_byId/:id').get(employerCandidateSearch.recent_searchSave_byId);
// router.route('/recent_search_byId/:id').get(employerCandidateSearch.recent_search_byId);

// //delete folder
// router.route('/delete_folder/:id/:folder').delete(employerCandidateSearch.delete_folder);
// router.route('/delete_one_data').delete(employerCandidateSearch.delete_one_data);
// router.route('/edit_all_folder').put(authorization, employerCandidateSearch.edit_all_folder);
// router.route('/recent_saver_search_delete').put(employerCandidateSearch.recent_saver_search_delete);

// router.route('/saveFolderData_view_All_data').get(authorization, employerCandidateSearch.saveFolderData_view_All_data);
// router.route('/outSearchSaveData_all').get(authorization, employerCandidateSearch.outSearchSaveData_all);

router.route('/create/savefolder').post(authorization, employerCandidateSearch.create_saved_folder);
router.route('/existing/savefolder').post(authorization, employerCandidateSearch.existing_saved_folder);
router.route('/get/folders').get(authorization, employerCandidateSearch.get_my_folder);

router.route('/get/my/saved/folders').get(authorization, employerCandidateSearch.get_my_saved_folder);


router.route('/get/saved/candidate').get(authorization, employerCandidateSearch.get_saved_candidate);




module.exports = router;