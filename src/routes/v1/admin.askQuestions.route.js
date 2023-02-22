const express = require('express');
const validate = require('../../middlewares/validate');
const authorization = require('../../controllers/tokenVerify.controller');
const adminAskController = require('../../controllers/admin.askQuestions.controller');

const router = express.Router();

router.route('/').post(adminAskController.createfaqe);
router.route('/:range/:page').get(adminAskController.getAll_faqe);
router.route('/get_Faqe_id/data/:id').get(adminAskController.get_Faqe_id);
router.route('/get_Faqe_update/:id').put(adminAskController.get_Faqe_update);
router.route('/get_Faqe_delete/:id').delete(adminAskController.get_Faqe_delete);
router.route('/exiting_faqe_data').get(adminAskController.exiting_faqe_data);
router.route('/create_enquiry_candidate').post(authorization, adminAskController.create_enquiry_candidate);
module.exports = router;