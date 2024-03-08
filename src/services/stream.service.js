const httpStatus = require('http-status');
const Agora = require('agora-access-token');

const { StreamAppID, Streamtoken } = require('../models/stream.model');
const {
    EmployerDetails,
    EmployerPostjob,
    EmployerPostDraft,
    Employercomment,
    EmployerMailTemplate,
    EmployerMailNotification,
    Recruiters,
    EmployerOTP, Jobpoststream } = require('../models/employerDetails.model');

const { AgoraAppId } = require("../models/AgoraAppId.model")
const ApiError = require('../utils/ApiError');
const axios = require('axios'); //
const agoraToken = require('./AgoraAppId.service');

const moment = require('moment');

const geenerate_rtc_token = async (chennel, uid, role, expirationTimestamp, agoraID) => {
    let agoraToken = await StreamAppID.findById(agoraID)
    return Agora.RtcTokenBuilder.buildTokenWithUid(agoraToken.appID.replace(/\s/g, ''), agoraToken.appCertificate.replace(/\s/g, ''), chennel, uid, role, expirationTimestamp);
};
const generateUid = async (req) => {
    const length = 5;
    const randomNo = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
    return randomNo;
};

const emp_go_live = async (req) => {

    let empId = req.userId;
    let streamId = req.body.streamId;
    let stream = await Jobpoststream.findById(streamId);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    if (stream.agoraID == null) {
        let agoraID = await agoraToken.get_app_id({ minutes: 30, demain: 'https://seewe.co', streamType: 'jobpost' });
        if (agoraID) {
            stream.agoraID = agoraID._id;
        }
    }

    let value = await Streamtoken.findOne({ supplierId: empId, chennel: streamId });
    if (!value) {
        const uid = await generateUid();
        const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
        const expirationTimestamp = stream.endTime / 1000;
        value = await Streamtoken.create({
            ...req.body,
            ...{
                date: moment().format('YYYY-MM-DD'),
                time: moment().format('HHMMSS'),
                supplierId: empId,
                streamId: streamId,
                created: moment(),
                Uid: uid,
                created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
                expDate: expirationTimestamp * 1000,
                Duration: 30,
                type: 'Employer',
            },
        });
        const token = await geenerate_rtc_token(streamId, uid, role, expirationTimestamp, stream.agoraID);
        value.token = token;
        value.chennel = streamId;
        value.save();
        stream.tokenGeneration = true;
        stream.goLive = true;
        stream.save();
    }

    return value;
};


const get_stream_token = async (req) => {
    let userId = req.userId;
    let stream = await Jobpoststream.findById(req.query.id);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
    }
    let token = await Streamtoken.findOne({ supplierId: userId, chennel: stream._id });
    let app = await StreamAppID.findById(stream.agoraID);

    return { stream, token, app };
}



module.exports = {
    emp_go_live,
    get_stream_token
};
