const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { Groupchat } = require('../models/liveStreaming/chat.model');

const { EmployerRegistration } = require("../models/employerRegistration.model")

const { StreamAppID, Streamtoken } = require('../models/stream.model');
const { EmployerDetails, EmployerPostjob, EmployerPostDraft, Employercomment, EmployerMailTemplate, EmployerMailNotification, Recruiters, EmployerOTP, Jobpoststream } = require('../models/employerDetails.model');

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
module.exports = {
  save_chat_host,

};
