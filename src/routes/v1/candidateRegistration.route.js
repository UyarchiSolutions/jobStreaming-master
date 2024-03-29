const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const candidateRegistration = require('../../controllers/candidateRegistration.controller');
const uploadImage = require('../../middlewares/upload');
const auth = require('../../middlewares/auth');
const authorization = require('../../controllers/tokenVerify.controller');
const author = require('../../controllers/empVEridy.controller');
const router = express.Router();

router.route('/register').post(candidateRegistration.register);
router.route('/otp/verification').post(candidateRegistration.otp_verification);
router.route('/otp/verify').post(candidateRegistration.verify_otp_now);
router.route('/setpassword').post(candidateRegistration.forget_password_set);

router.route('/email/verification').get(candidateRegistration.email_verification);
router.route('/email/verification').post(candidateRegistration.check_email_verification);



router.route('/userDetails').get(authorization, candidateRegistration.getUserById);
router.route('/update/basic/details').put(authorization, candidateRegistration.update_basic_details);
router.route('/update/other/details').put(authorization, candidateRegistration.update_other_details);
router.route('/update/resume').put(authorization, uploadImage, candidateRegistration.upload_resume);
router.route('/verify/email').put(authorization, candidateRegistration.verify_email_new);
router.route('/verify/mobile').put(authorization, candidateRegistration.verify_mobile);


router.route('/update/email').put(authorization, candidateRegistration.update_email_new);
router.route('/update/mobile').put(authorization, candidateRegistration.update_mobile);


router.route('/verify_email').put(candidateRegistration.verify_email);
router.route('/login').post(candidateRegistration.login);
router.route('/forgot').post(candidateRegistration.forgot);
router.route('/forgot_verify_email').post(candidateRegistration.forgot_verify_email);
router.route('/change_password').put(authorization, candidateRegistration.change_password);
router.route('/getMap/Location').get(candidateRegistration.getMapLocation);
router.route('/mobile_verify').post(candidateRegistration.mobile_verify);
router.route('/mobile_verify_Otp').post(candidateRegistration.mobile_verify_Otp);
router.route('/forget_password').post(candidateRegistration.forget_password);
router.route('/forget_password_Otp').post(candidateRegistration.forget_password_Otp);
router.route('/change_pass').post(authorization, candidateRegistration.change_pass);
router.route('/deactivate').post(authorization, candidateRegistration.deactivate);
router.route('/getUser_update/:id').put(candidateRegistration.getUser_update);
router.route('/update_email_send_otp/:id').put(candidateRegistration.update_email_send_otp);
router.route('/update_email_send_otp_verify').post(candidateRegistration.update_email_send_otp_verify);
router.route('/update_mobilenumber_send_otp/:id').put(candidateRegistration.update_mobilenumber_send_otp);
router.route('/update_mobilenumber_otp_verify').post(candidateRegistration.update_mobilenumber_otp_verify);
// map
router.route('/getAllLatLong').post(candidateRegistration.getAllLatLong);
router.route('/updateResume').put(authorization, uploadImage, candidateRegistration.updateResume);
// router.post('/logout', validate(authValidation.logout), authController.logout);
// router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
// router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
// router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
// router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
// router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);





module.exports = router;
