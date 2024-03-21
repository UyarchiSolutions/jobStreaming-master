const express = require('express');
const streamcontroller = require('../../controllers/stream.controller');
const router = express.Router();
const authorization = require('../../controllers/empVEridy.controller');
const candidateAuth = require('../../controllers/tokenVerify.controller');
const candidateAuth_required = require('../../controllers/candidate.auth');

router.route('/emp/go/live').post(authorization, streamcontroller.emp_go_live);
router.route('/token').get(authorization, streamcontroller.get_stream_token);

router.route('/end').get(authorization, streamcontroller.stream_end);


router.route('/cloud/start').get(authorization, streamcontroller.cloud_start);
router.route('/cloud/stop').post(authorization, streamcontroller.cloud_stop);



router.route('/chats').get(authorization, streamcontroller.get_all_chats);



router.route('/jobpost/current/live').get(streamcontroller.get_candidate_jobpost_current_live);
router.route('/jobpost/home').get(candidateAuth_required, streamcontroller.get_candidate_jobpost);
router.route('/post/details').get(candidateAuth, streamcontroller.get_post_details);



router.route('/candidate/chats').get(candidateAuth, streamcontroller.candidateAuth_get_all_chats);

router.route('/candidate/go/live').post(candidateAuth, streamcontroller.candidate_go_live);
router.route('/candidate/token').get(candidateAuth, streamcontroller.get_stream_token_candidateAuth);



//pre evalution
router.route('/preevalution').get(candidateAuth, streamcontroller.get_preevalution);




router.route('/completed/video').get(candidateAuth, streamcontroller.get_completed_video);








module.exports = router;
