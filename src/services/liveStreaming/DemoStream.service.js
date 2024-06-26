const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const { AgoraAppId } = require('../../models/AgoraAppId.model');
const axios = require('axios');

const {
  DemoPost,
  DemoUser,
  Demobuyer,
  DemostreamToken,
  DemoInstested,
  Demootpverify,
  Democloudrecord,
  MutibleDemo
} = require('../../models/liveStreaming/demo.realestate.model');

const { AgriCandidate,
  AgriEventSlot,
  agriCandReview,
  IntrestedCandidate,
  SlotBooking, Reference } = require("../../models/agri.Event.model")
const jwt = require('jsonwebtoken');
const agoraToken = require('../AgoraAppId.service');
const { videoupload } = require('../S3video.service')
const Agora = require('agora-access-token');
const fileupload = require('fs');

const getDatas = async () => {
  let stream = await DemostreamToken.aggregate([
    {
      $match: { channel: '30fa154efe' },
    },
    {
      $lookup: {
        from: 'demobuyers',
        localField: 'userID',
        foreignField: '_id',
        pipeline: [
          {
            $addFields: {
              id: {
                $convert: {
                  input: '$phoneNumber',
                  to: 'string',
                  onError: 0,
                },
              },
            },
          },
          {
            $lookup: {
              from: 'climbeventregisters',
              localField: 'id',
              foreignField: 'mobileNumber',
              as: 'asas',
            },
          },
        ],
        as: 'demoBuyers',
      },
    },
    {
      $unwind: {
        path: '$demoBuyers',
      },
    },
  ]);
  return stream;
};

const send_otp = async (req) => {
  console.log(req.query.id)
  let stream = await DemoPost.findById(req.query.id);
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }
  let res = await send_otp_now(stream);
  return res;
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




const select_data_time = async (req) => {
  let { date, id, verify, } = req.body;
  const token = await DemoPost.findById(id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }
  if (token.otp_verifiyed != verify) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  // if (token.status == 'Completed' || token.status == 'OnGoing') {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Time Already Selected');
  // }

  let history = await MutibleDemo.updateMany({ streamId: token._id, status: { $in: ['Pending', 'OnGoing'] } }, { status: "Completed", end: new Date().getTime() });


  let start = new Date(date).getTime();
  let end = new Date(moment(date).add(30, 'minutes')).getTime();

  history = await MutibleDemo.create({
    streamId: token._id,
    start: start,
    end: end,
    actualEnd: end
  })
  token.runningStream = history._id;
  token.status = 'Scheduled';
  token.save();

  return history;
}

const add_one_more_time = async (req) => {
  let { post } = req.body;
  const token = await DemoPost.findById(post);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }
  let his = await MutibleDemo.findById(token.runningStream);

  if (his) {
    if (his.status != 'Completed') {
      his.status = 'Restream';
    }
    his.save();
  }
  token.status = 'Pending';
  token.save();
  return token;
};

const end_stream = async (req) => {
  let userId = req.userId;
  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }
  token.streamStatus = "Completed";
  token.rating = "Rating Incomplete";
  token.save();
  req.io.emit(token._id + '_stream_end', { value: true });


  let cand = await AgriCandidate.findById(token.candId);
  const slots = await SlotBooking.find({ candId: cand._id, streamStatus: "Completed", }).count();

  if (slots == 2) {
    cand.status = "Completed";
    cand.save();
  }
  return token;
};



