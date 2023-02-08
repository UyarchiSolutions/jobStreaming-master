const express = require('express');
const validate = require('../../../middlewares/validate');
const authValidation = require('../../../validations/auth.validation');
const authController = require('../../../controllers/auth.controller');
const auth = require('../../../middlewares/auth');

const router = express.Router();
const generateToken = require('../../../controllers/liveStreaming/generateToken-multihost.controller');

router.post('/getToken', generateToken.generateToken);
router.post('/create/rooms', generateToken.createRooms);
router.get('/rooms/all', generateToken.get_allrooms);
router.post('/recording/acquire', generateToken.agora_acquire);
router.post('/recording/start', generateToken.recording_start);
router.post('/recording/query', generateToken.recording_query);
router.post('/recording/stop', generateToken.recording_stop);
router.post('/recording/updateLayout', generateToken.recording_updateLayout);

module.exports = router;
