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
router.route('/intern').post(UploadFile, ClimbController.createEventClimb_intern);
router.route('/slot').get(ClimbController.getSlots);
router.route('/slot').post(ClimbController.insertSlots);
router.route('/slot/intern').post(ClimbController.insertSlots_intern);
router.route('/slot/intern').get(ClimbController.getSlots_intern);
router.route('/getAllRegistered/Candidate').get(ClimbController.getAllRegistered_Candidate);
router.route('/getSlotDetails/WithCandidate').get(ClimbController.getSlotDetails_WithCandidate);
router.route('/getCandidateBySlot/:date/:time').get(ClimbController.getCandidateBySlot);
router.route('/Candidate/Login').post(ClimbController.CandidateLogin);
router.route('/getDetails/ByCandidate').get(Auth, ClimbController.getDetailsByCandidate);
router.route('/update/Profile/Candidate').post(Auth, ClimbController.updateProfileCandidate);
router.route('/verify/cand').post(ClimbController.verify_cand);
router.route('/update/TestWarmy/:id').put(ClimbController.updateTestWarmy);
router.route('/update/TestWarmy/new/:id').put(ClimbController.updateTestWarmyNew);
router.route('/update/intern/:id').put(ClimbController.updateTestIntern);


router.route('/insertSlots/Test').post(ClimbController.insertSlotsTest);
router.route('/slotDetails/Test').get(ClimbController.slotDetailsTest);
router.route('/createTest/Candidates').post(UploadFile, ClimbController.createTestCandidates);
router.route('/getTestUsers').get(ClimbController.getTestUsers);
router.route('/update/Status/:id').put(ClimbController.updateStatus);
router.route('/insertSlotsTest/New').post(ClimbController.insertSlotsTestNew);
router.route('/slotDetails/TestNewHR').get(ClimbController.slotDetailsTestNewHR);
router.route('/slotDetails/TestNewTech').get(ClimbController.slotDetailsTestNewTech);
router.route('/getTestUsers/New').get(ClimbController.getTestUsersNew);
router.route('/getWorkShopCand').get(ClimbController.getWorkShopCand);
router.route('/verify/cand/Intern').post(ClimbController.verify_cand_Intern);
router.route('/getInternSlots').get(ClimbController.getInternSlots);
router.route('/getWorkshop/Slot/:id').get(ClimbController.getWorkshopCandidatesBySlot)
module.exports = router;