const seller_go_live = async (req) => {
  let { post } = req.body;
  const token = await SlotBooking.findById(post);
  const uid = await generateUid();
  const role = Agora.RtcRole.PUBLISHER;
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Channel Token');
  }

  if (token.agoraAppId == null) {
    let agoraID = await agoraToken.token_assign(1500, token._id, 'demo');
    if (agoraID) {
      token.agoraAppId = agoraID.element._id;
      token.save();
    }
  }
  let exp = moment(token.DateTime).add(30, 'minutes');

  let demotoken = await DemostreamToken.findOne({ type: 'HOST', channel: token._id, userID: req.userId });
  if (!demotoken) {
    let expirationTimestamp = moment(exp) / 1000;
    const agrotoken = await geenerate_rtc_token(token._id, uid, role, expirationTimestamp, token.agoraAppId);
    demotoken = await DemostreamToken.create({
      expirationTimestamp: expirationTimestamp * 1000,
      streamID: token._id,
      type: 'HOST',
      uid: uid,
      agoraID: token.agoraAppId,
      token: agrotoken,
      channel: token._id,
      dateISO: moment(),
      userID: req.userId,
    });

  }

  if (token.streamStatus == 'Pending') {
    token.streamStatus = 'On-Going';
    token.mainhost = demotoken._id;
    token.save();
    demotoken.mainhost = true;
    demotoken.save();
  }
  req.io.emit(token._id + 'stream_on_going', token);
  req.io.emit('interview_join', token);
  await cloude_recording_stream(token._id, token.agoraAppId, exp);
  let find_intest = await IntrestedCandidate.findOne({ candId: token.candId, volunteerId: req.userId, });
  if (find_intest) {
    find_intest.rating = 'Rating Pending';
    find_intest.streamStatus = 'Joined';
    find_intest.save();
  }
  return token;


};
const seller_go_live_details = async (req) => {
  let { id } = req.query;
  const token = await DemoPost.findById(id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }
  let his = await MutibleDemo.findById(token.runningStream);
  if (!his) {
    throw new ApiError(httpStatus.NOT_FOUND, 'History not found');
  }

  const streampost = await DemoPost.aggregate([
    { $match: { $and: [{ _id: { $eq: token._id } }] } },
    {
      $lookup: {
        from: 'demousers',
        localField: 'userId',
        foreignField: '_id',
        as: 'demousers',
      },
    },
    {
      $unwind: '$demousers',
    },
    {
      $lookup: {
        from: 'demostreamhis',
        localField: 'runningStream',
        pipeline: [
          {
            $lookup: {
              from: 'demostreamtokens',
              localField: '_id',
              foreignField: 'channel',
              pipeline: [
                { $match: { $and: [{ type: { $eq: "HOST" } }] } }
              ],
              as: 'demostreamtokens',
            },
          },
          {
            $unwind: '$demostreamtokens',
          },
          {
            $lookup: {
              from: 'agoraappids',
              localField: 'agoraAppId',
              foreignField: '_id',
              as: 'agoraappids',
            },
          },
          {
            $unwind: '$agoraappids',
          },
        ],
        foreignField: '_id',
        as: 'demostreamhis',
      },
    },
    {
      $unwind: '$demostreamhis',
    },
    {
      $lookup: {
        from: 'demointresteds',
        localField: 'runningStream',
        foreignField: 'streamID',
        pipeline: [
          { $match: { $and: [{ intrested: { $eq: true } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'demointresteds',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$demointresteds',
      },
    },
    {
      $addFields: {
        intrested: { $ifNull: ['$demointresteds.count', 0] },
      },
    },

    {
      $project: {
        _id: 1,
        "imageArr": 1,
        "status": 1,
        "newsPaper": 1,
        "Edition": 1,
        "dateOfAd": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "image": 1,
        "Description": 1,
        "bhkBuilding": 1,
        "category": 1,
        "furnitionStatus": 1,
        "location": 1,
        "postType": 1,
        "priceExp": 1,
        "propertyType": 1,
        linkstatus: 1,
        tenantType: 1,
        ageOfProperty: 1,
        otp_verifiyed: 1,
        finish: 1,
        streamDate: 1,
        userName: "$demousers.userName",
        mobileNumber: "$demousers.mobileNumber",
        locationss: "$demousers.location",
        mail: "$demousers.mail",
        start: "$demostreamhis.start",
        end: "$demostreamhis.end",
        actualEnd: "$demostreamhis.actualEnd",
        streamStatus: "$demostreamhis.status",
        agoraAppId: "$demostreamhis.agoraAppId",
        agora: "$demostreamhis.agoraappids",
        stream: "$demostreamhis.demostreamtokens",
        streamID: "$demostreamhis._id",
        intrested: 1
      }
    }
  ])


  if (streampost.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  return streampost[0];

};
const start_cloud = async (req) => {
  let start = await recording_start(req.query.post);
  return start;
};


const geenerate_rtc_token = async (chennel, uid, role, expirationTimestamp, agoraID) => {
  let agoraToken = await AgoraAppId.findById(agoraID);
  return Agora.RtcTokenBuilder.buildTokenWithUid(
    agoraToken.appID.replace(/\s/g, ''),
    agoraToken.appCertificate.replace(/\s/g, ''),
    chennel,
    uid,
    role,
    expirationTimestamp
  );
};
const generateUid = async () => {
  const length = 5;
  const randomNo = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  return randomNo;
};






const cloude_recording_stream = async (stream, app, endTime) => {

  const stremRequiest = await SlotBooking.findById(stream);
  let agoraToken = await AgoraAppId.findById(app);
  let record = await Democloudrecord.findOne({ streamId: stream, recoredStart: { $eq: 'acquire' } });
  if (!record) {
    record = await Democloudrecord.findOne({ streamId: stream, recoredStart: { $in: ['query', 'start'] } });
    if (record) {
      let token = record;
      const resource = token.resourceId;
      const sid = token.sid;
      const mode = 'mix';
      const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString('base64')}`;
      await axios
        .get(
          `https://api.agora.io/v1/apps/${agoraToken.appID.replace(
            /\s/g,
            ''
          )}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
          { headers: { Authorization } }
        )
        .then((res) => { })
        .catch(async (error) => {
          console.log('error');
          await Democloudrecord.findByIdAndUpdate({ _id: record._id }, { recoredStart: 'stop' }, { new: true });
          const uid = await generateUid();
          const role = Agora.RtcRole.SUBSCRIBER;
          const expirationTimestamp = endTime / 1000;
          const token = await geenerate_rtc_token(stremRequiest._id, uid, role, expirationTimestamp, stremRequiest.agoraAppId);
          record = await Democloudrecord.create({
            date: moment().format('YYYY-MM-DD'),
            time: moment().format('HHMMSS'),
            created: moment(),
            Uid: uid,
            chennel: stremRequiest._id,
            created_num: new Date().getTime(),
            expDate: expirationTimestamp * 1000,
            type: 'CloudRecording',
            token: token,
            store: record._id.replace(/[^a-zA-Z0-9]/g, ''),
            streamId: stremRequiest._id,
          });
          record.save();
          // await agora_acquire(record._id, agoraToken);
        });
    } else {
      await Democloudrecord.updateMany({ chennel: stremRequiest._id }, { recoredStart: 'stop' }, { new: true });
      const uid = await generateUid();
      const role = Agora.RtcRole.SUBSCRIBER;
      const expirationTimestamp = endTime / 1000;
      const token = await geenerate_rtc_token(stremRequiest._id, uid, role, expirationTimestamp, agoraToken._id);
      console.log(stremRequiest)
      record = await Democloudrecord.create({
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HHMMSS'),
        created: moment(),
        Uid: uid,
        chennel: stremRequiest._id,
        created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
        expDate: expirationTimestamp * 1000,
        type: 'CloudRecording',
        token: token,
        streamId: stremRequiest._id,
      });
      console.log(record)


      record.store = record._id.replace(/[^a-zA-Z0-9]/g, '')
      record.save();
      await agora_acquire(record._id, agoraToken);
      await Democloudrecord.findByIdAndUpdate(
        { _id: record._id },
        { store: record._id.replace(/[^a-zA-Z0-9]/g, '') },
        { new: true }
      );
    }
  } else {
    return { start: 'Already acquired' };
  }
};

const agora_acquire = async (id, agroaID) => {
  let temtoken = id;
  let agoraToken = agroaID;
  // let temtoken=req.body.id;
  let token = await Democloudrecord.findById(temtoken);
  const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString('base64')}`;
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

const recording_start = async (id) => {
  const stremRequiest = await SlotBooking.findById(id);
  let token = await Democloudrecord.findOne({ chennel: stremRequiest._id, recoredStart: { $eq: 'acquire' } });
  if (token) {
    let agoraToken = await AgoraAppId.findById(stremRequiest.agoraAppId);
    const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString('base64')}`;
    if (token.recoredStart == 'acquire') {
      console.log('start', agoraToken, token);
      const resource = token.resourceId;
      const mode = 'mix';
      const start = await axios.post(
        `https://api.agora.io/v1/apps/${agoraToken.appID.replace(
          /\s/g,
          ''
        )}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
        {
          cname: token.chennel,
          uid: token.Uid.toString(),
          clientRequest: {
            token: token.token,
            recordingConfig: {
              maxIdleTime: 30,
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
              fileNamePrefix: [token.store, token.Uid.toString()],
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
        await recording_query(token._id, agoraToken);
      }, 3000);
      return start.data;
    } else {
      return { message: 'Already Started' };
    }
  } else {
    return { message: 'Already Started' };
  }
};
const recording_query = async (id, agoraToken) => {
  const Authorization = `Basic ${Buffer.from(agoraToken.Authorization.replace(/\s/g, '')).toString('base64')}`;
  let temtoken = id;
  // let temtoken=req.body.id;
  // //console.log(req.body);
  let token = await Democloudrecord.findById(temtoken);
  const resource = token.resourceId;
  const sid = token.sid;
  const mode = 'mix';
  // //console.log(`https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`);
  const query = await axios.get(
    `https://api.agora.io/v1/apps/${agoraToken.appID.replace(
      /\s/g,
      ''
    )}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
    { headers: { Authorization } }
  );
  // console.log(query.data);
  console.log(query.data.serverResponse.fileList);
  if (query.data.serverResponse != null) {
    if (query.data.serverResponse.fileList != null) {
      if (query.data.serverResponse.fileList.length != 0) {
        if (Array.isArray(query.data.serverResponse.fileList)) {
          token.videoLink = query.data.serverResponse.fileList[0].fileName;
          token.videoLink_obj = query.data.serverResponse.fileList;
          let m3u8 = query.data.serverResponse.fileList[0].fileName;
          if (m3u8 != null) {
            let mp4 = m3u8.replace('.m3u8', '_0.mp4')
            token.videoLink_mp4 = mp4;
          }
          token.recoredStart = 'query';
          token.save();
          console.log(token, 987657)
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

  // if (query.data.serverResponse.fileList.length > 0) {
  //   token.videoLink = query.data.serverResponse.fileList[0].fileName;
  //   token.videoLvideoLink_objink = query.data.serverResponse.fileList;
  //   token.recoredStart = 'query';
  //   token.save();
  // }
  return query.data;
};



const buyer_join_stream = async (req) => {

  const { phoneNumber, name } = req.body;
  const streamId = req.query.id;

  let user = await Demobuyer.findOne({ phoneNumber: phoneNumber });

  if (!user) {
    user = await Demobuyer.create({ phoneNumber: phoneNumber, name: name, dateISO: moment() });
  } else {
    user.name = name;
    user.save();
  }

  const stream = await SlotBooking.findById(streamId);

  stream.linkstatus = 'Verified';

  stream.save();
  let demotoken = await DemostreamToken.findOne({ userID: user._id, streamID: stream._id });
  if (!demotoken) {
    demotoken = await DemostreamToken.create({
      streamID: streamId,
      type: 'BUYER',
      agoraID: stream.agoraID,
      channel: streamId,
      dateISO: moment(),
      userID: user._id,
      demoPost: stream.streamId
    });
  }




  return demotoken;
}

const get_buyer_join_stream = async (req) => {
  const { streamID, verify } = req.body;

  let token = await DemostreamToken.findById(verify);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }
  if (token.streamID != streamID) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }

  let stream = await MutibleDemo.findById(streamID);
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Completed');
  }

  let post = await DemoPost.aggregate([
    { $match: { $and: [{ _id: { $eq: token.demoPost } }] } },
    {
      $lookup: {
        from: 'demousers',
        localField: 'userId',
        foreignField: '_id',
        as: 'demousers',
      },
    },
    {
      $unwind: '$demousers',
    },
    {
      $lookup: {
        from: 'demostreamhis',
        localField: 'runningStream',
        foreignField: '_id',
        as: 'demostreamhis',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$demostreamhis',
      },
    },
    {
      $project: {
        _id: 1,
        "imageArr": 1,
        "status": 1,
        "newsPaper": 1,
        "Edition": 1,
        "dateOfAd": 1,
        "createdAt": 1,
        "updatedAt": 1,
        "image": 1,
        "Description": 1,
        "bhkBuilding": 1,
        "category": 1,
        "furnitionStatus": 1,
        "location": 1,
        "postType": 1,
        "priceExp": 1,
        "propertyType": 1,
        linkstatus: 1,
        tenantType: 1,
        ageOfProperty: 1,
        otp_verifiyed: 1,
        finish: 1,
        streamDate: 1,
        userName: "$demousers.userName",
        mobileNumber: "$demousers.mobileNumber",
        locationss: "$demousers.location",
        mail: "$demousers.mail",
        start: "$demostreamhis.start",
        end: "$demostreamhis.end",
        actualEnd: "$demostreamhis.actualEnd",
        streamStatus: "$demostreamhis.status",
        agoraAppId: "$demostreamhis.agoraAppId",
        streamID: "$demostreamhis._id"
      }
    }
  ])

  if (post.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  return { post: post[0], token };
}


const buyer_go_live_stream = async (req) => {

  let userId = req.userId;
  let streamId = req.body.stream;

  const stream = await SlotBooking.findById(streamId);
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let demotoken = await DemostreamToken.findOne({ userID: userId, streamID: stream._id });
  if (!demotoken) {
    demotoken = await DemostreamToken.create({
      streamID: streamId,
      type: 'BUYER',
      agoraID: stream.agoraID,
      channel: streamId,
      dateISO: moment(),
      userID: userId,
      demoPost: stream.streamId,
      candId: stream.candId,
    });
  }
  if (stream) {
    if (demotoken.token == null && stream.agoraAppId != null) {
      const uid = await generateUid();
      const role = Agora.RtcRole.SUBSCRIBER;
      let expirationTimestamp = stream.endTime / 1000;
      const token = await geenerate_rtc_token(stream._id, uid, role, expirationTimestamp, stream.agoraAppId);
      demotoken.expirationTimestamp = stream.endTime;
      demotoken.uid = uid;
      demotoken.token = token;
      demotoken.save();
    }
    stream.linkstatus = "Verified";
    stream.candidate_join = true;
    stream.save();
    req.io.emit(stream._id + '_cantidate_join', { candidate_join: true });
  }
  return demotoken;
};


const byer_get_stream_details = async (req) => {
  let demotoken = await DemostreamToken.findById(req.query.join);
  if (!demotoken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  const stream = await SlotBooking.findById(demotoken.streamID);
  const agora = await AgoraAppId.findById(stream.agoraAppId);
  const candId = await AgriCandidate.findById(stream.candId);

  return { stream, agora, demotoken, candId };
};



const buyer_interested = async (req) => {
  let demotoken = await DemostreamToken.findById(req.body.id);
  if (!demotoken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }

  let instrest = await DemoInstested.findOne({
    streamID: demotoken.streamID,
    streamHis: demotoken.demoPost,
    userID: demotoken.userID,
    joinedUSER: demotoken._id
  });
  if (!instrest) {
    instrest = await DemoInstested.create({
      streamID: demotoken.streamID,
      streamHis: demotoken.demoPost,
      userID: demotoken.userID,
      joinedUSER: demotoken._id,
      intrested: true,

    });
  }
  else {
    instrest.intrested = !instrest.intrested;
    instrest.save();
  }

  setTimeout(async () => {
    let count = await DemoInstested.find({
      streamID: demotoken.streamID,
      streamHis: demotoken.demoPost,
      intrested: true,
    }).count();

    req.io.emit(demotoken.streamID + '_interest_count', { value: count });


  }, 400)
  return instrest;

}



const get_stream_details_check_golive = async (req) => {
  let userId = req.userId;
  console.log(userId)
  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }

  const streampost = await AgriCandidate.findById(token.candId)
  const agora = await DemostreamToken.findOne({ streamID: token._id, type: 'HOST', userID: userId });
  const agoraID = await AgoraAppId.findById(token.agoraAppId);
  const allowed_count = await DemostreamToken.find({ golive: true, status: 'resgistered', streamID: token._id }).count();
  let exp = moment(token.DateTime).add(30, 'minutes');
  await cloude_recording_stream(token._id, token.agoraAppId, exp);


  return { token, streampost, agora, agoraID, allowed_count };
};




const verifyToken = async (req) => {
  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }
  // console.log(token.streamValitity)
  // try {
  //   const payload = jwt.verify(token.streamValitity, 'demoStream');
  // } catch (err) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Link has Expired');
  // }
  let user = await AgriCandidate.findById(token.candId);
  let mobileNumber = user.mobile;
  return { token, mobileNumber };
};


const verification_sms_send = async (req) => {
  console.log(req.query.id)
  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
  }

  let res = await send_otp_now(token);
  return res;
};




