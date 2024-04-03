const httpStatus = require('http-status');
const Agora = require('agora-access-token');

const { StreamAppID, Streamtoken } = require('../models/stream.model');
const { AgriCandidate, AgriEventSlot, SlotBooking, IntrestedCandidate, agriCandReview, BookedSlot, } = require('../models/agri.Event.model');

const { EmployerDetails, EmployerPostjob, EmployerPostDraft, Employercomment, EmployerMailTemplate, EmployerMailNotification, Recruiters, EmployerOTP, Jobpoststream } = require('../models/employerDetails.model');

const { AgoraAppId } = require("../models/AgoraAppId.model")
const ApiError = require('../utils/ApiError');
const axios = require('axios'); //
const agoraToken = require('./AgoraAppId.service');
const { Groupchat } = require('../models/liveStreaming/chat.model');

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
                post: stream.post,
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

    }
    if (stream.status == 'Pending') {
        stream.tokenGeneration = true;
        stream.status = "On Going";
        stream.goLive = true;
        stream.save();
    }
    console.log(stream)
    req.io.emit(stream.post + '_host_join', { streamId: stream._id, status: stream.status, goLive: stream.goLive });
    await production_supplier_token_cloudrecording(req, streamId, stream.agoraID);

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
    let now_time = new Date().getTime();
    if (stream.endTime < now_time) {
        current_time = true;
        stream.status = 'Completed';
        stream.save();
    }

    return { stream, token, app };
}


const stream_end = async (req) => {
    let userId = req.userId;
    let stream = await Jobpoststream.findById(req.query.id);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
    }

    if (stream.userId != userId) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
    }
    stream.status = 'Completed';
    stream.endTime = moment();
    stream.save();

    req.io.emit(stream._id + "_stream_end", { stream: stream.status })
    return stream;
}

const cloud_start = async (req) => {
    let id = req.query.id
    let token = await Streamtoken.findOne({ chennel: id, type: 'CloudRecording', recoredStart: { $eq: "acquire" } }).sort({ created: -1 });
    if (token) {
        let str = await Jobpoststream.findById(token.streamId);
        let agoraToken = await StreamAppID.findById(str.agoraID);
        const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString(
            'base64'
        )}`;
        let nowDate = moment().format('DDMMYYYY');
        if (token.recoredStart == 'acquire') {
            const resource = token.resourceId;
            const mode = 'mix';
            const start = await axios.post(
                `https://api.agora.io/v1/apps/${agoraToken.appID.replace(/\s/g, '')}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
                {
                    cname: token.chennel,
                    uid: token.Uid.toString(),
                    clientRequest: {
                        token: token.token,
                        recordingConfig: {
                            maxIdleTime: 15,
                            streamTypes: 2,
                            channelType: 1,
                            videoStreamType: 0,
                            transcodingConfig: {
                                height: 640,
                                width: 1080,
                                bitrate: 1000,
                                fps: 15,
                                mixedVideoLayout: 1,
                                backgroundColor: '#FFFFFF',
                            },
                        },
                        recordingFileConfig: {
                            avFileType: ['hls', 'mp4'],
                        },
                        storageConfig: {
                            vendor: 1,
                            region: 14,
                            bucket: 'streamingupload',
                            accessKey: 'AKIA3323XNN7Y2RU77UG',
                            secretKey: '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',
                            fileNamePrefix: [nowDate.toString(), token.store, token.Uid.toString()],
                        },
                    },
                },
                { headers: { Authorization } }
            );
            token.resourceId = start.data.resourceId;
            token.sid = start.data.sid;
            token.recoredStart = 'start';
            token.save();
            setTimeout(async () => {
                await recording_query(req, token._id, agoraToken);
            }, 3000);
            return start.data;
        }
        else {
            return { message: 'Already Started' };
        }
    }
    else {
        return { message: 'Already Started' };
    }
}



