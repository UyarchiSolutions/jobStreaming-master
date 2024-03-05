const express = require('express');
const volunteerController = require('../../controllers/volunteerr.controller');
const router = express.Router();
const volunteerAuth = require('../../controllers/voulnteer.verify');
const multer = require('multer');

const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});
const upload = multer({ storage }).single('image');

router.route('/').post(volunteerController.createVolunteer);
router.route('/setPassword').post(volunteerController.setPassword);
router.route('/login').post(volunteerController.Login);
router.route('/profile').get(volunteerAuth, volunteerController.getProfile);
router.route('/MatchCandidate').get(volunteerAuth, volunteerController.MatchCandidate);
router.route('/Candidate/IntrestUpdate/:id/:slotId').get(volunteerAuth, volunteerController.CandidateIntrestUpdate);
router.route('/upload/ProfileImage/:id').put(upload, volunteerController.uploadProfileImage);
router.route('/getVolunteers/Details').get(volunteerAuth, volunteerController.getVolunteersDetails);
router.route('/getCandidates/ForInterview').get(volunteerAuth, volunteerController.getCandidatesForInterview);
router.route('/updateVolunteer').put(volunteerAuth, volunteerController.updateVolunteer);
router.route('/sendOTP').get(volunteerController.sendOTP);
router.route('/verifyOTP').post(volunteerController.VerifyOTP);
router.route('/getIntrestedCandidates').get(volunteerAuth, volunteerController.getIntrestedCandidates);
router.route('/UndoIntrestedCandidate/:id').get(volunteerAuth, volunteerController.UndoIntrestedCandidate);

router.route('/change/password').post(volunteerAuth, volunteerController.change_password);


router.route('/forget/password').post(volunteerController.forget_password);

module.exports = router;
