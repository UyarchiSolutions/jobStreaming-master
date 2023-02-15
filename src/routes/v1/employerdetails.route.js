const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const employerDetailsController = require('../../controllers/employerDetails.controller');
const authorization = require('../../controllers/empVEridy.controller');
const auth = require('../../controllers/tokenVerify.controller');
const authadmin = require('../../controllers/adminVerify.controller');
const router = express.Router();

router.route('/createEmpDetails').post(authorization, employerDetailsController.createEmpDetails);

router.route('/getEmpDetails').get(authorization,employerDetailsController.getByIdUser);
router.route('/updateEmpDetails/:id').put(employerDetailsController.updateById);
router.route('/deleteEmpDetails/:id').delete(employerDetailsController.deleteById);
router.route('/createEmpDetailsRepost/:id').put(employerDetailsController.createEmpDetailsRepost);
router.route('/getByIdEmpDetails/:id').get(employerDetailsController.getById_Get);
router.route('/data_Id/:id').get(employerDetailsController.data_Id);
router.route('/countPostjobError').get(authorization, employerDetailsController.countPostjobError);
router.route('/update_active_deactive/:id').put(employerDetailsController.update_active_deactive);
//sdfd
router.route('/EmployerspostDraft').post(authorization, employerDetailsController.EmployerspostDraft);
router.route('/draftData').get(authorization, employerDetailsController.draftData_employerside);
router.route('/draftData_getId/:id').get(employerDetailsController.draftData_employerside_ById);
router.route('/draftData_delete/:id').delete(employerDetailsController.draftData_delete);
router.route('/getAllApplied_postjobs_Candidates/:id').get(employerDetailsController.getAllApplied_postjobs_Candidates);
router.route('/statusChange_employer/:id').get(employerDetailsController.statusChange_employer);
router.route('/getByIdAll_CandidateDetails/:id').get(employerDetailsController.getByIdAll_CandidateDetails);
router.route('/employer_comment').post(authorization, employerDetailsController.employer_comment);
router.route('/comment_edit/:id').put(employerDetailsController.comment_edit);

// mail
router.route('/mail_template_create').post(authorization, employerDetailsController.mail_template_create);
router.route('/mail_template_data').get(authorization, employerDetailsController.mail_template_data);
router.route('/mail_template_data_Id/:id').get(employerDetailsController.mail_template_data_Id);
router.route('/mail_template_data_Update/:id').put(employerDetailsController.mail_template_data_Update);
router.route('/mail_template_data_delete/:id').delete(employerDetailsController.mail_template_data_delete);

// send notification mail
router.route('/send_mail_and_notification').post(authorization, employerDetailsController.send_mail_and_notification);
router.route('/getAll_Mail_notification_employerside').get(authorization, employerDetailsController.getAll_Mail_notification_employerside);
router.route('/getAll_Mail_notification_candidateside').get(auth, employerDetailsController.getAll_Mail_notification_candidateside);
router.route('/candidate_mailnotification_Change/:id').put(employerDetailsController.candidate_mailnotification_Change);

router.route('/get_job_post/:id').get(employerDetailsController.get_job_post);
router.route('/get_job_post_candidate/:id').get(auth, employerDetailsController.get_job_post_candidate);
//map
router.route('/neighbour_api').get(employerDetailsController.neighbour_api);

// plans details admin
router.route('/All_Plans').get(authadmin,employerDetailsController.All_Plans);
router.route('/all_plans_users_details/:id').get(employerDetailsController.all_plans_users_details);

// keySkill
router.route('/keySkillData/:key').get(employerDetailsController.keySkillData);
router.route('/location/:key').get(employerDetailsController.location);

router.route('/create_Recruiter').post(authorization, employerDetailsController.create_Recruiter);
router.route('/get_Recruiter').get(authorization, employerDetailsController.get_Recruiter);
router.route('/get_Recruiter_id/:id').get(employerDetailsController.get_Recruiter_id);
router.route('/Recruiter_edit/:id').put(employerDetailsController.Recruiter_edit);
router.route('/Recruiter_delete/:id').delete(employerDetailsController.Recruiter_delete);
module.exports = router;