const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const candidateDetailsController = require('../../controllers/candidateDetails.controller');
const uploadImage = require('../../middlewares/uploadImage');
const authorization = require('../../controllers/tokenVerify.controller');
const authorization1 = require('../../controllers/empVEridy.controller');

const router = express.Router();

router.route('/createKeyskill').post(authorization, uploadImage.array('image'), candidateDetailsController.createkeySkill);
//create only image put method
router.route('/updateByIdImage/:id').put(uploadImage.array('image'), candidateDetailsController.updateByIdImage);
router.route('/educationDetails').post(authorization, candidateDetailsController.educationDetails);
router.route('/getKeyskill').get(authorization, candidateDetailsController.getByIdUser);
router.route('/updateKeyskill').post(authorization, uploadImage.array('image'), candidateDetailsController.updateById);
router.route('/deleteKeyskill/:id').delete(candidateDetailsController.deleteById);
router.route('/candidateSearch').post(candidateDetailsController.candidateSearch);
router
  .route('/getByIdEmployerDetailsShownCandidate/:id')
  .get(authorization, candidateDetailsController.getByIdEmployerDetailsShownCandidate);
router.route('/createCandidatePostjob').post(authorization, candidateDetailsController.createCandidatePostjob);
router.route('/createCandidateSavejob').post(authorization, candidateDetailsController.createCandidateSavejob);
router.route('/getByIdAppliedJobs/:search').get(authorization, candidateDetailsController.getByIdAppliedJobs);
router.route('/deleteByIdSavejOb/:id').delete(candidateDetailsController.deleteByIdSavejOb);
router.route('/getByIdSavedJobs').get(authorization, candidateDetailsController.getByIdSavedJobs);
router.route('/applyJobsView/:userId').get(candidateDetailsController.applyJobsView);
router.route('/getByIdSavedJobsView/:userId').get(candidateDetailsController.getByIdSavedJobsView);
router.route('/autojobSearch').get(authorization, candidateDetailsController.autojobSearch);
router.route('/createdSearchhistory').post(authorization, candidateDetailsController.createdSearchhistory);
router.route('/createdSearchhistoryData').get(authorization, candidateDetailsController.createdSearchhistoryData);
router.route('/CandidateRegistrations/:page').get(candidateDetailsController.CandidateRegistrations);
router.route('/updateByIdCandidateRegistration/:id').put(candidateDetailsController.updateByIdCandidateRegistration);
router.route('/createSetSearchEmployerData').post(authorization, candidateDetailsController.createSetSearchEmployerData);
router
  .route('/updateByIdcandidataSearchEmployerSet/:id')
  .put(candidateDetailsController.updateByIdcandidataSearchEmployerSet);
router
  .route('/SearchByIdcandidataSearchEmployerSet')
  .get(authorization, candidateDetailsController.SearchByIdcandidataSearchEmployerSet);
router.route('/getByIdEmployerDetails/:id').get(candidateDetailsController.getByIdEmployerDetails);
router.route('/candidateSearch_front_page').post(authorization, candidateDetailsController.candidateSearch_front_page);
router.route('/recentSearch').get(authorization, candidateDetailsController.recentSearch);
router.route('/languages').get(candidateDetailsController.languages);
router.route('/educationDetails').post(authorization, candidateDetailsController.educationDetails);
router.route('/recentSearch_byId/:id').get(candidateDetailsController.recentSearch_byId);
router.route('/candidate_detials/:id/:jobid').get(candidateDetailsController.candidate_detials);
router.route('/updateEducation').post(authorization, candidateDetailsController.updateEducation);
router.route('/createdSearchhistoryData_byId/:id').get(candidateDetailsController.createdSearchhistoryData_byId);
router.route('/edit_details').put(authorization, candidateDetailsController.edit_details);
router.route('/candidate_detials_id/:id').get(candidateDetailsController.candidate_detials_id);
router.route('/get_all_candidates').post(candidateDetailsController.get_all_candidates);
router.route('/CandidateRegistration_names/:key').get(candidateDetailsController.CandidateRegistration_names);
router.route('/CandidateRegistration_number/:key').get(candidateDetailsController.CandidateRegistration_number);
// router.route('/createSearchCandidate').post(authorization, candidateDetailsController.createSearchCandidate);
router.route('/DeleteResume').get(authorization, candidateDetailsController.DeleteResume);
router.route('/getAllApplied/JobsByCandidate').get(authorization, candidateDetailsController.getAllAppliedJobsByCandidate);
router.route('/recent/search').post(authorization, candidateDetailsController.recentSearchByCandidate);
router.route('/get/SavedJobs/Candidate').get(authorization, candidateDetailsController.get_SavedJobs_Candidate);
router.route('/update/Profesional/Details').post(authorization, candidateDetailsController.updateProfesionalDetails);
router.route('/getCandidateById').get(authorization, candidateDetailsController.getCandidateById);



router.route('/myinterviews').get(authorization, candidateDetailsController.get_imy_interviews);
router.route('/myinterviews/list').get(authorization, candidateDetailsController.get_imy_interviews_list);

module.exports = router;