const recording_query = async (req, id, agoraToken) => {
    const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString(
        'base64'
    )}`;
    let temtoken = id;
    let token = await Streamtoken.findById(temtoken);
    if (!token) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    const resource = token.resourceId;
    const sid = token.sid;
    const mode = 'mix';
    const query = await axios.get(
        `https://api.agora.io/v1/apps/${agoraToken.appID.replace(/\s/g, '')}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
        { headers: { Authorization } }
    ).then((res) => {
        return res;
    }).catch((err) => {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cloud Recording Query:' + err.message);
    });;

    if (query.data != null) {
        if (query.data.serverResponse != null) {
            if (query.data.serverResponse.fileList != null) {
                if (query.data.serverResponse.fileList.length != 0) {
                    if (Array.isArray(query.data.serverResponse.fileList)) {
                        token.videoLink = query.data.serverResponse.fileList[0].fileName;
                        token.videoLink_array = query.data.serverResponse.fileList;
                        let m3u8 = query.data.serverResponse.fileList[0].fileName;
                        if (m3u8 != null) {
                            let mp4 = m3u8.replace('.m3u8', '_0.mp4')
                            token.videoLink_mp4 = mp4;
                        }
                        token.recoredStart = 'query';
                        token.save();
                    }
                    else {
                        token.videoLink = query.data.serverResponse.fileList.fileName;
                        let m3u8 = query.data.serverResponse.fileList.fileName;
                        if (m3u8 != null) {
                            let mp4 = m3u8.replace('.m3u8', '_0.mp4')
                            token.videoLink_mp4 = mp4;
                        }
                        token.recoredStart = 'query';
                        token.save();
                    }
                }
            }
        }
        return query.data;
    }
    else {
        return { message: "Query failed" };
    }
};



const cloud_stop = async (req) => {
    let token = await Streamtoken.findOne({ chennel: req.body.stream, type: 'CloudRecording', recoredStart: { $eq: "query" } }).sort({ created: -1 });
    if (token) {
        let str = await Jobpoststream.findById(token.streamId);
        let agoraToken = await StreamAppID.findById(str.agoraID);
        const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString(
            'base64'
        )}`;
        if (token.recoredStart == 'query') {
            const resource = token.resourceId;
            const sid = token.sid;
            const mode = 'mix';

            const stop = await axios.post(
                `https://api.agora.io/v1/apps/${agoraToken.appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
                {
                    cname: token.chennel,
                    uid: token.Uid.toString(),
                    clientRequest: {},
                },
                {
                    headers: {
                        Authorization,
                    },
                }
            ).then((res) => {
                return res;
            }).catch((err) => {

                throw new ApiError(httpStatus.NOT_FOUND, 'Cloud Recording Stop:' + err.message);
            });

            token.recoredStart = 'stop';
            if (stop.data.serverResponse.fileList.length == 2) {
                token.videoLink = stop.data.serverResponse.fileList[0].fileName;
                token.videoLink_array = stop.data.serverResponse.fileList;
                let m3u8 = stop.data.serverResponse.fileList[0].fileName;
                token.videoLink_mp4 = m3u8;
            }
            token.save();
            return token;
        }
        else {
            return { message: 'Already Stoped' };
        }
    }
    else {
        return { message: 'Clound not Found' };
    }
}


const get_all_chats = async (req) => {
    let userId = req.userId;
    let steamId = req.query.id;
    let stream = await Jobpoststream.findById(req.query.id);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
    }
    let token = await Streamtoken.findOne({ supplierId: userId, chennel: stream._id });
    let chat = await Groupchat.aggregate([
        { $match: { $and: [{ channel: { $eq: steamId } }] } },
        { $addFields: { you: { $eq: ["$joinuser", token._id] } } },
    ]);

    return { joinUser: token._id, chat };
}





