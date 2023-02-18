const express = require('express');
// const customerController = require('../../controllers/customer.controller');
const districtController = require('../../controllers/district.controller');
const router = express.Router();
router.route('/').post(districtController.createDistrict)
router.route('/:key').get(districtController.getAllDistrictDetails); 
router.route('/getAllDistrict_all/all').get(districtController.getAllDistrict_all); 
router
  .route('/:districtId')
  .get(districtController.getDistrictDetailsById)
  .put(districtController.updateDistrict)
  .delete(districtController.deleteDistrict);

module.exports = router;