const send_otp_now = async (stream) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  let Datenow = new Date().getTime();
  let otpsend = await Demootpverify.findOne({
    streamID: stream._id,
    otpExpiedTime: { $gte: Datenow },
    verify: false,
    expired: false,
  });
  if (!otpsend) {
    const token = await AgriCandidate.findById(stream.candId);
    await Demootpverify.updateMany(
      { streamID: stream._id, verify: false },
      { $set: { verify: true, expired: true } },
      { new: true }
    );
    let exp = moment().add(3, 'minutes');
    let otp = await Demootpverify.create({
      OTP: OTPCODE,
      verify: false,
      mobile: token.mobile,
      streamID: stream._id,
      DateIso: moment(),
      userID: stream.candId,
      expired: false,
      otpExpiedTime: exp,
    });
    let message = `Dear ${token.userName},thank you for the registration to the event AgriExpoLive2023 .Your OTP for logging into the account is ${OTPCODE}- AgriExpoLive2023(An Ookam company event)`;
    let reva = await axios.get(
      `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${token.mobile}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707168958877302526`
    );
    console.log(reva.data);
    otpsend = { otpExpiedTime: otp.otpExpiedTime };
  } else {
    otpsend = { otpExpiedTime: otpsend.otpExpiedTime };
  }
  return otpsend;
};




