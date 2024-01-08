const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { ClimbCandidate, CandOTP } = require('../models/climb.cand.model');
const AWS = require('aws-sdk');
const axios = require('axios');

const createClimbCand = async (req) => {
  let findByMobile = await ClimbCandidate.findOne({ mobile: req.body.mobile });
  if (findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Exists');
  }
  let findByEmial = await ClimbCandidate.findOne({ mail: req.body.mail });
  if (findByEmial) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'E-mail Number Already Exists');
  }
  let SMSsend = await CandidateOTP(req.body.mobile);
  console.log(SMSsend);
  let creations = await ClimbCandidate.create(req.body);
  return creations;
};

const ResumeUploadCand = async (req) => {
  let id = req.params.id;
  let findCand = await ClimbCandidate.findById(id);
  if (!findCand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not Found');
  }
  if (req.file) {
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
      s3.upload(params, async (err, res) => {
        if (err) {
          reject(err);
        } else {
          findCand = await ClimbCandidate.findByIdAndUpdate({ _id: id }, { resume: res.Location }, { new: true });
          resolve(findCand);
        }
      });
    });
  }
};

const updateClimbCand = async (req) => {
  let id = req.params.id;
  let cand = await ClimbCandidate.findById(id);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  cand = await ClimbCandidate.findByIdAndUpdate({ _id: id }, req.body, { new: true });
  return cand;
};

const CandidateOTP = async (mobile) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  const newTime = moment().add(5, 'minutes');
  await CandOTP.create({
    OTP: OTPCODE,
    Mobile: mobile,
    ExpireTime: newTime,
  });
  let message = `${OTPCODE} is the Onetime password(OTP) for mobile number verification . This is usable once and valid for 5 minutes from the request- Climb(An Ookam company product)`;
  let reva = await axios.get(
    `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${mobile}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707170322899337958`
  );
  return reva.data;
};

const VerifyOTP = async (req) => {
  let { OTP, Mobile } = req.body;
  let findOTP = await CandOTP.findOne({
    OTP: OTP,
    Mobile: Mobile,
    Used: false,
  });
  if (!findOTP) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  const dateFromTimestamp = new Date(findOTP.ExpireTime);
  const currentDate = new Date();
  if (currentDate > dateFromTimestamp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP expired');
  }
  await CandOTP.findByIdAndUpdate({ _id: findOTP._id }, { used: true }, { new: true });
  let findCandidate = await ClimbCandidate.findOne({ mobile: Mobile });
  if (!findCandidate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Users');
  }
  return findCandidate;
};

const SetPassword = async (req, res) => {
  const { password, id } = req.body;
  let values = await ClimbCandidate.findById(id);
  if (!values) {
    throw new ApiError('User Not Found');
  }
  let salt = await bcrypt.genSalt(8);
  let hashPassword = await bcrypt.hash(password, salt);
  values.password = hashPassword;
  values.save();
  return values;
};

const LoginClimbCandidate = async (req) => {
  const { email, password } = req.body;
  let findCandidate = await ClimbCandidate.findOne({ mail: email });
  console.log();
  if (!findCandidate || !(await bcrypt.compare(password, findCandidate.password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect E-mail Or Password');
  }
  return findCandidate;
};

module.exports = {
  createClimbCand,
  ResumeUploadCand,
  updateClimbCand,
  VerifyOTP,
  SetPassword,
  LoginClimbCandidate,
};
