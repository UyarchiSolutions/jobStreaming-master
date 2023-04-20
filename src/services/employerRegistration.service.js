const httpStatus = require('http-status');
const { EmployerRegistration } = require('../models');
const { EmployeOtp } = require('../models');
const { emailService } = require('../services');
const { OTPModel } = require('../models');
const { Token } = require('../models');
const sendmail = require('../config/textlocal');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const createEmployer = async (userBody) => {
  const { password, confirmpassword } = userBody;
  console.log(userBody);

  if (await EmployerRegistration.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (!userBody.password == userBody.confirmpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Confirm Password Incorrect');
  }

  let data = await EmployerRegistration.create(userBody);
  return data;
};

const getUserById = async (id) => {
  // console.log(id)
  const data = await EmployerRegistration.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  return data;
};
// const getUserByEmail = async (email) => {
//   return User.findOne({ email });
// };

const verify_email = async (token, otp) => {
  const data = await EmployeOtp.findOne({ token: token, otp: otp });
  if (data == null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'incorrect otp');
  }
  const data1 = await EmployerRegistration.findByIdAndUpdate({ _id: data.userId }, { isEmailVerified: true }, { new: true });
  return data1;
};

const mobile_verify = async (mobilenumber) => {
  const data = await EmployerRegistration.findOne({ mobileNumber: mobilenumber });
  if (!data) {
    throw new Error('mobileNumber not found');
  }
  if (data.isEmailVerified == true && data.isMobileVerified == true) {
    throw new Error('mobileNumber already verified..');
  }
  await sendmail.Otp(data);
  return { message: 'Send Otp Succesfully' };
};

const mobile_verify_Otp = async (mobilenumber, otp) => {
  const data = await OTPModel.findOne({ mobileNumber: mobilenumber, otp: otp });
  if (!data) {
    throw new Error('mobileNumber not found');
  }
  const verify = await EmployerRegistration.findByIdAndUpdate(
    { _id: data.userId },
    { isMobileVerified: true, isEmailVerified: true },
    { new: true }
  );
  return verify;
};

const forget_password = async (mobilenumber) => {
  const data = await EmployerRegistration.findOne({ mobileNumber: mobilenumber, active: true });
  if (!data) {
    throw new Error('mobileNumber not found');
  }
  await sendmail.forgetOtp(data);
  return { message: 'otp send successfully' };
};

const forget_password_Otp = async (body) => {
  const { mobilenumber, otp } = body;
  const data = await OTPModel.findOne({ otp: otp, mobileNumber: mobilenumber });
  if (!data) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'otp inValid');
  }
  const verify = await EmployerRegistration.findOne({ _id: data.userId }).select('email');
  return verify;
};

const forget_password_set = async (id, body) => {
  const { password, confirmpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  const data = await EmployerRegistration.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return data;
};

const UsersLogin = async (userBody) => {
  const { email, password } = userBody;
  let date = moment().format('YYYY-MM-DD');
  let userName = await EmployerRegistration.findOne({ email: email });
  if (userName.adminStatus == 'Pending' || userName.adminStatus == 'false') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Admin Not Approved');
  }
  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email Not Registered');
  } else {
    if (userName.adminStatus == 'debarred') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Your account is debarred');
    }
    if (userName.active == false) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Your account is de_active');
    }
    if (await userName.isPasswordMatch(password)) {
      await EmployerRegistration.findByIdAndUpdate({ _id: userName._id }, { latestdate: date }, { new: true });
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Passwoed Doesn't Match");
    }
  }
  return userName;
};

const forgot_verify_email = async (body) => {
  const { id, otp } = body;
  console.log(id, otp);
  const data = await EmployeOtp.findOne({ userId: id, otp: otp });
  if (data == null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'incorrect otp');
  }
  const data1 = await EmployerRegistration.findByIdAndUpdate({ _id: data.userId }, { isEmailVerified: true }, { new: true });
  return data1;
};

const forgot = async (body) => {
  const data = await EmployerRegistration.findOne({ email: body.email });
  if (!data) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email Not Registered');
  }
  await emailService.sendforgotEmailEmp(data.email, data._id);
  return data;
};

const change_password = async (id, body) => {
  const { password, confirmpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  const data = await EmployerRegistration.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return data;
};

const change_pass = async (userId, body) => {
  const { oldpassword, newpassword, confirmpassword } = body;
  let userName = await EmployerRegistration.findById(userId);
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
        await EmployerRegistration.findByIdAndUpdate({ _id: userId }, { password: password }, { new: true });
      }
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Oldpassword Doesn't Match");
    }
  }
  return userName;
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

const employerRegistration = async (page) => {
  const data = await EmployerRegistration.find()
    .limit(10)
    .skip(10 * page);
  let count = await EmployerRegistration.find();

  return { data: data, count: count.length };
};

const employerRegistration_Approved = async (page) => {
  const data = await EmployerRegistration.aggregate([
    {
      $match: {
        $and: [{ adminStatus: { $eq: 'Approved' } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: '_id',
        foreignField: 'userId',
        as: 'employerdetails',
      },
    },
    {
      $unwind: '$employerdetails',
    },
    {
      $project: {
        name: 1,
        email: 1,
        workStatus: 1,
        mobileNumber: 1,
        createdAt: 1,
        resume: 1,
        adminStatus: 1,
        companyType: 1,
        companyName: 1,
        adminStatus: 1,
        status: '$employerdetails.adminStatus',
        jobTittle: '$employerdetails.jobTittle',
        experienceFrom: '$employerdetails.experienceFrom',
        experienceTo: '$employerdetails.experienceTo',
        interviewType: '$employerdetails.interviewType',
        salaryRangeFrom: '$employerdetails.salaryRangeFrom',
        salaryRangeTo: '$employerdetails.salaryRangeTo',
        postJob_id: '$employerdetails._id',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
      },
    },
    { $sort: { date: -1, time: -1 } },
    { $skip: 10 * page },
    { $limit: 10 },
  ]);
  const count = await EmployerRegistration.aggregate([
    {
      $match: {
        $and: [{ adminStatus: { $eq: 'Approved' } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: '_id',
        foreignField: 'userId',
        as: 'employerdetails',
      },
    },
    {
      $unwind: '$employerdetails',
    },
  ]);
  return { data: data, count: count.length };
};

const updateByIdEmployerRegistration = async (id, updateBody) => {
  const user = await EmployerRegistration.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerRegistration not found');
  }
  const data = await EmployerRegistration.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  await data.save();
  return data;
};

const getbyAll_lat_lang = async (body) => {
  const { location } = body;
  const data = await EmployerRegistration.find({ location: location });
  return { data: data, count: data.length };
};
module.exports = {
  createEmployer,
  verify_email,
  UsersLogin,
  forgot,
  forgot_verify_email,
  change_password,
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
  //   getUserById,
  //   getUserByEmail,
  //   updateUserById,
  //   deleteUserById,
};
