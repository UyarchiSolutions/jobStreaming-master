const express = require('express');
const candidate = require('../../controllers/candidate/candidate.controller');
const router = express.Router();



router.route('/get/all/candidate').post(candidate.get_all_candidates);



module.exports = router;
