const httpStatus = require('http-status');
const moment = require('moment');
const { Volunteer, VolunteerOTP } = require('../models/vlounteer.model');
const { EventRegister } = require('../models/climb-event.model');
const { AgriCandidate, IntrestedCandidate, SlotBooking } = require('../models/agri.Event.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const axios = require('axios');
const createVolunteer = async (req) => {
  let body = req.body;
  let findByEmail = await Volunteer.findOne({ email: body.email });
  let findByMobile = await Volunteer.findOne({ mobileNumber: body.mobileNumber });
  if (findByEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Exists');
  }
  if (findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Exists');
  }
  let creations = await Volunteer.create(body);
  return creations;
};

const setPassword = async (req) => {
  const { password, email } = req.body;
  let findByemail = await Volunteer.findOne({ email: email });
  if (!findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found');
  }
  const salt = await bcrypt.genSalt(8);
  let pwd = await bcrypt.hash(password, salt);
  findByemail = await Volunteer.findByIdAndUpdate({ _id: findByemail._id }, { password: pwd }, { new: true });
  return findByemail;
};

const Login = async (req) => {
  const { password, email } = req.body;
  let findByemail = await Volunteer.findOne({ email: email });
  if (!findByemail || !(await findByemail.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return findByemail;
};

const getProfile = async (req) => {
  let id = req.userId;
  const findById = await Volunteer.findById(id);
  if (!findById) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'UnAuthorized');
  }
  return findById;
};

const MatchCandidate = async (req) => {
  let id = req.userId;
  let Role = req.Role;
  console.log(Role);
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer not found');
  }
  let volunSkills = values.skills;
  keySkillSearch = { active: true };
  if (volunSkills.length > 0) {
    let arr = [];
    volunSkills.forEach((e) => {
      arr.push({ skills: { $elemMatch: { $regex: e, $options: 'i' } } });
    });
    keySkillSearch = { $or: arr };
  } else {
    keySkillSearch;
  }

  let commingDataMatch = { active: true };

  if (values.Role == 'Tech Volunteer') {
    // console.log(values);
    let findCand = await AgriCandidate.aggregate([
      {
        $match: {
          $and: [keySkillSearch],
        },
      },
      // {
      //   $lookup: {
      //     from: 'intrestedcandidates',
      //     localField: '_id',
      //     foreignField: 'candId',
      //     as: 'Intrested',
      //   },
      // },
      // {
      //   $unwind: {
      //     path: '$Intrested',
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $lookup: {
          from: 'slotbookings',
          localField: '_id',
          foreignField: 'candId',
          pipeline: [{ $match: { streamStatus: 'Pending', Type: 'Tech' } }],
          as: 'candidate',
        },
      },
      {
        $unwind: '$candidate',
      },
      {
        $addFields: {
          isIdInArrayss: {
            $in: [id, '$intrest'],
          },
        },
      },
      {
        $addFields: {
          techIntrestss: {
            $in: [id, '$techIntrest'],
          },
        },
      },
      {
        $project: {
          _id: 1,
          skills: 1,
          name: 1,
          location: 1,
          yearOfPassing: 1,
          techIntrest: '$techIntrestss',
          intrest: 1,
          slotDate: '$candidate.date',
          slotTime: '$candidate.time',
          Type: '$candidate.Type',
          slotId: '$candidate._id',
          isIdInArray: '$isIdInArrayss',
          Tech: { $size: '$techIntrest' },
          HR: { $size: '$intrest' },
          // Intrested: '$Intrested',
          // status: '$Intrested.status',
        },
      },
      {
        $match: { Tech: { $lt: 5 } },
      },
    ]);

    return findCand;
  } else {
    let findCand = await AgriCandidate.aggregate([
      {
        $lookup: {
          from: 'slotbookings',
          localField: '_id',
          foreignField: 'candId',
          pipeline: [{ $match: { streamStatus: 'Pending', Type: 'HR' } }],
          as: 'candidate',
        },
      },
      {
        $unwind: '$candidate',
      },
      {
        $addFields: {
          isIdInArrayss: {
            $in: [id, '$intrest'],
          },
        },
      },
      {
        $addFields: {
          techIntrestss: {
            $in: [id, '$techIntrest'],
          },
        },
      },
      // {
      //   $lookup: {
      //     from: 'intrestedcandidates',
      //     localField: '_id',
      //     foreignField: 'candId',
      //     pipeline: [{ $match: { status: 'Approved' } }],
      //     as: 'Intrested',
      //   },
      // },
      // {
      //   $unwind: {
      //     path: '$Intrested',
      //   },
      // },
      {
        $project: {
          _id: 1,
          skills: 1,
          name: 1,
          location: 1,
          yearOfPassing: 1,
          techIntrest: 1,
          intrest: '$techIntrestss',
          slotDate: '$candidate.date',
          slotTime: '$candidate.time',
          Type: '$candidate.Type',
          slotId: '$candidate._id',
          isIdInArray: '$isIdInArrayss',
          Tech: { $size: '$techIntrest' },
          HR: { $size: '$intrest' },
          // Intrested: '$Intrested',
          // status: '$Intrested.status',
        },
      },
      {
        $match: { HR: { $lt: 5 } },
      },
      // {
      //   $match: { status: 'Approved' },
      // },
    ]);
    return findCand;
  }
};

