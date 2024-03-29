const express = require('express');
const Jobpost = require('../../controllers/jobpost.controller');
const authorization = require('../../controllers/empVEridy.controller');
const router = express.Router();
const candidateAuth = require('../../controllers/tokenVerify.controller');
const multer = require('multer');


router.route('/employer/post').get(authorization, Jobpost.get_my_job_post);
router.route('/employer/post/draft').get(authorization, Jobpost.get_my_job_post_draft);
router.route('/toggle/post/job').get(authorization, Jobpost.toggle_job_post);
router.route('/toggle/post/stream').get(authorization, Jobpost.toggle_job_stream);
router.route('/post/details').get(authorization, Jobpost.get_post_details);
router.route('/employer/post').put(authorization, Jobpost.update_employer_post);
router.route('/employer/post/draft').put(authorization, Jobpost.update_employer_post_draft);


router.route('/active/post').get(authorization, Jobpost.get_active_postes);



router.route('/create/stream/request').post(authorization, Jobpost.create_stream_request);
router.route('/update/stream/request').put(authorization, Jobpost.update_stream_request);
router.route('/stream/request').get(authorization, Jobpost.get_my_job_stream);


router.route('/get/post/details').get(authorization, Jobpost.get_post_details_single);
router.route('/get/post/details/candidate').get(candidateAuth, Jobpost.get_post_details_candidateAuth);
router.route('/get/post/details/completed').get(authorization, Jobpost.get_post_details_completed);


router.route('/apply/onlive').post(candidateAuth, Jobpost.apply_candidate_jobpost_onlive);
router.route('/apply/completed').post(candidateAuth, Jobpost.apply_candidate_jobpost_completed);
router.route('/apply').post(candidateAuth, Jobpost.apply_candidate_jobpost);




// saved post
// router.route('/saved/post').post(candidateAuth, Jobpost.saved_post_candidgetEmployerByMobilate);



// manage recruiters
router.route('/recruiters').post(authorization, Jobpost.create_recruiters);
router.route('/recruiters').put(authorization, Jobpost.update_recruiters);
router.route('/recruiters').get(authorization, Jobpost.get_recruiters);
router.route('/recruiters/all').get(authorization, Jobpost.get_all_recruiters);
router.route('/recruiters').delete(authorization, Jobpost.delete_recruiters);
router.route('/recruiters/toggle').put(authorization, Jobpost.toggle_recruiters);

router.route('/recruiters/list').get(authorization, Jobpost.list_recruiters);



const storage_s3 = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}`);
    },
});

const upload_s3 = multer({ storage: storage_s3 });




// manage Interviewers
router.route('/interviewer').post(authorization, Jobpost.create_interviewer);
router.route('/interviewer').put(authorization, Jobpost.update_interviewer);
router.route('/interviewer').get(authorization, Jobpost.get_interviewer);
router.route('/interviewer/all').get(authorization, Jobpost.get_all_interviewer);
router.route('/interviewer').delete(authorization, Jobpost.delete_interviewer);
router.route('/interviewer/toggle').put(authorization, Jobpost.toggle_interviewer);

router.route('/interviewer/list').get(authorization, Jobpost.list_interviewer);



router.route('/interviewer/resume').put(authorization, upload_s3.single('file'), Jobpost.resume_interviewer);





module.exports = router;