const get_stream_details = async (req) => {
  let stream = await SlotBooking.findById(req.query.id);
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }


  stream = await SlotBooking.aggregate([
    { $match: { $and: [{ _id: { $eq: stream._id } }] } },

  ])
  if (stream.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  return stream[0];
};



const get_buyer_token = async (req) => {
  let otp_verify = await DemostreamToken.findById(req.query.id);
  if (!otp_verify) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Join token not found');
  }

  let demotoken = await SlotBooking.findById(otp_verify.streamID);
  if (!demotoken) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SlotBooking  not found');
  }
  const stream = await AgriCandidate.findById(demotoken.candId);
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  const appID = await AgoraAppId.findById(demotoken.agoraAppId);


  return { demotoken, stream, appID, otp_verify };

};


const get_reference = async (req) => {
  let userId = req.userId;
  console.log(userId)
  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }
  let reference = await Reference.findOne({ userId: userId, slotId: token._id });

  return reference;
};

const add_reference = async (req) => {
  let userId = req.userId;
  console.log(userId)
  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }
  let reference = await Reference.findOne({ userId: userId, slotId: token._id });
  if (!reference) {
    reference = await Reference.create(req.body)
    reference.userId = userId;
    reference.slotId = token._id;
    reference.save();
  }
  else {
    reference = await Reference.findByIdAndUpdate({ _id: reference._id }, req.body, { new: true });
  }

  return reference;

};



