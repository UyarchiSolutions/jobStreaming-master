const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const Agora = require('agora-access-token');
const axios = require('axios');
const { EmployerDetails, Jobpoststream, Applypost, Myinterview, Candidateinterview } = require('../../models/employerDetails.model');

const { AgriCandidate, AgriEventSlot, agriCandReview, IntrestedCandidate, SlotBooking, BookedSlot, Reference, } = require('../../models/agri.Event.model')
const fileupload = require('fs');
const { videoupload } = require('../S3video.service')

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




module.exports = {
  create_new_interview,
  attachment_interview
};






