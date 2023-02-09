const express = require('express');
const validate = require('../../middlewares/validate');

const educationController = require('../../controllers/education.controller');


const router = express.Router();

router.route('/').get(educationController.createQualification);
router.route('/get_sslc_course/:id').get(educationController.get_sslc_course);
router.route('/get_hsc_course/:id').get(educationController.get_hsc_course);
router.route('/get_pg_course/:id').get(educationController.get_pg_course);
router.route('/get_ug_course/:id').get(educationController.get_ug_course);
router.route('/get_medium').get(educationController.get_medium);
router.route('/get_drcourse/:id').get(educationController.get_drcourse);
router.route('/get_specialization/:id').get(educationController.get_specialization);
router.route('/get_pgspecialization/:id').get(educationController.get_pgspecialization);
router.route('/get_drspecialization/:id').get(educationController.get_drspecialization);
router.route('/get_Department').get(educationController.get_Department);
router.route('/get_city/:key').get(educationController.get_city);
router.route('/get_Rolecategory/:id').get(educationController.get_Rolecategory);
router.route('/get_Industry').get(educationController.get_Industry);
router.route('/get_Role/:id').get(educationController.get_Role);
module.exports = router;