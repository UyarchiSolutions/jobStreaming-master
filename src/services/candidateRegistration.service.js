const httpStatus = require('http-status');
const { CandidateRegistration, User } = require('../models');
const { Otpupdate } = require('../models/createPlan.model');
const mobileOtp = require('../config/mobilenumberVerify');
const { OTPModel } = require('../models');
const { Token } = require('../models');
const sendmail = require('../config/textlocal');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
// const {emailService} = require('../services');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const Axios = require('axios');
const moment = require('moment');
const { authService, userService, tokenService, emailService, candidateRegistrationService } = require('../services');
const e = require('express');

const createCandidate = async (userBody, files) => {};

const getUserById = async (id) => {
  const data = await CandidateRegistration.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
};

const verify_email = async (token) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ user: payload.sub, blacklisted: false });
  console.log(tokenDoc, payload);
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  const data = await CandidateRegistration.findByIdAndUpdate(
    { _id: tokenDoc.user },
    { isEmailVerified: true },
    { new: true }
  );
  return data;
};

const mobile_verify = async (mobilenumber) => {
  const data = await CandidateRegistration.findOne({ mobileNumber: mobilenumber });
  if (!data) {
    throw new Error('mobileNumber not found');
  }
  if (data.isMobileVerified == true && data.isEmailVerified == true) {
    throw new Error('mobileNumber already verified...');
  }
  await sendmail.Otp(data);
  return { message: 'Send Otp Succesfully' };
};

const mobile_verify_Otp = async (mobilenumber, otp) => {
  const data = await OTPModel.findOne({ mobileNumber: mobilenumber, otp: otp });
  if (!data) {
    throw new Error('wrong otp');
  }
  const verify = await CandidateRegistration.findByIdAndUpdate(
    { _id: data.userId },
    { isMobileVerified: true, isEmailVerified: true },
    { new: true }
  );
  return verify;
};

const forget_password = async (mobilenumber) => {
  const data = await CandidateRegistration.findOne({ mobileNumber: mobilenumber, active: true });
  if (!data) {
    throw new Error('mobileNumber not found');
  }
  await sendmail.forgetOtp(data);
  return { message: 'otp send successfully' };
};

const forget_password_Otp = async (body) => {
  const { mobilenumber, otp } = body;
  const data = await OTPModel.findOne({ otp: otp, mobileNumber: mobilenumber, active: true }).sort({ updatedAt: -1 });
  console.log(data);
  if (!data) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
  }

  const findotp = {
    create: moment(new Date()).subtract(1, 'minutes'),
  };
  const createTimestampString = data.updatedAt;
  const createTimestamp = moment(createTimestampString);

  if (createTimestamp.isBefore(findotp.create)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Expired');
  }

  await OTPModel.findByIdAndUpdate({ _id: data._id }, { active: false }, { new: true });
  const verify = await CandidateRegistration.findOne({ _id: data.userId }).select('email');
  return verify;
};

const forget_password_set = async (id, body) => {
  const { password, confirmpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  const data = await CandidateRegistration.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return data;
};

const UsersLogin = async (userBody) => {
  const { email, password } = userBody;
  let userName = await CandidateRegistration.findOne({ email: email });
  if (userName.isEmailVerified != true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Not Verified');
  }
  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email Not Registered');
  } else {
    if (await userName.isPasswordMatch(password)) {
      console.log('Password Macthed');
      await CandidateRegistration.findOneAndUpdate(
        { email: email },
        { latestdate: moment().format('YYYY-MM-DD') },
        { new: true }
      );
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passwoed Doesn't Match");
    }
  }
  return userName;
};

const forgot_verify_email = async (body) => {
  const { id, otp } = body;
  console.log(id, otp);
  const data = await OTPModel.findOne({ userId: id, otp: otp });
  if (data == null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'incorrect otp');
  }
  const data1 = await CandidateRegistration.findByIdAndUpdate(
    { _id: data.userId },
    { isEmailVerified: true },
    { new: true }
  );
  return data1;
};