const completed_videos = async (req) => {

  let userId = req.userId;

  const token = await SlotBooking.findById(req.query.id);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot not found');
  }

  let completed = await Democloudrecord.aggregate([
    { $match: { $and: [{ chennel: { $eq: token._id } }, { videoLink_mp4: { $ne: null } }] } },
  ])

  let candidate = await AgriCandidate.findById(token.candId).select({
    name: 1,
    mail: 1,
    mobile: 1,
    gender: 1,
    location: 1,
    skills: 1,
    dob: 1,
    language: 1,
    Instituitionname: 1,
    affiliateduniversity: 1,
    Education: 1,
    course: 1,
    yearOfPassing: 1,
    hr_Video_upload: 1,
    tech_Video_upload: 1,
  });

  return { completed, token, candidate };
}



const update_candiate = async (token) => {
  let candidate = await AgriCandidate.findById(token.candId);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }
  if (token.teaserUpload && token.trailerUpload && token.editedUpload) {
    if (token.Type == 'HR') {
      candidate.hr_Video_upload = 'Uploaded';
    }
    if (token.Type == 'Tech') {
      candidate.tech_Video_upload = 'Uploaded';
    }
    candidate.save();
  }
  else if (token.teaserUpload || token.trailerUpload || token.editedUpload) {
    if (token.Type == 'HR') {
      candidate.hr_Video_upload = 'Partial Pending';
    }
    if (token.Type == 'Tech') {
      candidate.tech_Video_upload = 'Partial Pending';
    }
    candidate.save();
  }

}


