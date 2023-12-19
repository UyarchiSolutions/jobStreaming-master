const express = require('express');
const router = express.Router();
const AgriEventController = require('../../controllers/agri.event.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

router.route('/').post(AgriEventController.createAgriEvent);
router.route('/agri/slots').post(AgriEventController.createSlots);
router.route('/slots').get(AgriEventController.slotDetailsAgri);
router.route('/update/candidate/:id').put(AgriEventController.updateCandidate);
router.route('/getCandidate/:id').get(AgriEventController.getUserById);
router.route('/candidate/review').post(AgriEventController.createCandidateReview);
router.route('/ExcelDatas').post(upload, AgriEventController.ExcelDatas);
router.route('/mailsend').post(AgriEventController.EmailSend);
router.route('/agri/cand').get(AgriEventController.getAgriCandidates);
router.route('/getCandidateById/:id').get(AgriEventController.getCandidateById);
module.exports = router;
