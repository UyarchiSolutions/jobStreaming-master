const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const Agora = require('agora-access-token');
const axios = require('axios');
const { EmployerDetails, Jobpoststream, Applypost, Myinterview, Candidateinterview, Interviewer } = require('../../models/employerDetails.model');

const { AgriCandidate, AgriEventSlot, agriCandReview, IntrestedCandidate, SlotBooking, BookedSlot, Reference, } = require('../../models/agri.Event.model')
const fileupload = require('fs');
const { videoupload } = require('../S3video.service')

const tokenService = require("../token.service")

const create_new_interview = async (req) => {

  let { interviewId, interviewer } = req.body;
  let userId = req.userId;

  let interview = await Myinterview.findById(interviewId);

  if (!interview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Myinterview Not Found');
  }
  console.log(interview, userId)
  if (interview.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  let now_time = new Date().getTime();
  let candidate_interview = await Candidateinterview.findOne({ candidateId: interview.candidateId, interviewId: interview._id, userId: userId, startTime: { $gt: now_time } });
  if (candidate_interview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Already Interview Available');
  }
  let startTime = new Date(moment(req.body.date + ' ' + req.body.time, 'YYYY-MM-DD hh:mm A').toISOString()).getTime();
  let endTime = moment(startTime).add(30, 'minutes');
  let interviewer_1
  let interviewer_2
  if (interviewer != null) {
    if (interviewer.length == 2) {
      interviewer_1 = interviewer[0];
      interviewer_2 = interviewer[1];
    }
    else if (interviewer.length == 1) {
      interviewer_1 = interviewer[0];
    }
  }

  candidate_interview = await Candidateinterview.create({
    ...req.body, ...{
      userId, candidateId: interview.candidateId, interviewId: interview._id, startTime, endTime, interviewer_2, interviewer_1
    }
  });

  return candidate_interview;
}

const update_interview = async (req) => {

  let { candiIN, interviewer } = req.body;
  let userId = req.userId;

  let interview = await Candidateinterview.findById(candiIN);

  if (!interview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Myinterview Not Found');
  }
  if (interview.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }

  let startTime = new Date(moment(req.body.date + ' ' + req.body.time, 'YYYY-MM-DD hh:mm A').toISOString()).getTime();
  let endTime = moment(startTime).add(30, 'minutes');
  let interviewer_1
  let interviewer_2
  if (interviewer != null) {
    if (interviewer.length == 2) {
      interviewer_1 = interviewer[0];
      interviewer_2 = interviewer[1];
    }
    else if (interviewer.length == 1) {
      interviewer_1 = interviewer[0];
      interviewer_2 = null;
    }
  }

  interview = await Candidateinterview.findByIdAndUpdate(
    { _id: interview._id },
    {
      ...req.body, ...{
        startTime, endTime, interviewer_2, interviewer_1
      }
    }, { new: true });

  return interview;
}


const attachment_interview = async (req) => {
  let { interviewId } = req.body;
  let userId = req.userId;

  let interview = await Candidateinterview.findById(interviewId);


  if (!interview) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Myinterview Not Found');
  }
  if (interview.userId != userId) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }

  let up = await videoupload(req.file, 'upload/attachment/', 'mp4');
  if (up) {
    interview.cand_Attachment = up.Location;
    interview.save();
  }
  fileupload.unlink(req.file.path, (err) => {
    if (err) {
      return;
    }
  });
  return interview;
}

const get_interview = async (req) => {
  let { id } = req.query;
  let userId = req.userId;
  let interview = await Candidateinterview.findById(id).select({
    "date": 1,
    time: 1,
    role: 1,
    cand_subject: 1,
    cand_message: 1,
    cand_Attachment_name: 1,
    inter_subject: 1,
    inter_message: 1,
    interviewId: 1,
    interviewer: 1,
    userId: 1,
    _id: 0
  });;

  console.log(interview, userId)
  if (!interview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Myinterview Not Found');
  }
  if (interview.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }


  return interview;

}


const get_interview_details = async (req) => {
  let candidate = await Candidateinterview.findById(req.query.id);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interview Link Not Found');
  }


  let exp = candidate.startTime;
  let endTime = moment(exp).add(60, 'minutes');
  let currentTime = new Date().getTime();
  if (endTime < currentTime) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interview Link Expired');
  }
  candidate = await Candidateinterview.findById(req.query.id).select({
    _id: 1,
    startTime: 1,

  });
  return candidate;
}


const interviewer_login = async (req) => {
  let candidate = await Candidateinterview.findById(req.body.id);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interview Link Not Found');
  }

  let exp = candidate.startTime;
  let endTime = moment(exp).add(60, 'minutes');
  let currentTime = new Date().getTime();
  if (endTime < currentTime) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interview Link Expired');
  }


  let { mobile, name } = req.body;

  let interviewer = await Interviewer.findOne({ mobileNumber: mobile, userId: candidate.userId });

  if (!interviewer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Interviewer Not Found');
  }

  if (candidate.interviewer_1 != interviewer._id && candidate.interviewer_2 != interviewer._id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enter Valid Interviewer Mobile Number');
  }

  let user = {
    _id: interviewer._id,
    name: interviewer.name,
    streamId: candidate._id,
    startTime: exp,
    expTime: endTime
  }
  const tokens = await tokenService.generateAuthTokens_interview(exp, user);

  return tokens;
}


const stream_details = async (req) => {
  let stream = await Candidateinterview.findById(req.streamId).select({
    "_id": 1,
    "status": 1,
    "streamStatus": 1,
    "inter_subject": 1,
    "inter_message": 1,
    "interviewId": 1,
    "startTime": 1,
    "endTime": 1,
    "cand_Attachment": 1,
    candidateId:1
  });


  let candidate = await AgriCandidate.findById(stream.candidateId);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Candidate Not Available');
  }
  return { stream, candidate };

}

module.exports = {
  create_new_interview,
  attachment_interview,
  get_interview,
  update_interview,
  get_interview_details,
  interviewer_login,
  stream_details
};