const production_supplier_token_cloudrecording = async (req, id, agroaID) => {
    let streamId = id;
    // let streamId = req.body.streamId;
    let agoraToken = await StreamAppID.findById(agroaID)
    let stream = await Jobpoststream.findById(streamId);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    // console.log(stream);
    value = await Streamtoken.findOne({ chennel: streamId, type: 'CloudRecording', recoredStart: { $in: ["query", 'start',] } });
    if (!value) {
        const uid = await generateUid();
        const role = Agora.RtcRole.SUBSCRIBER;
        const expirationTimestamp = stream.endTime / 1000;
        value = await Streamtoken.create({
            ...req.body,
            ...{
                date: moment().format('YYYY-MM-DD'),
                time: moment().format('HHMMSS'),
                created: moment(),
                Uid: uid,
                chennel: stream._id,
                post: stream.post,
                created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
                expDate: expirationTimestamp * 1000,
                type: 'CloudRecording',
                hostId: req.userId
            },
        });
        const token = await geenerate_rtc_token(stream._id, uid, role, expirationTimestamp, agroaID);
        value.token = token;
        value.store = stream._id.replace(/[^a-zA-Z0-9]/g, '');
        value.save();
        if (value.videoLink == '' || value.videoLink == null) {
            await agora_acquire(req, value._id, agroaID);
        }
    } else {
        // try {
        let token = value;
        const resource = token.resourceId;
        const sid = token.sid;
        // console.log(1234567890123456, resource)
        const mode = 'mix';
        const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString(
            'base64'
        )}`;
        // //console.log(`https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`);
        await axios.get(
            `https://api.agora.io/v1/apps/${agoraToken.appID.replace(/\s/g, '')}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
            { headers: { Authorization } }
        ).then((res) => {

        }).catch(async (error) => {

            await Streamtoken.findByIdAndUpdate({ _id: value._id }, { recoredStart: "stop" }, { new: true });
            const uid = await generateUid();
            const role = Agora.RtcRole.SUBSCRIBER;
            const expirationTimestamp = stream.endTime / 1000;
            value = await Streamtoken.create({
                ...req.body,
                ...{
                    date: moment().format('YYYY-MM-DD'),
                    time: moment().format('HHMMSS'),
                    created: moment(),
                    Uid: uid,
                    chennel: stream._id,
                    post: stream.post,
                    created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
                    expDate: expirationTimestamp * 1000,
                    type: 'CloudRecording',
                },
            });
            const token = await geenerate_rtc_token(stream._id, uid, role, expirationTimestamp, agroaID);
            value.token = token;
            value.store = stream._id.replace(/[^a-zA-Z0-9]/g, '');
            value.save();
            await agora_acquire(req, value._id, agroaID);
        });
    }
    return value;
};



const agora_acquire = async (req, id, agroaID) => {
    let temtoken = id;
    let agoraToken = await StreamAppID.findById(agroaID);

    let token = await Streamtoken.findById(temtoken);
    const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString(
        'base64'
    )}`;
    const acquire = await axios.post(
        `https://api.agora.io/v1/apps/${agoraToken.appID.replace(/\s/g, '')}/cloud_recording/acquire`,
        {
            cname: token.chennel,
            uid: token.Uid.toString(),
            clientRequest: {
                resourceExpiredHour: 24,
                scene: 0,
            },
        },
        { headers: { Authorization } }
    );
    token.resourceId = acquire.data.resourceId;
    token.recoredStart = 'acquire';
    token.save();
};



const get_candidate_jobpost = async (req) => {

    let userId = req.userId;

    let current_live = await current_live_post(req);
    let upcomming_live = await upcomming_live_post(req);
    let completed_live = await completed_live_post(req);
    let normal = await without_stream(req);
    let shorts = await shorts_list(req);




    return {
        current: current_live,
        upcomming: upcomming_live,
        completed: completed_live,
        normal,
        shorts

    }
}


