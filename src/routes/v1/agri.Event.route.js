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
router.route('/linksend/:id').get(AgriEventController.link_send);

router.route('/candidate/review').post(AgriEventController.createCandidateReview);
router.route('/ExcelDatas').post(upload, AgriEventController.ExcelDatas);
router.route('/mailsend').post(AgriEventController.EmailSend);
router.route('/agri/cand').get(AgriEventController.getAgriCandidates);
router.route('/getCandidateById/:id').get(AgriEventController.getCandidateById);
router.route('/getCandBy').post(AgriEventController.getCandBy);
router.route('/create/SlotBooking').post(AgriEventController.createSlotBooking);
router.route('/getIntrested/ByCand_Role/:id/:role').get(AgriEventController.getIntrestedByCand_Role);
router.route('/AdminApprove').post(AgriEventController.AdminApprove);
router.route('/Undo/:id').get(AgriEventController.Undo);
router.route('/clearCandidates/:id/:role').get(AgriEventController.clearCandidates);
router.route('/ResumeUploadAgriCand/:id').put(upload, AgriEventController.ResumeUploadAgriCand);
router.route('/getCandidatesReport').get(AgriEventController.getCandidatesReport);
router.route('/getStreamDetailsByCand/:id').get(AgriEventController.getStreamDetailsByCand);
router.route('/active/Inactive/candidate/:id').get(AgriEventController.active_Inactive_candidate)


router.route('/get/hr/review').get(AgriEventController.get_hr_review);
router.route('/get/tech/review').get(AgriEventController.get_tech_review);

module.exports = router;
