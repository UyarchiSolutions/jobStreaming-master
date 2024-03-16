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
const {
  AgriCandidate,
  AgriEventSlot,
  SlotBooking,
  IntrestedCandidate,
  agriCandReview,
  BookedSlot,
  Emailverify,
  OTPverify

} = require('../models/agri.Event.model');
const AWS = require('aws-sdk');


const createCandidate = async (req) => {

  let user = await AgriCandidate.findOne({ mobile: req.body.mobile, setPassword: true });
  if (user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Exists');
  }
  user = await AgriCandidate.findOne({ mail: req.body.mail, setPassword: true });
  if (user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Number Already Exists');
  }
  user = await AgriCandidate.findOne({ mail: req.body.mail, mobile: req.body.mobile });

  let values = req.body;
  if (user) {
    user = await AgriCandidate.findByIdAndUpdate({ _id: user._id }, values, { new: true });
  }
  else {
    user = await AgriCandidate.create(values);

  }

  return user;

};


const create_email_verify = async (user, token) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);

  await Emailverify.updateMany({ userId: user._id, status: "Pending" }, { $set: { status: "expired" } }, { new: true })
  let tokens = await Emailverify.create({ token: token.access.token, userId: user._id, type: "Candidate", OTP: OTPCODE });
  return tokens;
}


const otp_verification = async (req) => {

  let email = await Emailverify.findById(req.body.token);
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invaid Link');
  }
  if (email.status != 'Pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invaid Link Status');
  }
  let user = await AgriCandidate.findById(email.userId);
  // console.log(user, 879765)
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  user.emailVerify = 'Verified';
  user.save();
  let otp = await send_otp_now(user);
  return otp;
}

const verify_otp_now = async (req) => {
  let email = await Emailverify.findById(req.body.token);
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invaid Link');
  }
  if (email.status != 'Pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invaid Link Status');
  }
  let user = await AgriCandidate.findById(email.userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  console.log({ type: "Candidate", userId: user._id, OTP: req.body.OTP });
  let otp = await OTPverify.findOne({ type: "Candidate", userId: user._id, OTP: req.body.OTP });
  if (!otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  if (otp.verify) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Already used');
  }
  otp.verify = true;
  otp.save();
  user.mobileVerify = 'Verified';
  user.save();
  email.status = 'Used';
  email.save();
  return { accessToken: email.token };
}



const update_mobile_number = async (mobile, userId) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  let Datenow = new Date().getTime();
  let otpsend = await OTPverify.findOne({
    userId: userId,
    type: "Candidate",
    otpExpiedTime: { $gte: Datenow },
    verify: false,
    expired: false,
    mobile: mobile
  });
  console.log(otpsend, 8767)
  if (!otpsend) {
    await OTPverify.updateMany({ empId: userId, verify: false, type: "Candidate", }, { $set: { verify: true, expired: true } }, { new: true });
    let exp = moment().add(5, 'minutes');
    let otp = await OTPverify.create({
      OTP: OTPCODE,
      verify: false,
      mobile: mobile,
      userId: userId,
      DateIso: moment(),
      expired: false,
      otpExpiedTime: exp,
      type: "Candidate",
    });
    let message = `${OTPCODE} is the Onetime password(OTP) for mobile number verification . This is usable once and valid for 5 minutes from the request- Climb(An Ookam company product)`;
    let reva = await Axios.get(
      `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${mobile}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707170322899337958`
    );
    otpsend = { otpExpiedTime: otp.otpExpiedTime };
  } else {
    otpsend = { otpExpiedTime: otpsend.otpExpiedTime };
  }
  return otpsend;
};

const send_otp_now = async (user) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  let Datenow = new Date().getTime();
  let otpsend = await OTPverify.findOne({
    userId: user._id,
    type: "Candidate",
    otpExpiedTime: { $gte: Datenow },
    verify: false,
    expired: false,
  });
  if (!otpsend) {
    await OTPverify.updateMany({ empId: user._id, verify: false, type: "Candidate", }, { $set: { verify: true, expired: true } }, { new: true });
    let exp = moment().add(5, 'minutes');
    let otp = await OTPverify.create({
      OTP: OTPCODE,
      verify: false,
      mobile: user.mobile,
      userId: user._id,
      DateIso: moment(),
      expired: false,
      otpExpiedTime: exp,
      type: "Candidate",
    });
    let message = `${OTPCODE} is the Onetime password(OTP) for mobile number verification . This is usable once and valid for 5 minutes from the request- Climb(An Ookam company product)`;
    let reva = await Axios.get(
      `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${user.mobile}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707170322899337958`
    );
    otpsend = { otpExpiedTime: otp.otpExpiedTime };
  } else {
    otpsend = { otpExpiedTime: otpsend.otpExpiedTime };
  }

  console.log(otpsend)
  return otpsend;
};


const getUserById = async (id) => {

  const data = await AgriCandidate.findById(id, 'status Education Instituitionname affiliateduniversity course createdAt dob experience_month experience_year gender language location mail mobile name resumeUrl skills yearOfPassing ')
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  return data;
};