const current_live_post = async (req) => {
    let userId = req.userId;
    let currentTime = new Date().getTime();
    let post = await EmployerDetails.aggregate([
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        {
            $lookup: {
                from: 'employerregistrations',
                localField: 'userId',
                foreignField: '_id',
                as: 'employerregistrations',
            },
        },
        { $unwind: "$employerregistrations" },

        {
            $lookup: {
                from: 'jobpostapplies',
                localField: '_id',
                foreignField: 'jobpostId',
                pipeline: [
                    { $match: { $and: [{ candidateID: { $eq: userId } }] } }
                ],
                as: 'jobpostapplies',
            },
        },
        {
            $unwind: {
                path: '$jobpostapplies',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                startTime: "$jobpoststreams.startTime",
                endTime: "$jobpoststreams.endTime",
                actualEnd: "$jobpoststreams.actualEnd",
                streamstatus: "$jobpoststreams.status",
                cmp_companyType: "$employerregistrations.status",
                cmp_companyWebsite: "$employerregistrations.companyWebsite",
                cmp_name: "$employerregistrations.name",
                cmp_companyAddress: "$employerregistrations.companyAddress",
                cmp_logo: "$employerregistrations.status",
                applied: { $ifNull: ["$jobpostapplies.active", false] },
            }
        },
        { $unset: "jobpoststreams" },
        { $unset: "employerregistrations" },
        { $unset: "jobpostapplies" },

        { $limit: 10 },
    ])

    let next = await EmployerDetails.aggregate([
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        { $skip: 10 },
        { $limit: 10 },
    ])

    return {
        post, next: next.length != 0
    }
}




