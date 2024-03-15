const express = require('express');
const candidate = require('../../controllers/candidate/candidate.controller');
const router = express.Router();
const authorization = require('../../controllers/empVEridy.controller');
const candidateAuth = require('../../controllers/tokenVerify.controller');


router.route('/get/all/candidate').post(candidate.get_all_candidates);



router.route('/applied/jobs').get(candidateAuth, candidate.get_applied_jobs);




router.route('/candidate/applies').get(authorization, candidate.get_candidate_applies);





module.exports = router;
