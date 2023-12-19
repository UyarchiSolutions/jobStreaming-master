const httpStatus = require('http-status');
const moment = require('moment');
const { Volunteer } = require('../models/vlounteer.model');
const { EventRegister } = require('../models/climb-event.model');
const { AgriCandidate, IntrestedCandidate } = require('../models/agri.Event.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');

const createVolunteer = async (req) => {
  let body = req.body;
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
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer not found');
  }
  let volunSkills = values.currentSkill;
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

  if (values.Role == 'Tech Volunteer') {
    let findCand = await AgriCandidate.aggregate([
      {
        $match: {
          $and: [keySkillSearch],
        },
      },
      {
        $addFields: {
          isIdInArray: {
            $in: [id, '$intrest'],
          },
        },
      },
    ]);

    return findCand;
  } else {
    let findCand = await AgriCandidate.aggregate([
      {
        $addFields: {
          isIdInArray: {
            $in: [id, '$intrest'],
          },
        },
      },
    ]);
    return findCand;
  }
};

const CandidateIntrestUpdate = async (req) => {
  let volunteerId = req.userId;
  let candId = req.params.id;
  let cand = await AgriCandidate.findById(candId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, " Couldn't find candidate");
  }
  let values = await Volunteer.findById(volunteerId);
  if (values.Role == 'HR Volunteer') {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { intrest: volunteerId } }, { new: true });
  } else {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { techIntrest: volunteerId } }, { new: true });
  }
  await IntrestedCandidate.create({ candId: candId, volunteerId: volunteerId, status: 'Intrested', Role: values.Role });
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
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Found');
  }
  let candidates = await IntrestedCandidate.aggregate([
    {
      $match: {
        volunteerId: id,
      },
    },
    {
      $lookup: {
        from: 'agricandidates',
        localField: 'candId',
        foreignField: '_id',
        as: 'Cand',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Cand',
      },
    },
  ]);
  return candidates;
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
};
