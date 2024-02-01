const express = require('express');
const Jobpost = require('../../controllers/jobpost.controller');
const authorization = require('../../controllers/empVEridy.controller');
const router = express.Router();

router.route('/employer/post').get(authorization, Jobpost.get_my_job_post);
router.route('/toggle/post/job').get(authorization, Jobpost.toggle_job_post);
router.route('/post/details').get(authorization, Jobpost.get_post_details);


module.exports = router;
