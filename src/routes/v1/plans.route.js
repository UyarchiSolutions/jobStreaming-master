const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const PlanController = require('../../controllers/plans.controller');
const authorization = require('../../controllers/empVEridy.controller');
const candAuth = require('../../controllers/tokenVerify.controller');
const router = express.Router();

router.route('/').post(PlanController.createEmployerPlan);
router.route('/all').get(PlanController.getPlanes);
router.route('/all/candidate').get(PlanController.getPlanesForCandidate);
router.route('/purchase/plan').post(candAuth, PlanController.purchasedPlanes);
router.route('/purchas/plan/user').get(candAuth, PlanController.getPurchasedPlanesByUser);
router.route('/getPurchasedPlan/Admin').get(PlanController.getPurchasedPlan_Admin);
router.route('/update/Purchased/Planes/:id').put(PlanController.updatePurchasedPlanes);
router.route('/getPurchased/PlanesByUser/request/Stream').get(candAuth, PlanController.getPurchasedPlanesByUser_request_Stream);
module.exports = router;
