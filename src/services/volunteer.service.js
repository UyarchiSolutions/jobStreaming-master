const httpStatus = require('http-status');
const moment = require('moment');
const { Volunteer } = require('../models/vlounteer.model');
const { EventRegister } = require('../models/climb-event.model');
const { AgriCandidate } = require('../models/agri.Event.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

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
  cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { intrest: volunteerId } }, { new: true });
  return cand;
};

module.exports = { createVolunteer, setPassword, Login, getProfile, MatchCandidate, CandidateIntrestUpdate };
