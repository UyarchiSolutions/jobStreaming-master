const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, EmployerRegistration } = require('../services');
const { EmployeOtp } = require('../models');

const register = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.createEmployer(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  //  await EmployeOtp.create({token:tokens.access.token});
  await user.save();
  res.status(httpStatus.CREATED).send({ user, tokens });
  //   console.log(user._id)
  await emailService.sendVerificationEmailEmp(user, tokens.access.token);
});

const verify_email = catchAsync(async (req, res) => {
  const { token, otp } = req.body;
  const user = await EmployerRegistration.verify_email(token, otp);
  res.send({ user });
});

const mobile_verify = catchAsync(async (req, res) => {
  const { mobilenumber } = req.body;
  const user = await EmployerRegistration.mobile_verify(mobilenumber);
  res.send(user);
});

const mobile_verify_Otp = catchAsync(async (req, res) => {
  const { mobilenumber, otp } = req.body;
  const user = await EmployerRegistration.mobile_verify_Otp(mobilenumber, otp);
  res.send(user);
});

const forget_password = catchAsync(async (req, res) => {
  const { mobilenumber } = req.body;
  const user = await EmployerRegistration.forget_password(mobilenumber);
  res.send(user);
});

const forget_password_Otp = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.forget_password_Otp(req.body);
  res.send(user);
});

const forget_password_set = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.forget_password_set(req.params.id, req.body);
  res.send(user);
});

const login = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.UsersLogin(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send(tokens);
});

const forgot = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.forgot(req.body);
  res.send({ user });
});

const change_password = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.change_password(req.params.id, req.body);
  res.send({ user });
});

const forgot_verify_email = catchAsync(async (req, res) => {
  const user = await EmployerRegistration.forgot_verify_email(req.body);
  res.send({ user });
});

const getUserById = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await EmployerRegistration.getUserById(userId);
  res.send({ user });
});

const change_pass = catchAsync(async (req, res) => {
  let userId = req.userId;
  const user = await EmployerRegistration.change_pass(userId, req.body);
  res.send(user);
});

const getbyAll_lat_lang = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.getbyAll_lat_lang(req.body);
  res.send(data);
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

const employerRegistration = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.employerRegistration(req.params.page);
  res.send({ data });
});

const employerRegistration_Approved = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.employerRegistration_Approved(req.params.page);
  res.send({ data });
});

const updateByIdEmployerRegistration = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.updateByIdEmployerRegistration(req.params.id, req.body);
  res.send({ data });
});

const getEmployerById = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.getEmployerById(req.params.id);
  res.send(data);
});

const uploadProfileImage = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.uploadProfileImage(req);
  res.send(data);
});

const uploadEmployerFile = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.uploadEmployerFile(req);
  res.send(data);
});

const sendOTP = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.sendOTP(req);
  res.send(data);
});

const VerifyOTP = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.VerifyOTP(req);
  res.send(data);
});

const getEmployerByMobile = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.getEmployerByMobile(req);
  res.send(data);
});

const setPasswordById = catchAsync(async (req, res) => {
  const data = await EmployerRegistration.setPasswordById(req);
  res.send(data);
})

module.exports = {
  register,
  verify_email,
  login,
  forgot,
  change_password,
  forgot_verify_email,
  getUserById,
  employerRegistration,
  employerRegistration_Approved,
  updateByIdEmployerRegistration,
  mobile_verify,
  mobile_verify_Otp,
  forget_password,
  forget_password_Otp,
  forget_password_set,
  change_pass,
  getbyAll_lat_lang,
  getEmployerById,
  uploadProfileImage,
  uploadEmployerFile,
  sendOTP,
  VerifyOTP,
  getEmployerByMobile,
  setPasswordById
  //   logout,
  //   refreshTokens,
  //   forgotPassword,
  //   resetPassword,
  //   sendVerificationEmail,
  //   verifyEmail,
};