const upcomming_live_post = async (req) => {
    let userId = req.userId;
    let currentTime = new Date().getTime();
    let post = await EmployerDetails.aggregate([
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $sort: { startTime: 1 } },
                    { $match: { $and: [{ startTime: { $gt: currentTime } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        {
            $lookup: {
                from: 'employerregistrations',
                localField: 'userId',
                foreignField: '_id',
                as: 'employerregistrations',
            },
        },
        { $unwind: "$employerregistrations" },
        {
            $lookup: {
                from: 'jobpostapplies',
                localField: '_id',
                foreignField: 'jobpostId',
                pipeline: [
                    { $match: { $and: [{ candidateID: { $eq: userId } }] } }
                ],
                as: 'jobpostapplies',
            },
        },
        {
            $unwind: {
                path: '$jobpostapplies',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                startTime: "$jobpoststreams.startTime",
                endTime: "$jobpoststreams.endTime",
                actualEnd: "$jobpoststreams.actualEnd",
                streamstatus: "$jobpoststreams.status",
                cmp_companyType: "$employerregistrations.status",
                cmp_companyWebsite: "$employerregistrations.companyWebsite",
                cmp_name: "$employerregistrations.name",
                cmp_companyAddress: "$employerregistrations.companyAddress",
                cmp_logo: "$employerregistrations.status",
                applied: { $ifNull: ["$jobpostapplies.active", false] },
            }
        },
        { $unset: "jobpoststreams" },
        { $unset: "employerregistrations" },
        { $unset: "jobpostapplies" },

        { $limit: 10 },
    ])

    let next = await EmployerDetails.aggregate([
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        { $skip: 10 },
        { $limit: 10 },
    ])

    return {
        post, next: next.length != 0
    }
}

const completed_live_post = async (req) => {
    let userId = req.userId;
    let currentTime = new Date().getTime();
    let post = await EmployerDetails.aggregate([
        { $sort: { createdAt: -1 } },
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ active: { $eq: true } }, { show_video: { $eq: true } }] } },
                    { $match: { $or: [{ $and: [{ endTime: { $lt: currentTime } }, { goLive: { $eq: true } }] }, { status: { $eq: "Completed" } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        {
            $lookup: {
                from: 'employerregistrations',
                localField: 'userId',
                foreignField: '_id',
                as: 'employerregistrations',
            },
        },
        { $unwind: "$employerregistrations" },

        {
            $lookup: {
                from: 'jobpostapplies',
                localField: '_id',
                foreignField: 'jobpostId',
                pipeline: [
                    { $match: { $and: [{ candidateID: { $eq: userId } }] } }
                ],
                as: 'jobpostapplies',
            },
        },
        {
            $unwind: {
                path: '$jobpostapplies',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                startTime: "$jobpoststreams.startTime",
                endTime: "$jobpoststreams.endTime",
                actualEnd: "$jobpoststreams.actualEnd",
                streamstatus: "$jobpoststreams.status",
                cmp_companyType: "$employerregistrations.status",
                cmp_companyWebsite: "$employerregistrations.companyWebsite",
                cmp_name: "$employerregistrations.name",
                cmp_companyAddress: "$employerregistrations.companyAddress",
                cmp_logo: "$employerregistrations.status",
                applied: { $ifNull: ["$jobpostapplies.active", false] },
            }
        },
        // { $unset: "jobpoststreams" },
        { $unset: "employerregistrations" },
        { $unset: "jobpostapplies" },

        { $limit: 10 },
    ])

    let next = await EmployerDetails.aggregate([
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ active: { $eq: true } }, { show_video: { $eq: true } }] } },
                    { $match: { $or: [{ $and: [{ endTime: { $lt: currentTime } }, { goLive: { $eq: true } }] }, { status: { $eq: "Completed" } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        { $skip: 10 },
        { $limit: 10 },
    ])

    return {
        post, next: next.length != 0
    }
}



const without_stream = async (req) => {
    let userId = req.userId;

    let currentTime = new Date().getTime();
    let post = await EmployerDetails.aggregate([
        { $sort: { createdAt: -1 } },
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ active: { $eq: true } }] } },
                    {
                        $match: {
                            $or: [
                                { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] },
                                { $and: [{ startTime: { $gt: currentTime } }] },
                                { $or: [{ $and: [{ endTime: { $lt: currentTime } }, { goLive: { $eq: true } }] }, { status: { $eq: "Completed" } }] }
                            ]
                        }
                    },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        {
            $unwind: {
                path: '$jobpoststreams',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: 'employerregistrations',
                localField: 'userId',
                foreignField: '_id',
                as: 'employerregistrations',
            },
        },
        { $unwind: "$employerregistrations" },

        {
            $lookup: {
                from: 'jobpostapplies',
                localField: '_id',
                foreignField: 'jobpostId',
                pipeline: [
                    { $match: { $and: [{ candidateID: { $eq: userId } }] } }
                ],
                as: 'jobpostapplies',
            },
        },
        {
            $unwind: {
                path: '$jobpostapplies',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                stream_available: { $ifNull: ["$jobpoststreams.active", false] },
                cmp_companyType: "$employerregistrations.status",
                cmp_companyWebsite: "$employerregistrations.companyWebsite",
                cmp_name: "$employerregistrations.name",
                cmp_companyAddress: "$employerregistrations.companyAddress",
                cmp_logo: "$employerregistrations.status",
                applied: { $ifNull: ["$jobpostapplies.active", false] },
            }
        },
        { $unset: "jobpoststreams" },
        { $unset: "jobpostapplies" },
        { $match: { $and: [{ stream_available: { $eq: false } }] } },
        { $unset: "employerregistrations" },
        { $limit: 30 },
    ])

    let next = await EmployerDetails.aggregate([
        { $match: { $and: [{ expireAt: { $gt: currentTime } }, { active: { $eq: true } }, { status: { $eq: "Published" } }] } },
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ active: { $eq: true } }] } },
                    {
                        $match: {
                            $or: [
                                { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] },
                                { $and: [{ startTime: { $gt: currentTime } }] },
                                { $or: [{ $and: [{ endTime: { $lt: currentTime } }, { goLive: { $eq: true } }] }, { status: { $eq: "Completed" } }] }
                            ]
                        }
                    },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        {
            $unwind: {
                path: '$jobpoststreams',
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $lookup: {
                from: 'employerregistrations',
                localField: 'userId',
                foreignField: '_id',
                as: 'employerregistrations',
            },
        },
        { $unwind: "$employerregistrations" },

        {
            $addFields: {
                stream_available: { $ifNull: ["$jobpoststreams.active", false] },
                cmp_companyType: "$employerregistrations.status",
                cmp_companyWebsite: "$employerregistrations.companyWebsite",
                cmp_name: "$employerregistrations.name",
                cmp_companyAddress: "$employerregistrations.companyAddress",
                cmp_logo: "$employerregistrations.status",
            }
        },
        { $match: { $and: [{ stream_available: { $eq: false } }] } },
        { $unset: "employerregistrations" },
        { $skip: 10 },
        { $limit: 10 },
    ])




    return {
        post, next: next.length != 0
    }
}




