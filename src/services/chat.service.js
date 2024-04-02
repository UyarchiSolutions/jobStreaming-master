const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { Groupchat } = require('../models/liveStreaming/chat.model');

const { EmployerRegistration } = require("../models/employerRegistration.model")
const { AgriCandidate } = require("../models/agri.Event.model")

const { StreamAppID, Streamtoken } = require('../models/stream.model');
const { EmployerDetails, EmployerPostjob, EmployerPostDraft, Employercomment, EmployerMailTemplate, EmployerMailNotification, Recruiters, EmployerOTP, Jobpoststream, Myinterview, Candidateinterview, Interviewer } = require('../models/employerDetails.model');

const save_chat_host = async (req, io) => {
  console.log(req)

  let stream = await Jobpoststream.findById(req.channel);
  console.log(stream)
  if (stream) {
    let user = await EmployerRegistration.findById(stream.userId);
    let streamtoken = await Streamtoken.findOne({ supplierId: stream.userId, chennel: req.channel });
    // console.log(user, streamtoken)
    if (user) {
      let name = user.name
      let token = await Groupchat.create({
        channel: req.channel,
        text: req.text,
        channel: req.channel,
        joinuser: streamtoken._id,
        userType: 'host',
        userName: name,
        dateISO: moment(),
        created: moment()
      });



      io.sockets.emit(req.channel + '_received', token);
    }
  }
}

const interview_chat_host = async (req, io) => {
  console.log(req);

  let streamtoken = await Streamtoken.findById(req.channel);
  if (streamtoken) {
    let user = await Interviewer.findById(streamtoken.supplierId);
    if (user) {
      let name = user.name
      let token = await Groupchat.create({
        channel: streamtoken.chennel,
        text: req.text,
        channel: streamtoken.chennel,
        joinuser: streamtoken._id,
        userType: 'host',
        userName: name,
        dateISO: moment(),
        created: moment()
      });
      io.sockets.emit(streamtoken.chennel + '_received', token);
    }
  }
}

const save_chat_candidate = async (req, io) => {

  let stream = await Streamtoken.findById(req.channel);
  if (stream) {
    let user = await AgriCandidate.findById(stream.candidateId);
    if (user) {
      let name = user.name
      let token = await Groupchat.create({
        channel: stream.chennel,
        text: req.text,
        joinuser: stream._id,
        userType: 'candidate',
        userName: name,
        dateISO: moment(),
        created: moment()
      });
      io.sockets.emit(stream.chennel + '_received', token);
    }
  }
}
module.exports = {
  save_chat_host,
  save_chat_candidate,
  interview_chat_host
};
