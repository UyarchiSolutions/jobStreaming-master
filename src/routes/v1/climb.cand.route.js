const express = require('express');
const router = express.Router();
const ClimbCandController = require('../../controllers/climb.cand.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('resume');

router.route('/').post(ClimbCandController.createClimbCand);
router.route('/resume/upload/:id').put(upload, ClimbCandController.ResumeUploadCand);
router.route('/:id').put(ClimbCandController.updateClimbCand);
router.route('/VerifyOTP').post(ClimbCandController.VerifyOTP);
router.route('/setPassword').post(ClimbCandController.SetPassword);
router.route('/login').post(ClimbCandController.LoginClimbCandidate);
module.exports = router;
