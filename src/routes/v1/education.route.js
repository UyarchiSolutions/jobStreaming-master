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
router.route('/get_allcourse').get(educationController.get_allcourse);
router.route('/get_all_specialization').post(educationController.get_all_specialization);
router.route('/get_Qualification').post(educationController.get_Qualification);
router.route('/get_Role_all/:limit').get(educationController.get_Role_all);
router.route('/get_alleducation_all/:limit').get(educationController.get_alleducation_all);
router.route('/get_Department_all/:limit').get(educationController.get_Department_all);
router.route('/get_Industries_all/:limit').get(educationController.get_Industries_all);
router.route('/get_Industries_all_search/:key').get(educationController.get_Industries_all_search);
router.route('/Courses/:id').get(educationController.getAllCoursesByQualificationId);
router.route('/specializations/:id').get(educationController.getAllSpecByCourse);


router.route('/get/department').get(educationController.get_all_department);
router.route('/get/role/category').post(educationController.get_all_role_category);



router.route('/import/course').get(educationController.import_course);


module.exports = router;
