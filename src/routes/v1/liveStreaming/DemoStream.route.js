const express = require('express');

const router = express.Router();
const demostream = require('../../../controllers/liveStreaming/DemoStream.controller');
const volunteerAuth = require('../../../controllers/voulnteer.verify');
const multer = require('multer')
router.route('/getDatas').get(demostream.getDatas);

router.route('/get/stream/details').get(demostream.get_stream_details);
router.route('/send/otp').get(demostream.send_otp);
router.route('/verify/otp').post(demostream.verify_otp);
router.route('/select/data/time').post(demostream.select_data_time);
router.route('/one/more/time').post(demostream.add_one_more_time);

router.route('/end/stream').get(demostream.end_stream);

router.route('/seller/go/live').post(volunteerAuth, demostream.seller_go_live);
router.route('/seller/live/details').get(demostream.seller_go_live_details);

router.route('/video/start/cloud').get(demostream.start_cloud);

// Buyer Side Stream

router.route('/join/stream/candidate').post(demostream.buyer_join_stream);
router.route('/buyer/get/property').post(demostream.get_buyer_join_stream);
router.route('/buyer/go/live').get(demostream.buyer_go_live_stream);

router.route('/verify/token/stream/buyer').get(demostream.byer_get_stream_details);
router.route('/buyer/interest/now').post(demostream.buyer_interested);
router.route('/getStreamDetails/:id').get(demostream.getStreamDetails);

router.route('/get/stream/details/golive').get(volunteerAuth, demostream.get_stream_details_check_golive);

router.route('/start/cloud/record').get(demostream.start_cloud_record);


router.route('/verify/token/stream').get(demostream.get_stream_verify);
router.route('/verification/sms/send').get(demostream.verification_sms_send);

router.route('/verify/sms/now').post(demostream.verify_otp);

router.route('/get/buyer/token').get(demostream.get_buyer_token);


router.route('/add/reference').post(volunteerAuth, demostream.add_reference);
router.route('/get/reference').get(volunteerAuth, demostream.get_reference);




router.route('/compleletd/videos').get(volunteerAuth, demostream.completed_videos);



const storage_s3 = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}`);
    },
});

const upload_s3 = multer({ storage: storage_s3 });






router.route('/upload/treaser').post(volunteerAuth, upload_s3.single('file'), demostream.upload_teaser);
router.route('/upload/trailer').post(volunteerAuth, upload_s3.single('file'), demostream.upload_trailer);
router.route('/upload/edited').post(volunteerAuth, upload_s3.single('file'), demostream.upload_edited);


router.route('/approve/upload').post(demostream.approve_upload);



// router.route('').get(demostream.send_sms_now);

module.exports = router;
