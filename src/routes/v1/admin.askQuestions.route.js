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
router.route('/get_all_enquiry/:range/:page').get(adminAskController.get_all_enquiry);
router.route('/get_id_enquiry/data/:id').get(adminAskController.get_id_enquiry);
router.route('/create_enquiry_dummy').post(adminAskController.create_enquiry_dummy);
router.route('/get_Enquiry_update/:id').put(adminAskController.get_Enquiry_update);
router.route('/reply_enquiry/data').post(adminAskController.reply_enquiry);
router.route('/create_report').post(authorization, adminAskController.create_report);
router.route('/all_report/:range/:page').get(adminAskController.all_report);
router.route('/deactive_admin/:id').put(adminAskController.deactive_admin);
router.route('/get_report/data/:id').get(adminAskController.get_report);
router.route('/getReport/ById/:id').get(adminAskController.getReportById);
module.exports = router;
