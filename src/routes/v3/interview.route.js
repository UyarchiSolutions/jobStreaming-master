const express = require('express');
const interview = require('../../controllers/candidate/interview.controller');
const router = express.Router();
const authorization = require('../../controllers/empVEridy.controller');
const candidateAuth = require('../../controllers/tokenVerify.controller');
const Interviewer_auth = require('./interviwer.auth');
const multer = require('multer');


const storage_s3 = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}`);
    },
});

const upload_s3 = multer({ storage: storage_s3 });


router.route('/newinterview').post(authorization, interview.create_new_interview);
router.route('/newinterview').put(authorization, interview.update_interview);
router.route('/newinterview').get(authorization, interview.get_interview);
router.route('/newinterview/attachment').put(authorization, upload_s3.single('file'), interview.attachment_interview);



// interviewer routes
router.route('/get/interview').get(interview.get_interview_details);
router.route('/interviewer/login').post(interview.interviewer_login);
router.route('/stream/details').get(Interviewer_auth, interview.stream_details);






module.exports = router;
