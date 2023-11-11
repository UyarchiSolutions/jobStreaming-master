const express = require('express');
const authController = require('../../controllers/auth.controller');
const candAuth = require('../../controllers/tokenVerify.controller');
const RequestStream = require('../../controllers/request.stream.controller');
const router = express.Router();

router.route('/').post(candAuth, RequestStream.createRequestStream);
router.route('/candidate/request/Stream').get(candAuth, RequestStream.get_CandidateRequestStream);

module.exports = router;