const forgot = async (body) => {
  const data = await CandidateRegistration.findOne({ email: body.email });
  if (!data) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email Not Registered');
  }
  await emailService.sendforgotEmail(data.email, data._id);
  return data;
};

const change_password = async (id, body) => {
  const { password, confirmpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  const data = await CandidateRegistration.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return data;
};

const change_pass = async (userId, body) => {
  console.log(userId);
  const { oldpassword, newpassword, confirmpassword } = body;
  let userName = await CandidateRegistration.findById(userId);
  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User Not Found');
  } else {
    if (await userName.isPasswordMatch(oldpassword)) {
      console.log('Password Macthed');
      if (newpassword != confirmpassword) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Re-Enter Password Doesn't Match");
      } else {
        const salt = await bcrypt.genSalt(10);
        let password = await bcrypt.hash(newpassword, salt);
        await CandidateRegistration.findByIdAndUpdate({ _id: userId }, { password: password }, { new: true });
      }
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Oldpassword Doesn't Match");
    }
  }
  return userName;
};

const getMapLocation = async (query) => {
  let response = await Axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${query.lat},${query.long}&key=AIzaSyARM6-Qr_hsR53GExv9Gmu9EtFTV5ZuDX4`
  );
  return response.data;
};

const getAllLatLong = async (body) => {
  const { address } = body;
  const data = await CandidateRegistration.find({ currentAddress: address });
  return { data: data, count: data.length };
};

const deactivate = async (id) => {
  const value = CandidateRegistration.findById(id);
  if (!value) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'not found');
  }
  const data = await CandidateRegistration.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
  return data;
};

const update_email_send_otp = async (id, body) => {
  const data = await CandidateRegistration.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  const data1 = await CandidateRegistration.findOne({ email: body.email });
  if (data1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'already used this email');
  }
  await emailService.send_email_update(id, body.email);
  return { message: 'Send Otp Succesfully' };
};

const update_email_send_otp_verify = async (body) => {
  const data = await Otpupdate.findOne({ email: body.email, otp: body.otp });
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'incorrect email otp');
  }
  await Otpupdate.findByIdAndUpdate({ _id: data._id }, { active: false }, { new: true });
  // const value = await CandidateRegistration.findByIdAndUpdate({_id:data.userId}, {email:body.email}, {new:true})
  return data;
};

const update_mobilenumber_send_otp = async (id, body) => {
  const data = await CandidateRegistration.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  const data1 = await CandidateRegistration.findOne({ mobileNumber: body.mobileNumber });
  if (data1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'already used this number');
  }
  await mobileOtp.Otp(body);
  return { message: 'Send Otp Succesfully' };
};

const update_mobilenumber_otp_verify = async (body) => {
  const data = await Otpupdate.findOne({ mobilenumber: body.mobileNumber, otp: body.otp });
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'incorrect mobilenumber otp');
  }
  await Otpupdate.findByIdAndUpdate({ _id: data._id }, { active: false }, { new: true });
  return data;
};

const getUser_update = async (id, body) => {
  const data = await CandidateRegistration.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  const check = await Otpupdate.findOne({ email: body.email, active: false });
  if (data.email == body.email || (check.email == body.email && check.active == false)) {
    console.log('email verified');
    if (data.mobileNumber == body.mobileNumber || (check.mobilenumber == body.mobileNumber && check.active == false)) {
      console.log('mobile verified');
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Mobilenumber not verified');
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'email not verified');
  }
  const value = await CandidateRegistration.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

// const updateUserById = async (userId, updateBody) => {
//   const user = await getUserById(userId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
//   }
//   Object.assign(user, updateBody);
//   await user.save();
//   return user;
// };

// const deleteUserById = async (userId) => {
//   const user = await getUserById(userId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   await user.remove();
//   return user;
// };

module.exports = {
  createCandidate,
  verify_email,
  UsersLogin,
  forgot,
  forgot_verify_email,
  change_password,
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
  //   getUserById,
  //   getUserByEmail,
  //   updateUserById,
  //   deleteUserById,
};