const upload_teaser = async (req) => {
  let userId = req.userId;
  let values = await SlotBooking.findById(req.body.id);
  if (!values) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }

  let up = await videoupload(req.file, 'teaser/upload', 'mp4');

  if (up) {
    values.teaserURL = up.Location;
    values.teaseruploadDate = moment();
    values.teaseruploadBy = userId;
    values.teaserUpload = true;
    values.save();
  }

  fileupload.unlink(req.file.path, (err) => {
    if (err) {
      return;
    }
  });
  await update_candiate(values);
  return values;
}

const upload_trailer = async (req) => {
  let userId = req.userId;
  let values = await SlotBooking.findById(req.body.id);
  if (!values) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }

  let up = await videoupload(req.file, 'teaser/upload', 'mp4');

  if (up) {
    values.trailerURL = up.Location;
    values.traileruploadDate = moment();
    values.traileruploadBy = userId;
    values.trailerUpload = true;
    values.save();
  }

  fileupload.unlink(req.file.path, (err) => {
    if (err) {
      return;
    }
  });
  await update_candiate(values);
  return values;
}
const upload_edited = async (req) => {
  let userId = req.userId;
  let values = await SlotBooking.findById(req.body.id);
  if (!values) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Not Found');
  }

  let up = await videoupload(req.file, 'teaser/upload', 'mp4');

  if (up) {
    values.editedURL = up.Location;
    values.editeduploadDate = moment();
    values.editeduploadBy = userId;
    values.editedUpload = true;
    values.save();
  }

  fileupload.unlink(req.file.path, (err) => {
    if (err) {
      return;
    }
  });
  await update_candiate(values);
  return values;
}