const CandidateIntrestUpdate = async (req) => {
  let volunteerId = req.userId;
  let candId = req.params.id;
  let slotId = req.params.slotId;
  let cand = await AgriCandidate.findById(candId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, " Couldn't find candidate");
  }
  let slots = await SlotBooking.findById(slotId);
  if (!slots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slots Not Found');
  }
  let values = await Volunteer.findById(volunteerId);
  if (values.Role == 'HR Volunteer') {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { intrest: volunteerId } }, { new: true });
  } else {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { techIntrest: volunteerId } }, { new: true });
  }
  await IntrestedCandidate.create({
    candId: candId,
    volunteerId: volunteerId,
    status: 'Intrested',
    Role: values.Role,
    slotId: slotId,
    slotDate: slots.date,
    slotTime: slots.time,
    startTime: slots.DateTime,
    endTime: slots.endTime,
  });
  return cand;
};

const uploadProfileImage = async (req) => {
  let id = req.params.id;
  let findVol = await Volunteer.findById(id);
  if (!findVol) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer does not exist');
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
          let updateImgLoca = await Volunteer.findByIdAndUpdate({ _id: id }, { profileImage: res.Location }, { new: true });
          resolve(updateImgLoca);
        }
      });
    });
  }
};

const getVolunteersDetails = async (req) => {
  let id = req.userId;
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Found');
  }
  return values;
};

const getCandidatesForInterview = async (req) => {
  let id = req.userId;
  let role = req.Role == 'HR Volunteer' ? 'HR' : 'Tech';

  console.log(role);
  let statusMatch = { active: true };
  if (role == 'HR') {
    statusMatch = {
      hrStatus: 'Approved',
    };
  } else {
    statusMatch = {
      status: 'Approved',
    };
  }
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Found');
  }
  let candidates = await IntrestedCandidate.aggregate([
    {
      $match: { $and: [{ volunteerId: id }, statusMatch] },
    },
    {
      $lookup: {
        from: 'agricandidates',
        localField: 'candId',
        pipeline: [
          {
            $lookup: {
              from: 'slotbookings',
              localField: '_id',
              foreignField: 'candId',
              pipeline: [{ $match: { $and: [{ Type: { $eq: role } }] } }],
              as: 'slotbookings',
            },
          },
          { $unwind: '$slotbookings' },
          {
            $addFields: {
              DateTime: '$slotbookings.DateTime',
              channel: '$slotbookings._id',
              streamStatus: '$slotbookings.streamStatus',
              streamId: '$slotbookings._id',
            },
          },
        ],
        foreignField: '_id',
        as: 'Cand',
      },
    },
    {
      $unwind: '$Cand',
    },
    {
      $addFields: {
        DateTime: '$Cand.DateTime',
        channel: '$Cand.channel',
        streamStatus: '$Cand.streamStatus',
        streamId: '$Cand.streamId',
      },
    },
  ]);
  return candidates;
};

const updateVolunteer = async (req) => {
  let findById = await Volunteer.findById(req.params.id);
  if (!findById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer not found');
  }
  findById = await Volunteer.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
  return findById;
};

// const send_otp = async (req) => {
//   console.log(req.query.id)
//   let stream = await DemoPost.findById(req.query.id);
//   if (!stream) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
//   }
//   let res = await send_otp_now(stream);
//   return res;
// };

const send_otp_now = async (stream) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  let Datenow = new Date().getTime();
  let otpsend = await VolunteerOTP.findOne({
    VolunteerId: stream._id,
    otpExpiedTime: { $gte: Datenow },
    verify: false,
    expired: false,
  });
  if (!otpsend) {
    const token = await Volunteer.findById(stream._id);
    await VolunteerOTP.updateMany(
      { VolunteerId: stream._id, verify: false },
      { $set: { verify: true, expired: true } },
      { new: true }
    );
    let exp = moment().add(5, 'minutes');
    let otp = await VolunteerOTP.create({
      OTP: OTPCODE,
      verify: false,
      mobile: token.mobileNumber,
      VolunteerId: stream._id,
      DateIso: moment(),
      expired: false,
      otpExpiedTime: exp,
    });
    let message = `${OTPCODE} is the Onetime password(OTP) for mobile number verification . This is usable once and valid for 5 minutes from the request- Climb(An Ookam company product)`;
    let reva = await axios.get(
      `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${token.mobileNumber}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707170322899337958`
    );
    console.log(reva.data);
    otpsend = { otpExpiedTime: otp.otpExpiedTime };
  } else {
    otpsend = { otpExpiedTime: otpsend.otpExpiedTime };
  }
  return otpsend;
};

const sendOTP = async (req, res) => {
  let volunteer = await Volunteer.findById(req.query.id);
  if (!volunteer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP NOT Send');
  }
  let otpsend = await send_otp_now(volunteer);
  return otpsend;
};

const verify_otp = async (req) => {
  let { otp, stream } = req.body;
  const token = await SlotBooking.findById(stream);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }

  let Datenow = new Date().getTime();
  let verify = await Demootpverify.findOne({
    streamID: stream,
    OTP: otp,
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
    const stream = await SlotBooking.findById(verify.streamID);
    stream.otp_verifiyed = verify._id;
    stream.linkstatus = 'Verified';
    stream.save();
  }
  return verify;
};

const VerifyOTP = async (req) => {
  let { id, OTP } = req.body;
  let Datenow = new Date().getTime();
  let verify = await VolunteerOTP.findOne({
    VolunteerId: id,
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
    let values = await Volunteer.findById(verify.VolunteerId);
    return values;
  }
};

module.exports = {
  createVolunteer,
  setPassword,
  Login,
  getProfile,
  MatchCandidate,
  CandidateIntrestUpdate,
  uploadProfileImage,
  getVolunteersDetails,
  getCandidatesForInterview,
  updateVolunteer,
  sendOTP,
  VerifyOTP,
};
