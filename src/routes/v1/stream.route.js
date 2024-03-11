const express = require('express');
const streamcontroller = require('../../controllers/stream.controller');
const router = express.Router();
const authorization = require('../../controllers/empVEridy.controller');

router.route('/emp/go/live').post(authorization, streamcontroller.emp_go_live);
router.route('/token').get(authorization, streamcontroller.get_stream_token);



router.route('/chats').get(authorization, streamcontroller.get_all_chats);

module.exports = router;
