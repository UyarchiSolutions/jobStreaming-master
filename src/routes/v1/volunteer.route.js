const express = require('express');
const volunteerController = require('../../controllers/volunteerr.controller');
const router = express.Router();

router.route('/').post(volunteerController.createVolunteer);
router.route('/setPassword').post(volunteerController.setPassword);
router.route('/login').post(volunteerController.Login);

module.exports = router;
