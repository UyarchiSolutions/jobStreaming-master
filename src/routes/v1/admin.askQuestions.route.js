const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const adminAskController = require('../../controllers/admin.askQuestions.controller');

const router = express.Router();

router.route('/').post(adminAskController.createfaqe);
router.route('/').get(adminAskController.getAll_faqe);
module.exports = router;