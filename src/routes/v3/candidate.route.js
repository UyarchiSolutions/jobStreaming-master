const express = require('express');
const candidate = require('../../controllers/candidate/candidate.controller');
const router = express.Router();
const authorization = require('../../controllers/empVEridy.controller');
const candidateAuth = require('../../controllers/tokenVerify.controller');


router.route('/get/all/candidate').post(candidate.get_all_candidates);



router.route('/applied/jobs').get(candidateAuth, candidate.get_applied_jobs);
router.route('/candidate/applies').get(authorization, candidate.get_candidate_applies);

router.route('/applied/candidate/details').get(authorization, candidate.applied_candidate_details);


router.route('/shortlist').put(authorization, candidate.shortlist_candidate);
router.route('/reject').put(authorization, candidate.reject_candidate);
router.route('/undo').put(authorization, candidate.undo_candidate);

router.route('/move-to-interview').post(authorization, candidate.move_to_interview);


router.route('/shortlist').post(authorization, candidate.shortlist_candidate_multible);
router.route('/reject').post(authorization, candidate.reject_candidate_multible);




// my interviews
router.route('/myinterviews').get(authorization, candidate.get_my_interviews);


module.exports = router;
