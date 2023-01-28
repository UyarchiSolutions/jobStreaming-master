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


module.exports = router;
