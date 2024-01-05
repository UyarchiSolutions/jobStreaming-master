const express = require('express');
const router = express.Router();
const ClimbCandController = require('../../controllers/climb.cand.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('resume');

router.route('/').post(ClimbCandController.createClimbCand);
router.route('/resume/upload').post(upload, ClimbCandController.ResumeUploadCand);
router.route('/:id').put(ClimbCandController.updateClimbCand);
module.exports = router;