const shorts_list = async (req) => {
    let userId = req.userId;

    let currentTime = new Date().getTime();
    let post = await Jobpoststream.aggregate([
        { $match: { $and: [{ shorts_upload: { $eq: true } }] } },
        { $sort: { createdAt: -1 } },
        { $limit: 30 },
    ])

    let next = await Jobpoststream.aggregate([
        { $match: { $and: [{ shorts_upload: { $eq: true } }] } },
        { $skip: 10 },
        { $limit: 10 },
    ])

    return {
        post, next: next.length != 0
    }
}



const get_candidate_jobpost_current_live = async (req) => {

    let currentTime = new Date().getTime();
    let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
    let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

    let post = await EmployerDetails.aggregate([
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        {
            $addFields: {
                startTime: "$jobpoststreams.startTime",
                endTime: "$jobpoststreams.endTime",
                actualEnd: "$jobpoststreams.actualEnd",
                streamstatus: "$jobpoststreams.status",
            }
        },
        { $unset: "jobpoststreams" },
        { $skip: range * page },
        { $limit: range },
    ])

    let next = await EmployerDetails.aggregate([
        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [{ startTime: { $lt: currentTime } }, { endTime: { $gt: currentTime } }] } },
                    { $limit: 1 }
                ],
                as: 'jobpoststreams',
            },
        },
        { $unwind: "$jobpoststreams" },
        { $skip: range * (page + 1) },
        { $limit: range },
    ])


    return { post, next: next.length != 0 }
}

const get_post_details = async (req) => {

    let userId = req.userId;
    let now_time = new Date().getTime();
    let id = req.query.id;
    let stream = await EmployerDetails.aggregate([
        { $match: { $and: [{ _id: { $eq: id } }] } },
        {
            $lookup: {
                from: 'employerregistrations',
                localField: 'userId',
                foreignField: '_id',
                as: 'employerregistrations',
            },
        },
        { $unwind: "$employerregistrations" },
        {
            $lookup: {
                from: 'jobpostapplies',
                localField: '_id',
                foreignField: 'jobpostId',
                pipeline: [
                    { $match: { candidateID: { $eq: userId } } }
                ],
                as: 'jobpostapplies',
            },
        },
        {
            $unwind: {
                path: '$jobpostapplies',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                cmp_choosefile: "$employerregistrations.choosefile",
                cmp_companyAddress: "$employerregistrations.companyAddress",
                cmp_companyDescription: "$employerregistrations.companyDescription",
                cmp_companyType: "$employerregistrations.companyType",
                cmp_companyWebsite: "$employerregistrations.companyWebsite",
                cmp_contactName: "$employerregistrations.contactName",
                cmp_industryType: "$employerregistrations.industryType",
                cmp_location: "$employerregistrations.location",
                cmp_logo: "$employerregistrations.logo",
                cmp_name: "$employerregistrations.name",
                cmp_postedBy: "$employerregistrations.postedBy",
                cmp_registrationType: "$employerregistrations.choosefile",
                apply: { $ifNull: ["$jobpostapplies.active", false] }
            }
        },
        { $unset: "employerregistrations" },
        { $unset: "jobpostapplies" },

        {
            $lookup: {
                from: 'jobpoststreams',
                localField: '_id',
                foreignField: 'post',
                pipeline: [
                    { $match: { $and: [ { status: { $ne: "Time Out" } }] } },
                    {
                        $addFields: {
                            // stream_status: "$employerregistrations.choosefile",
                            stream_status: {
                                $cond: {
                                    if: { $lt: ["$endTime", now_time] },
                                    then: {
                                        $cond: {
                                            if: { $in: ["$status", ['Completed', 'On Going']] },
                                            then: "Completed",
                                            else: false
                                        }
                                    },
                                    else: {
                                        $cond: {
                                            if: { $and: [{ $lt: ["$startTime", now_time] }, { $gt: ["$endTime", now_time] }] },
                                            then: "On Going",
                                            else: {
                                                $cond: {
                                                    if: { $gt: ["$startTime", now_time] },
                                                    then: "Upcoming",
                                                    else: false,
                                                },
                                            },
                                        },
                                    }
                                }
                            }
                        }
                    },
                    { $match: { $and: [{ stream_status: { $ne: false } }] } }
                ],
                as: 'jobpoststreams',
            },
        },
    ])

    if (stream.length == 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }

    return stream[0];
}





