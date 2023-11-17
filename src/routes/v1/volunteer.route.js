const express = require('express');
const volunteerController = require('../../controllers/volunteerr.controller');
const router = express.Router();

router.route('/').post(volunteerController.createVolunteer);

module.exports = router;
