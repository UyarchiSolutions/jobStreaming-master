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
router.route('/get_all_enquiry').get(adminAskController.get_all_enquiry);
router.route('/get_id_enquiry/data/:id').get(adminAskController.get_id_enquiry);
router.route('/create_enquiry_dummy').post(adminAskController.create_enquiry_dummy);
module.exports = router;