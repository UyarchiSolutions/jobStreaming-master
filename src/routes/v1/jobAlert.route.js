const express = require('express');
const JobAlertController = require('../../controllers/jobAlert.controller');
const authorization = require('../../controllers/tokenVerify.controller');
const router = express.Router();

router.route('/').post(authorization, JobAlertController.createjobAlert);
router.route('/updateJobAlert/:id').put(authorization, JobAlertController.updateJobAlert);
module.exports = router;
