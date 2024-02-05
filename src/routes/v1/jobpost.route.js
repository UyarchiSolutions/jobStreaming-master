const express = require('express');
const Jobpost = require('../../controllers/jobpost.controller');
const authorization = require('../../controllers/empVEridy.controller');
const router = express.Router();

router.route('/employer/post').get(authorization, Jobpost.get_my_job_post);
router.route('/employer/post/draft').get(authorization, Jobpost.get_my_job_post_draft);
router.route('/toggle/post/job').get(authorization, Jobpost.toggle_job_post);
router.route('/post/details').get(authorization, Jobpost.get_post_details);
router.route('/employer/post').put(authorization, Jobpost.update_employer_post);
router.route('/employer/post/draft').put(authorization, Jobpost.update_employer_post_draft);


module.exports = router;
