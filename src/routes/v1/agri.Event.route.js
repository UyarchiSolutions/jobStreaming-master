const express = require('express');
const router = express.Router();
const AgriEventController = require('../../controllers/agri.event.controller');

router.route('/').post(AgriEventController.createAgriEvent);
router.route('/agri/slots').post(AgriEventController.createSlots);
router.route('/slots').get(AgriEventController.slotDetailsAgri);
router.route('/update/candidate/:id').put(AgriEventController.updateCandidate);
router.route('/getCandidate/:id').get(AgriEventController.getUserById);
router.route('/candidate/review').post(AgriEventController.createCandidateReview);

module.exports = router;
