const express = require('express');
const Jobpost = require('../../controllers/jobpost.controller');
const authorization = require('../../controllers/empVEridy.controller');
const router = express.Router();
const candidateAuth = require('../../controllers/tokenVerify.controller');


router.route('/employer/post').get(authorization, Jobpost.get_my_job_post);
router.route('/employer/post/draft').get(authorization, Jobpost.get_my_job_post_draft);
router.route('/toggle/post/job').get(authorization, Jobpost.toggle_job_post);
router.route('/post/details').get(authorization, Jobpost.get_post_details);
router.route('/employer/post').put(authorization, Jobpost.update_employer_post);
router.route('/employer/post/draft').put(authorization, Jobpost.update_employer_post_draft);


router.route('/active/post').get(authorization, Jobpost.get_active_postes);



router.route('/create/stream/request').post(authorization, Jobpost.create_stream_request);
router.route('/update/stream/request').put(authorization, Jobpost.update_stream_request);
router.route('/stream/request').get(authorization, Jobpost.get_my_job_stream);


router.route('/get/post/details').get(authorization, Jobpost.get_post_details_single);
router.route('/get/post/details/candidate').get(candidateAuth, Jobpost.get_post_details_candidateAuth);



router.route('/apply/onlive').post(candidateAuth, Jobpost.apply_candidate_jobpost_onlive);
router.route('/apply/completed').post(candidateAuth, Jobpost.apply_candidate_jobpost_completed);
router.route('/apply').post(candidateAuth, Jobpost.apply_candidate_jobpost);











module.exports = router;
