const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');
const { OTPModel } = require('../models');
const { KeySkill } = require('../models/candidateDetails.model');
const { CandidateRegistration, User } = require('../models');
const ApiError = require('../utils/ApiError');
const AWS = require('aws-sdk');
const moment = require('moment');

const register = catchAsync(async (req, res) => {
  // const user = await candidateRegistrationService.createCandidate(req.body, req.file);
  const { password, confirmpassword } = req.body;
  let date = moment().format('YYYY-MM-DD');
  if (await CandidateRegistration.isEmailTaken(req.body.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Confirm Password Incorrect');
  }
  const s3 = new AWS.S3({
    accessKeyId: 'AKIA3323XNN7Y2RU77UG',
    secretAccessKey: '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',
    region: 'ap-south-1',
  });
  let params = {
    Bucket: 'jobresumeupload',
    Key: req.file.originalname,
    Body: req.file.buffer,
  };
  s3.upload(params, async (err, data) => {
    let values = { ...req.body, ...{ date: date, resume: data.Location } };
    let d = await CandidateRegistration.create(values);
    const tokens = await tokenService.generateAuthTokens(d);
    res.status(httpStatus.CREATED).send({ user: d, tokens });
    await emailService.sendVerificationEmail(req.body.email, tokens.access.token, req.body.mobileNumber);
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
  const { mobilenumber } = req.body;
  const user = await candidateRegistrationService.forget_password(mobilenumber);
  res.send(user);
});

const forget_password_Otp = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forget_password_Otp(req.body);
  res.send(user);
});

const forget_password_set = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forget_password_set(req.params.id, req.body);
  res.send(user);
});

const login = catchAsync(async (req, res) => {
  let Boolean = false;
  const user = await candidateRegistrationService.UsersLogin(req.body);
  // console.log(user)
  let details = await KeySkill.find({ userId: user._id });
  // console.log(details)
  if (details.length != 0) {
    Boolean = true;
  }
  // console.log(Boolean)
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens, Boolean });
});

const forgot = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forgot(req.body);
  res.send({ user });
});

const change_password = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.change_password(req.params.id, req.body);
  res.send({ user });
});

const forgot_verify_email = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.forgot_verify_email(req.body);
  res.send({ user });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await candidateRegistrationService.getUserById(req.params.id);
  res.send({ user });
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
  //   logout,
  //   refreshTokens,
  //   forgotPassword,
  //   resetPassword,
  //   sendVerificationEmail,
  //   verifyEmail,
};
