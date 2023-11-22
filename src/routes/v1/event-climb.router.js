const express = require('express');
const router = express.Router();
const multer = require('multer');
const ClimbController = require('../../controllers/event-climb.controller');
const Auth = require('../../controllers/eventToken.verify');
const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});

const UploadFile = multer({ storage }).single('uploadResume');

router.route('/').post(UploadFile, ClimbController.createEventClimb);
router.route('/slot').get(ClimbController.getSlots);
router.route('/slot').post(ClimbController.insertSlots);
router.route('/getAllRegistered/Candidate').get(ClimbController.getAllRegistered_Candidate);
router.route('/getSlotDetails/WithCandidate').get(ClimbController.getSlotDetails_WithCandidate);
router.route('/getCandidateBySlot/:date/:time').get(ClimbController.getCandidateBySlot);
router.route('/Candidate/Login').post(ClimbController.CandidateLogin);
router.route('/getDetails/ByCandidate').get(Auth, ClimbController.getDetailsByCandidate);
router.route('/update/Profile/Candidate').post(Auth, ClimbController.updateProfileCandidate);
router.route('/verify/cand').post(ClimbController.verify_cand);
router.route('/update/TestWarmy/:id').put(ClimbController.updateTestWarmy);
router.route('/insertSlots/Test').post(ClimbController.insertSlotsTest);
router.route('/slotDetails/Test').get(ClimbController.slotDetailsTest);
router.route('/createTest/Candidates').post(UploadFile, ClimbController.createTestCandidates);

module.exports = router;