const update_basic_details = async (req) => {
  let cand = await AgriCandidate.findById(req.userId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  const { name, gender, location } = req.body;

  cand = await AgriCandidate.findByIdAndUpdate({ _id: req.userId }, { name, gender, location }, { new: true }).select("-password")
  return cand;
};

const update_other_details = async (req) => {
  const { skills,
    Instituitionname,
    affiliateduniversity,
    Education,
    course,
    yearOfPassing,
    dob,
    language,
    experience_year,
    experience_month } = req.body;
  let cand = await AgriCandidate.findById(req.userId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  const { name, gender, location } = req.body;

  cand = await AgriCandidate.findByIdAndUpdate({ _id: req.userId }, {
    skills,
    Instituitionname,
    affiliateduniversity,
    Education,
    course,
    yearOfPassing,
    dob,
    language,
    experience_year,
    experience_month
  }, { new: true }).select("-password")
  return cand;

}

const upload_resume = async (req) => {
  let id = req.userId;
  let values = await AgriCandidate.findById(id);
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
  return new Promise((resolve, reject) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'video upload Not Working..');
      }
      values = await AgriCandidate.findByIdAndUpdate({ _id: id }, { resumeUrl: data.Location }, { new: true });
      resolve(values)
    });

  })
}

const verify_email_new = async (req) => {

}
const verify_mobile = async (req) => {

  let userId = req.userId;
  let user = await AgriCandidate.findById(userId);
  let mobile = req.body.mobile;
  let ext = await AgriCandidate.findOne({ mobile: mobile });
  if (ext) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This  Number Add Another Account');

  }
  let otp = await update_mobile_number(mobile, userId);
  return otp;
}

const update_email_new = async (req) => {


}
const update_mobile = async (req) => {
  let userId = req.userId;
  let user = await AgriCandidate.findById(userId);

  let otp = await OTPverify.findOne({ type: "Candidate", userId: user._id, OTP: req.body.OTP, verify: false });
  if (!otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  if (otp.verify) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Already used');
  }
  otp.verify = true;
  otp.save();
  user.mobile = otp.mobile;
  user.save();
  return { mobile: user.mobile };
}

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
  const data = await OTPModel.findOne({ otp: otp, mobileNumber: mobilenumber, active: true }).sort({ createdAt: -1 });
  console.log(data);
  if (!data) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
  }
  const findotp = {
    create: moment(new Date()).subtract(1, 'minutes'),
  };
  const createTimestampString = data.createdAt;
  const createTimestamp = moment(createTimestampString);
  if (createTimestamp.isBefore(findotp.create)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Expired');
  }
  await OTPModel.findByIdAndUpdate({ _id: data._id }, { active: false }, { new: true });
  return { message: 'Otp Verification Success' };
};

const forget_password_set = async (body) => {
  const { password, confirmpassword, token } = body;
  try {
    const payload = jwt.verify(token, config.jwt.secret);

    if (password != confirmpassword) {
      throw new ApiError(httpStatus.NOT_FOUND, 'confirmpassword wrong');
    }
    const salt = await bcrypt.genSalt(10);
    let password1 = await bcrypt.hash(password, salt);
    await AgriCandidate.findByIdAndUpdate({ _id: payload.sub }, { password: password1, setPassword: true }, { new: true });
    return { setpassword: "Successfull" };

  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Acccess');
  }

};

const email_verification = async (req) => {
  const token = req.headers.token;
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const cand = await AgriCandidate.findById(payload.sub, 'mail mobile name');
    // const email = await Emailverify.findOne({ emailverifyed: false, userId: cand._id, type: "Candidate" });
    return cand;
  }
  catch (error) {

  }
}

const check_email_verification = async (req) => {
  const token = req.headers.token;
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const cand = await AgriCandidate.findById(payload.sub, 'mail mobile name');
    const email = await Emailverify.findOne({ emailverifyed: false, userId: cand._id, OTP: req.body.OTP, type: "Candidate", }, 'type userId token');

    if (!email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }
    email.emailverifyed = true;
    console.log(email)
    return email;
  }
  catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

}

const UsersLogin = async (userBody) => {
  const { email, password } = userBody;
  let userName = await AgriCandidate.findOne({ mail: email });

  if (!userName) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email Not Registered');
  }
  if (userName.emailVerify != 'Verified') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Not Verified');
  }
  if (!await userName.isPasswordMatch(password)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password Doesn't Match");
  }
  userName = await AgriCandidate.findOneAndUpdate(
    { mail: email },
    { latestdate: moment().format('YYYY-MM-DD') },
    { new: true }
  );
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
  let data = await AgriCandidate.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User');
  }
  const { password, confirmpassword, oldpassword } = body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'confirmpassword wrong');
  }
  if (!await data.isPasswordMatch(oldpassword)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Old Password Doesn't Match");
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  data = await AgriCandidate.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
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
  const data = await AgriCandidate.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Registration');
  }
  const data1 = await AgriCandidate.findOne({ mobile: body.mobile });
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
  send_otp_now,
  otp_verification,
  create_email_verify,
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
  //   getUserById,
  //   getUserByEmail,
  //   updateUserById,
  //   deleteUserById,
};
