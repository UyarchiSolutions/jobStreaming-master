const express = require('express');
const streamcontroller = require('../../controllers/crud.controller');
const router = express.Router();

router.route('/create').post(streamcontroller.create);
router.route('/get').get(streamcontroller.get_one);
router.route('/update').put(streamcontroller.update);
router.route('/delete').delete(streamcontroller.delete_one);
router.route('/getall').get(streamcontroller.getall);

module.exports = router;
