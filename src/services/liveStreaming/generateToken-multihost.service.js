const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { tempTokenModel, hostRooms } = require('../../models/liveStreaming/generateToken-multihost.model');
const axios = require('axios'); //
const appID = '89d14c182a7047f9a80bb3d4f26c42f4';
const appCertificate = '6f0bf1aadfb34e50b9cac392307157c8';
const Authorization = `Basic ${Buffer.from(`bc709eb08f0a438aaae0e7d9962f5ad3:93ff83ec1ab544bc97b0de84706c428f`).toString(
  'base64'
)}`;
var m3u8ToMp4 = require("m3u8-to-mp4");
var converter = new m3u8ToMp4();

const generateUid = async (req) => {
  const length = 5;
  const randomNo = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
  return randomNo;
};

const geenerate_rtc_token = async (chennel, uid, role, expirationTimestamp) => {
  return Agora.RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, chennel, uid, role, expirationTimestamp);
};

const generateToken = async (req) => {
  const expirationTimeInSeconds = 3600;
  const uid = await generateUid();
  const uid_cloud = await generateUid();
  const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  const chennel = req.body.channel;
  const moment_curr = moment();
  const currentTimestamp = moment_curr.add(30, 'minutes');
  const expirationTimestamp =
    new Date(new Date(currentTimestamp.format('YYYY-MM-DD') + ' ' + currentTimestamp.format('HH:mm:ss'))).getTime() / 1000;
  const token = await geenerate_rtc_token(chennel, uid, role, expirationTimestamp);
  let subtoken = await generateToken_sub(req);
  let room = await hostRooms.findById(chennel);
  if (!room.cloudRecording) {
    room.token = subtoken.token
    room.user = uid
    room.UId = subtoken.uid;
    room.cloudRecording = true;
    room.save();
  }
  return { uid, token, channel: chennel };
};

const generateToken_sub = async (req) => {
  req.body.isPublisher = false
  const expirationTimeInSeconds = 3600;
  const uid = await generateUid();
  const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  const channel = req.body.channel;
  const moment_curr = moment();
  const currentTimestamp = moment_curr.add(30, 'minutes');
  const expirationTimestamp = new Date(new Date(currentTimestamp.format('YYYY-MM-DD') + ' ' + currentTimestamp.format('HH:mm:ss'))).getTime() / 1000;
  const token = await geenerate_rtc_token(channel, uid, role, expirationTimestamp);
  // value.token = token;
  // value.save();
  return { uid, token, channel };
};


const createRooms = async (req) => {
  let value = hostRooms.create({
    ...req.body,
    ...{
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HHMMSS'),
      created: moment(),
    }
  })

  return value;
}

const get_allrooms = async (req) => {
  let value = hostRooms.find();

  return value;
}


const agora_acquire = async (req) => {
  let token = await hostRooms.findById(req.body.id);
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
    {
      cname: token._id,
      uid: token.UId,
      clientRequest: {
        resourceExpiredHour: 24,
        scene: 0,
      },
    },
    { headers: { Authorization } }
  );
  console.log(acquire.data);

  return acquire.data;
};

const recording_start = async (req) => {
  const resource = req.body.resourceId;
  let token = await hostRooms.findById(req.body.id);

  const mode = 'mix';
  const start = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
    {
      cname: token._id,
      uid: token.UId,
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
          avFileType: ['hls'],
        },
        storageConfig: {
          vendor: 1,
          region: 14,
          bucket: 'streamingupload',
          accessKey: 'AKIA3323XNN7Y2RU77UG',
          secretKey: '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',
          fileNamePrefix: ['multihost', token.Uid.toString()],
        },
      },
    },
    { headers: { Authorization } }
  );
  return start.data;
};
const recording_query = async (req) => {
  console.log(req.body);
  const resource = req.body.resourceId;
  const sid = req.body.sid;
  const mode = 'mix';
  console.log(`https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`);
  const query = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
    { headers: { Authorization } }
  );
  let baseURL = 'https://streamingupload.s3.ap-south-1.amazonaws.com/'
  let token = await hostRooms.findByIdAndUpdate({ _id: req.body.id }, { storedURL: baseURL + query.data.serverResponse.fileList });
  return query.data;
};
const recording_stop = async (req) => {
  const resource = req.body.resourceId;
  const sid = req.body.sid;
  const mode = 'mix';
  let token = await hostRooms.findById(req.body.id);
  const stop = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
    {
      cname: token.chennel,
      uid: token.uid_cloud,
      clientRequest: {},
    },
    {
      headers: {
        Authorization,
      },
    }
  );
  return stop.data;
};
const recording_updateLayout = async (req) => {
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/acquire`,
    {
      cname: 'test',
      uid: '16261',
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  );

  return acquire.data;
};


module.exports = {
  generateToken,
  generateToken_sub,
  createRooms,
  get_allrooms,
  agora_acquire,
  recording_start,
  recording_query,
  recording_stop,
  recording_updateLayout,
};
