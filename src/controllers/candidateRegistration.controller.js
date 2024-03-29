const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');
const { OTPModel } = require('../models');
const { KeySkill } = require('../models/candidateDetails.model');
const { CandidateRegistration, User } = require('../models');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk');
const moment = require('moment');
const { http } = require('../config/logger');

const register = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.createCandidate(req);
  const tokens = await tokenService.generateAuthTokens(user);
  const savetoken = await candidateRegistrationService.create_email_verify(user, tokens);
  await emailService.sendVerificationEmail(user, savetoken.OTP);
  res.send({ tokens, userId: user._id });
});

const otp_verification = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.otp_verification(req);
  res.send(user);
});


const verify_otp_now = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.verify_otp_now(req);
  res.send(user);
});

const updateResume = catchAsync(async (req, res) => {
  let id = req.userId;
  let values = await CandidateRegistration.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate not Register');
  }
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: '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',
    region: 'ap-south-1',
  });
  let params = {
    Bucket: 'jobresume',
    Key: req.file.originalname,
    Body: req.file.buffer,
    ACL: 'public-read',
    ContentType: req.file.mimetype,
  };
  s3.upload(params, async (err, data) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'video upload Not Working..');
    } else {
      values = await CandidateRegistration.findByIdAndUpdate({ _id: id }, { resume: data.Location }, { new: true });
    }
    res.send(values);
  });
});

const verify_email = catchAsync(async (req, res) => {
  const { token } = req.body;
  const user = await candidateRegistrationService.verify_email(token);
  res.send({ user });
});

const mobile_verify = catchAsync(async (req, res) => {
  const { mobilenumber } = req.body;
  const user = await candidateRegistrationService.mobile_verify(mobilenumber);
  res.send(user);
});

const mobile_verify_Otp = catchAsync(async (req, res) => {
  const { mobilenumber, otp } = req.body;
  const user = await candidateRegistrationService.mobile_verify_Otp(mobilenumber, otp);
  res.send(user);
});

const forget_password = catchAsync(async (req, res) => {
  const { mobile } = req.body;
  const user = await candidateRegistrationService.forget_password(mobile);
  res.send(user);
});

const forget_password_Otp = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forget_password_Otp(req.body);
  res.send(user);
});

const forget_password_set = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forget_password_set(req.body);
  res.send(user);
});

const email_verification = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.email_verification(req);
  res.send(user);
});
const check_email_verification = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.check_email_verification(req);
  res.send(user);
});

const login = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.UsersLogin(req.body);
  const token = await tokenService.generateAuthTokens(user);
  res.send({ token, user });
});

const forgot = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forgot(req.body);
  res.send({ user });
});

const change_password = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.change_password(req.userId, req.body);
  res.send({ user });
});

const forgot_verify_email = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forgot_verify_email(req.body);
  res.send({ user });
});

const getUserById = catchAsync(async (req, res) => {
  let userId = req.userId;
  console.log(userId)
  const user = await candidateRegistrationService.getUserById(userId);
  res.send(user);
});

const update_basic_details = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_basic_details(req);
  res.send(user);
});


const update_other_details = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_other_details(req);
  res.send(user);
});

const upload_resume = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.upload_resume(req);
  res.send(user);
});



const verify_email_new = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.verify_email_new(req);
  res.send(user);
});

const verify_mobile = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.verify_mobile(req);
  res.send(user);
});

const update_email_new = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_email_new(req);
  res.send(user);
});
const update_mobile = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_mobile(req);
  res.send(user);
});

const getMapLocation = catchAsync(async (req, res) => {
  const data = await candidateRegistrationService.getMapLocation(req.query);
  res.send(data);
});

const change_pass = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await candidateRegistrationService.change_pass(userId, req.body);
  res.send(user);
});

const getAllLatLong = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.getAllLatLong(req.body);
  res.send(user);
});

const deactivate = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await candidateRegistrationService.deactivate(userId);
  res.send(user);
});

const getUser_update = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.getUser_update(req.params.id, req.body);
  res.send(user);
});

const update_email_send_otp = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_email_send_otp(req.params.id, req.body);
  res.send(user);
});

const update_email_send_otp_verify = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_email_send_otp_verify(req.body);
  res.send(user);
});

const update_mobilenumber_send_otp = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_mobilenumber_send_otp(req.params.id, req.body);
  res.send(user);
});

const update_mobilenumber_otp_verify = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.update_mobilenumber_otp_verify(req.body);
  res.send(user);
});
// const logout = catchAsync(async (req, res) => {
//   await authService.logout(req.body.refreshToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const refreshTokens = catchAsync(async (req, res) => {
//   const tokens = await authService.refreshAuth(req.body.refreshToken);
//   res.send({ ...tokens });
// });

// const forgotPassword = catchAsync(async (req, res) => {
//   const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
//   await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const resetPassword = catchAsync(async (req, res) => {
//   await authService.resetPassword(req.query.token, req.body.password);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const sendVerificationEmail = catchAsync(async (req, res) => {
//   const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
//   await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
//   res.status(httpStatus.NO_CONTENT).send();
// });

// const verifyEmail = catchAsync(async (req, res) => {
//   await authService.verifyEmail(req.query.token);
//   res.status(httpStatus.NO_CONTENT).send();
// });

module.exports = {
  register,
  verify_email,
  login,
  forgot,
  change_password,
  forgot_verify_email,
  getUserById,
  getMapLocation,
  mobile_verify,
  mobile_verify_Otp,
  forget_password,
  forget_password_Otp,
  forget_password_set,
  change_pass,
  getAllLatLong,
  deactivate,
  getUser_update,
  update_email_send_otp,
  update_email_send_otp_verify,
  update_mobilenumber_send_otp,
  update_mobilenumber_otp_verify,
  //   logout,
  //   refreshTokens,
  //   forgotPassword,
  //   resetPassword,
  //   sendVerificationEmail,
  //   verifyEmail,
  updateResume,
  otp_verification,
  verify_otp_now,
  update_basic_details,
  update_other_details,
  upload_resume,
  verify_email_new,
  verify_mobile,
  update_email_new,
  update_mobile,
  email_verification,
  check_email_verification

};
