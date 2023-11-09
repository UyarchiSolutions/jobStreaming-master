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

module.exports = router;
