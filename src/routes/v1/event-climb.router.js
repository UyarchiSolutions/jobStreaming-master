const express = require('express');
const router = express.Router();
const multer = require('multer');
const ClimbController = require('../../controllers/event-climb.controller');
const storage = multer.memoryStorage({
  destination: function (req, res, callback) {
    callback(null, '');
  },
});

const UploadFile = multer({ storage }).single('uploadResume');

router.route('/').post(UploadFile, ClimbController.createEventClimb);
router.route('/slot').get(ClimbController.getSlots);

module.exports = router;
