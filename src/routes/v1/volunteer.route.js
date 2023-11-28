const express = require('express');
const volunteerController = require('../../controllers/volunteerr.controller');
const router = express.Router();
const volunteerAuth = require('../../controllers/voulnteer.verify');

router.route('/').post(volunteerController.createVolunteer);
router.route('/setPassword').post(volunteerController.setPassword);
router.route('/login').post(volunteerController.Login);
router.route('/profile').get(volunteerAuth, volunteerController.getProfile);
router.route('/MatchCandidate').get(volunteerAuth, volunteerController.MatchCandidate);
router.route('/Candidate/IntrestUpdate/:id').get(volunteerAuth, volunteerController.CandidateIntrestUpdate);

module.exports = router;