const candidate_go_live = async (req) => {

    let candidateId = req.userId;
    let streamId = req.body.streamId;
    let stream = await Jobpoststream.findById(streamId);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    let value = await Streamtoken.findOne({ candidateId: candidateId, chennel: streamId });
    if (!value) {
        const uid = await generateUid();
        const role = req.body.isPublisher ? Agora.RtcRole.SUBSCRIBER : Agora.RtcRole.PUBLISHER;
        const expirationTimestamp = stream.endTime / 1000;
        value = await Streamtoken.create({
            ...req.body,
            ...{
                date: moment().format('YYYY-MM-DD'),
                time: moment().format('HHMMSS'),
                candidateId: candidateId,
                streamId: streamId,
                post: stream.post,
                created: moment(),
                Uid: uid,
                created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
                expDate: expirationTimestamp * 1000,
                Duration: 30,
                type: 'Candidate',
            },
        });
        const token = await geenerate_rtc_token(streamId, uid, role, expirationTimestamp, stream.agoraID);
        value.token = token;
        value.chennel = streamId;
        value.save();
    }
    return value;
};




const get_stream_token_candidateAuth = async (req) => {
    let userId = req.userId;
    let update = await Streamtoken.findById(req.query.id);

    if (!update) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Join Token Missing');
    }

    let stream = await Jobpoststream.findById(update.streamId);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
    }
    let token = await Streamtoken.findOne({ candidateId: userId, chennel: stream._id });
    let app = await StreamAppID.findById(stream.agoraID);
    let current_time = false;
    let now_time = new Date().getTime();
    if (stream.endTime < now_time) {
        current_time = true;
        stream.status = 'Completed';
        stream.save();
    }

    return { stream, token, app, expried: current_time };
}



const candidateAuth_get_all_chats = async (req) => {
    let userId = req.userId;
    let steamId = req.query.id;
    let update = await Streamtoken.findById(steamId);

    if (!update) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Join Token Missing');
    }
    let stream = await Jobpoststream.findById(update.streamId);
    if (!stream) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
    }
    let chat = await Groupchat.aggregate([
        { $match: { $and: [{ channel: { $eq: update.streamId } }] } },
        { $addFields: { you: { $eq: ["$joinuser", update._id] } } },
    ]);

    return { joinUser: update._id, chat, channel: stream._id };
}


const get_preevalution = async (req) => {

    let userId = req.userId;

    let slots = await SlotBooking.aggregate([
        { $match: { $and: [{ candId: userId }] } }
    ])

    return slots;

}

const get_completed_video = async (req) => {

    let stream = req.query.id;
    let slots = await Jobpoststream.aggregate([
        { $match: { $and: [{ _id: { $eq: stream } }, { status: { $eq: "Completed" } }] } },
    ])

    if (slots.length == 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
    }
    return slots[0];

}



