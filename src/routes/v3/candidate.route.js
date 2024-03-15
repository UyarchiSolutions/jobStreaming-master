const express = require('express');
const candidate = require('../../controllers/candidate/candidate.controller');
const router = express.Router();

const candidateAuth = require('../../controllers/tokenVerify.controller');


router.route('/get/all/candidate').post(candidate.get_all_candidates);



router.route('/applied/jobs').get(candidateAuth, candidate.get_applied_jobs);




module.exports = router;