const approve_upload = async (req) => {
  let values = await SlotBooking.findById(req.body.id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Slot Not Found');
  }
  const candId = await AgriCandidate.findById(values.candId).select({
    name: 1,
    mail: 1,
    mobile: 1,
    gender: 1,
    location: 1,
    skills: 1,
    dob: 1,
    language: 1,
    Instituitionname: 1,
    affiliateduniversity: 1,
    Education: 1,
    course: 1,
    yearOfPassing: 1,
    hr_Video_upload: 1,
    tech_Video_upload: 1,
  });
  if (!candId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Candidate Not Found');
  }
  if (values.Type == 'HR') {
    if (candId.hr_Video_upload != 'Uploaded') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Uploaded Pending');
    }
    if (candId.hr_Video_upload == 'Uploaded') {
      candId.hr_Video_upload = 'Approved';
      candId.save();
    }

  }
  if (values.Type == 'Tech') {
    if (candId.tech_Video_upload != 'Uploaded') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Uploaded Pending');
    }
    if (candId.tech_Video_upload == 'Uploaded') {
      candId.tech_Video_upload = 'Approved';
      candId.save();
    }

  }

  if (candId.tech_Video_upload == 'Approved' && candId.hr_Video_upload == 'Approved') {
    await AgriCandidate.findByIdAndUpdate({ _id: candId._id }, { employerSideShow: 'Appreved' }, { new: true })
  }
  else if (candId.tech_Video_upload == 'Approved' || candId.hr_Video_upload == 'Approved') {
    await AgriCandidate.findByIdAndUpdate({ _id: candId._id }, { employerSideShow: 'Partial Pending' }, { new: true })
  }
  return candId;
}

module.exports = {
  getDatas,
  get_stream_details,
  send_otp,
  verify_otp,
  select_data_time,
  add_one_more_time,
  seller_go_live,
  seller_go_live_details,
  start_cloud,
  end_stream,
  buyer_join_stream,
  get_buyer_join_stream,
  buyer_go_live_stream,
  byer_get_stream_details,
  buyer_interested,
  get_stream_details_check_golive,
  recording_start,
  verifyToken,
  verification_sms_send,
  get_buyer_token,
  get_reference,
  add_reference,
  completed_videos,
  upload_teaser,
  upload_trailer,
  upload_edited,
  approve_upload
};