const get_shorts_all = async (req) => {
    let { page, short } = req.body;
    page = page == '' || page == null || page == null ? 0 : parseInt(page);
    let now_time = new Date().getTime();
    // let stream = req.query.id;
    console.log(short, 878797)
    let shorts = await Jobpoststream.aggregate([
        { $match: { $and: [{ shorts_upload: { $eq: true } }] } },
        {
            $addFields: {
                sort_by_id: {
                    $cond: { if: { $eq: ['$_id', short] }, then: 1, else: 0 },
                },
            },
        },
        { $sort: { sort_by_id: -1 } },
        {
            $lookup: {
                from: 'employerdetails',
                localField: 'post',
                foreignField: '_id',
                as: 'employerdetails',
            },
        },
        { $unwind: "$employerdetails" },
        {
            $addFields: {
                status: {
                    $cond: {
                        if: { $lt: ["$endTime", now_time] },
                        then: {
                            $cond: {
                                if: { $in: ["$status", ['Completed', 'On Going']] },
                                then: "Completed",
                                else: "Time Out"
                            }
                        },
                        else: "$status"
                    }
                }
            }
        },
        {
            $project: {
                endTime: 1,
                startTime: 1,
                actualEnd: 1,
                _id: 1,
                createdAt: 1,
                datetime: 1,
                status: 1,
                active: 1,
                adminActive: "$employerdetails.adminActive",
                adminStatus: "$employerdetails.adminStatus",
                apply_method: "$employerdetails.apply_method",
                candidateDescription: "$employerdetails.candidateDescription",
                department: "$employerdetails.department",
                education: "$employerdetails.education",
                education_array: "$employerdetails.education_array",
                education_match: "$employerdetails.education_match",
                education_object: "$employerdetails.education_object",
                employmentType: "$employerdetails.employmentType",
                experienceFrom: "$employerdetails.experienceFrom",
                experienceTo: "$employerdetails.experienceTo",
                industry: "$employerdetails.industry",
                interviewType: "$employerdetails.interviewType",
                jobDescription: "$employerdetails.jobDescription",
                jobLocation: "$employerdetails.jobLocation",
                jobTittle: "$employerdetails.jobTittle",
                keySkill: "$employerdetails.keySkill",
                location: "$employerdetails.location",
                openings: "$employerdetails.openings",
                preferedIndustry: "$employerdetails.preferedIndustry",
                qualification: "$employerdetails.qualification",
                recruiterEmail: "$employerdetails.recruiterEmail",
                recruiterList: "$employerdetails.recruiterList",
                recruiterName: "$employerdetails.recruiterName",
                recruiterNumber: "$employerdetails.recruiterNumber",
                roleCategory: "$employerdetails.roleCategory",
                salaryDescription: "$employerdetails.salaryDescription",
                salaryRangeFrom: "$employerdetails.salaryRangeFrom",
                salaryRangeTo: "$employerdetails.salaryRangeTo",
                urltoApply: "$employerdetails.urltoApply",
                workplaceType: "$employerdetails.workplaceType",
                post: 1,
                totalApply: "$employerdetails.appliedCount",
                appliedCount: 1,
                stream_video_URL: 1,
                selected_video: 1,
                show_video: 1,
                shorts_URL: 1,
                sort_by_id: 1

            }
        },
        { $skip: 5 * page },
        { $limit: 5 },
    ]);

    let next = await Jobpoststream.aggregate([
        { $match: { $and: [{ shorts_upload: { $eq: true } }] } },
        {
            $addFields: {
                sort_by_id: {
                    $cond: { if: { $eq: ['$_id', short] }, then: 1, else: 0 },
                },
            },
        },
        { $sort: { startTime: -1 } },
        { $skip: 5 * (page + 1) },
        { $limit: 5 },
    ]);


    return { shorts, next: next.length != 0 }

}


module.exports = {
    emp_go_live,
    get_stream_token,
    get_all_chats,
    cloud_start,
    cloud_stop,
    stream_end,
    get_candidate_jobpost,
    get_post_details,
    candidate_go_live,
    get_stream_token_candidateAuth,
    candidateAuth_get_all_chats,
    get_preevalution,
    get_candidate_jobpost_current_live,
    get_completed_video,
    get_shorts_all
};
