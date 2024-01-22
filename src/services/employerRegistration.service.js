const httpStatus = require('http-status');
const { EmployerRegistration } = require('../models/employerRegistration.model');
const { EmployeOtp } = require('../models');
const { emailService } = require('../services');
const { OTPModel } = require('../models');
const { Token } = require('../models');
const sendmail = require('../config/textlocal');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const AWS = require('aws-sdk');
const { EmployerOTP } = require('../models/employerDetails.model');
const axios = require('axios');

const createEmployer = async (userBody) => {
  if (await EmployerRegistration.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (!userBody.password == userBody.confirmpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Confirm Password Incorrect');
  }
  let findByMobile = await EmployerRegistration.findOne({ mobileNumber: userBody.mobileNumber });
  if (findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile NumberAlready Exists');
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

const getEmployerById = async (id) => {
  let values = await EmployerRegistration.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employer Registration Not Found');
  }
  return values;
};

// const s3 = new AWS.S3({
//   accessKeyId: 'AKIA3323XNN7Y2RU77UG',
//   secretAccessKey: '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',
//   region: 'ap-south-1',
// });
// let params = {
//   Bucket: 'jobresume',
//   Key: req.file.originalname,
//   Body: req.file.buffer,
//   ACL: 'public-read',
//   ContentType: req.file.mimetype,
// };
// s3.upload(params, async (err, data) => {
//   let values = { ...req.body, ...{ date: date, resume: data.Location } };
//   let d = await CandidateRegistration.create(values);
//   const tokens = await tokenService.generateAuthTokens(d);
//   res.status(httpStatus.CREATED).send({ user: d, tokens });
//   await emailService.sendVerificationEmail(req.body.email, tokens.access.token, req.body.mobileNumber);
// });

const uploadProfileImage = async (req) => {
  let id = req.params.id;
  let findEmployee = await EmployerRegistration.findById(id);
  if (!findEmployee) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Naot Found');
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
  return new Promise((resolve) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error(err);
      }
      findEmployee = await EmployerRegistration.findByIdAndUpdate({ _id: id }, { logo: data.Location }, { new: true });
      resolve(findEmployee);
    });
  });
};

const uploadEmployerFile = async (req) => {
  let id = req.params.id;
  let findEmployee = await EmployerRegistration.findById(id);
  if (!findEmployee) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Naot Found');
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
  return new Promise((resolve) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error(err);
      }
      findEmployee = await EmployerRegistration.findByIdAndUpdate({ _id: id }, { choosefile: data.Location }, { new: true });
      resolve(findEmployee);
    });
  });
};

const send_otp_now = async (stream) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  let Datenow = new Date().getTime();
  let otpsend = await EmployerOTP.findOne({
    empId: stream._id,
    otpExpiedTime: { $gte: Datenow },
    verify: false,
    expired: false,
  });
  if (!otpsend) {
    const token = await EmployerRegistration.findById(stream._id);
    await EmployerOTP.updateMany(
      { empId: stream._id, verify: false },
      { $set: { verify: true, expired: true } },
      { new: true }
    );
    let exp = moment().add(5, 'minutes');
    let otp = await EmployerOTP.create({
      OTP: OTPCODE,
      verify: false,
      mobile: token.mobileNumber,
      empId: stream._id,
      DateIso: moment(),
      expired: false,
      otpExpiedTime: exp,
    });
    let message = `${OTPCODE} is the Onetime password(OTP) for mobile number verification . This is usable once and valid for 5 minutes from the request- Climb(An Ookam company product)`;
    let reva = await axios.get(
      `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${token.mobileNumber}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707170322899337958`
    );
    console.log(reva.data, 'asdas');
    otpsend = { otpExpiedTime: otp.otpExpiedTime };
  } else {
    otpsend = { otpExpiedTime: otpsend.otpExpiedTime };
  }
  return otpsend;
};

const sendOTP = async (req) => {
  let emp = await EmployerRegistration.findById(req.query.id);
  if (!emp) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP NOT Send');
  }
  let otpsend = await send_otp_now(emp);
  return otpsend;
};

const VerifyOTP = async (req) => {
  let { id, OTP } = req.body;
  let Datenow = new Date().getTime();
  let verify = await EmployerOTP.findOne({
    empId: id,
    OTP: OTP,
    verify: false,
    expired: false,
    otpExpiedTime: { $gt: Datenow },
  });
  if (!verify) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid OTP');
  } else {
    verify.verify = true;
    verify.expired = true;
    verify.save();
    return { verfiedOTP: verify._id };
  }
};

const getEmployerByMobile = async (req) => {
  const { mobileNumber } = req.body;
  let employer = await EmployerRegistration.findOne({ mobileNumber: mobileNumber });
  if (!employer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Not Registered');
  }
  return employer;
};

const setPasswordById = async (req) => {
  const { id, password } = req.body;
  let verify = await EmployerOTP.findById(id)
  if (!verify) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Verfication Need');
  }
  if (verify.setpassword == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Verfication Already used');
  }
  verify.setpassword = true;
  verify.save();
  let findEmp = await EmployerRegistration.findById(verify.empId);
  if (!findEmp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Employer Not Fouund');
  }
  console.log(req.body);
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  findEmp = await EmployerRegistration.findOneAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return findEmp;
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
  getEmployerById,
  uploadProfileImage,
  uploadEmployerFile,
  sendOTP,
  VerifyOTP,
  getEmployerByMobile,
  setPasswordById,
  //   getUserById,
  //   getUserByEmail,
  //   updateUserById,
  //   deleteUserById,
};
