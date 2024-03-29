const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const employerDetailsController = require('../../controllers/employerDetails.controller');
const authorization = require('../../controllers/empVEridy.controller');
const auth = require('../../controllers/tokenVerify.controller');
const authadmin = require('../../controllers/adminVerify.controller');
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.route('/createEmpDetails').post(authorization, employerDetailsController.createEmpDetails);
router.route('/draft/job/post').post(authorization, employerDetailsController.create_draft_job_post);
router.route('/getEmpDetails').get(authorization, employerDetailsController.getByIdUser);
router.route('/updateEmpDetails/:id').put(employerDetailsController.updateById);
router.route('/deleteEmpDetails/:id').delete(employerDetailsController.deleteById);
router.route('/createEmpDetailsRepost/:id').put(employerDetailsController.createEmpDetailsRepost);
router.route('/getByIdEmpDetails/:id').get(employerDetailsController.getById_Get);
router.route('/data_Id/:id').get(employerDetailsController.data_Id);
router.route('/countPostjobError').get(authorization, employerDetailsController.countPostjobError);
router.route('/update_active_deactive/:id').put(employerDetailsController.update_active_deactive);
router.route('/get_admin_side_all_post_jobs_details').post(employerDetailsController.get_admin_side_all_post_jobs_details);
router
  .route('/get_all_job_applied_candiadtes/:id/:range/:page')
  .get(employerDetailsController.get_all_job_applied_candiadtes);
router.route('/manage_employer').post(employerDetailsController.manage_employer);
router.route('/update_manage_employer/:id').put(employerDetailsController.update_manage_employer);
router.route('/employer_name/:key').get(employerDetailsController.employer_name);
router.route('/employer_contactnumber/:key').get(employerDetailsController.employer_contactnumber);
//sdfd
router.route('/EmployerspostDraft').post(authorization, employerDetailsController.EmployerspostDraft);
router.route('/draftData').get(authorization, employerDetailsController.draftData_employerside);
router.route('/draftData_getId/:id').get(employerDetailsController.draftData_employerside_ById);
router.route('/draftData_delete/:id').delete(employerDetailsController.draftData_delete);
router
  .route('/getAllApplied_postjobs_Candidates/:id/:range/:page')
  .get(employerDetailsController.getAllApplied_postjobs_Candidates);
router.route('/statusChange_employer/:id').put(employerDetailsController.statusChange_employer);
router.route('/getByIdAll_CandidateDetails/:id').get(employerDetailsController.getByIdAll_CandidateDetails);
router.route('/employer_comment').post(authorization, employerDetailsController.employer_comment);
router.route('/comment_edit/:id').put(employerDetailsController.comment_edit);
router.route('/employer_comment_id/:id').get(employerDetailsController.employer_comment_id);

// mail
router.route('/mail_template_create').post(authorization, employerDetailsController.mail_template_create);
router.route('/mail_template_data').get(authorization, employerDetailsController.mail_template_data);
router.route('/mail_template_data_Id/:id').get(employerDetailsController.mail_template_data_Id);
router.route('/mail_template_data_Update/:id').put(employerDetailsController.mail_template_data_Update);
router.route('/mail_template_data_delete/:id').delete(employerDetailsController.mail_template_data_delete);

// send notification mail
router.route('/send_mail_and_notification').post(authorization, employerDetailsController.send_mail_and_notification);
router
  .route('/getAll_Mail_notification_employerside/:range/:page')
  .get(authorization, employerDetailsController.getAll_Mail_notification_employerside);
router
  .route('/getAll_Mail_notification_candidateside')
  .get(auth, employerDetailsController.getAll_Mail_notification_candidateside);
router.route('/candidate_mailnotification_Change/:id').put(employerDetailsController.candidate_mailnotification_Change);

router.route('/get_job_post/:id').get(employerDetailsController.get_job_post);
router.route('/get_job_post_candidate/:id').get(auth, employerDetailsController.get_job_post_candidate);
//map
router.route('/neighbour_api').get(employerDetailsController.neighbour_api);
router.route('/location_api').get(employerDetailsController.location_api);

// plans details admin
router.route('/All_Plans').get(authadmin, employerDetailsController.All_Plans);
router.route('/all_plans_users_details/:id').get(employerDetailsController.all_plans_users_details);

// keySkill
router.route('/keySkillData/:key').get(employerDetailsController.keySkillData);
router.route('/location/:key').get(employerDetailsController.location);

router.route('/create_Recruiter').post(authorization, employerDetailsController.create_Recruiter);
router.route('/get_Recruiter').get(authorization, employerDetailsController.get_Recruiter);
router.route('/get_Recruiter_id/:id').get(employerDetailsController.get_Recruiter_id);
router.route('/Recruiter_edit/:id').put(employerDetailsController.Recruiter_edit);
router.route('/Recruiter_delete/:id').delete(employerDetailsController.Recruiter_delete);
router.route('/getEmployerRegister/:id').get(employerDetailsController.getEmployerRegister);





router.route('/myprofile').get(authorization, employerDetailsController.get_my_profile);


const storage_s3 = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const upload_s3 = multer({ storage: storage_s3 });



router.route('/upload/video/completed').post(authorization, upload_s3.single('video'), employerDetailsController.post_video_completed);
router.route('/upload/shorts/completed').post(authorization, upload_s3.single('video'), employerDetailsController.post_shorts_completed);
router.route('/remove/shorts/completed').get(authorization, employerDetailsController.remove_shorts_completed);
router.route('/selected/video/completed').post(authorization, employerDetailsController.selected_video_completed);

module.exports = router;
