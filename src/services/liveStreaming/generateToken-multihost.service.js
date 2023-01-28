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
  // let value = await tempTokenModel.create({
  //   ...req.body,
  //   ...{
  //     date: moment().format('YYYY-MM-DD'),
  //     time: moment().format('HHMMSS'),
  //     created: moment(),
  //     Uid: uid,
  //     participents: 3,
  //     created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
  //     expDate: expirationTimestamp * 1000,
  //   },
  // });
  const token = await geenerate_rtc_token(chennel, uid, role, expirationTimestamp);
  // value.token = token;
  // value.chennel = chennel;
  // value.store = value._id.replace(/[^a-zA-Z0-9]/g, '');
  // // let cloud_recording = await generateToken_sub_record(chennel, false, req);
  // // value.cloud_recording = cloud_recording.value.token;
  // // value.uid_cloud = cloud_recording.value.Uid;
  // // value.cloud_id = cloud_recording.value._id;
  // value.save();
  return { uid, token ,channel:chennel};
};

const generateToken_sub = async (req) => {
  const expirationTimeInSeconds = 3600;
  const uid = await generateUid();
  const role = req.body.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
  const channel = req.body.channel;
  const moment_curr = moment();
  const currentTimestamp = moment_curr.add(30, 'minutes');
  const expirationTimestamp = new Date(new Date(currentTimestamp.format('YYYY-MM-DD') + ' ' + currentTimestamp.format('HH:mm:ss'))).getTime() / 1000;
  let value = await tempTokenModel.create({
    ...req.body,
    ...{
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HHMMSS'),
      created: moment(),
      Uid: uid,
      chennel: channel,
      participents: 3,
      created_num: new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime(),
      expDate: expirationTimestamp * 1000,
    },
  });
  const token = await geenerate_rtc_token(channel, uid, role, expirationTimestamp);
  value.token = token;
  value.save();
  return { uid, token, value };
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

module.exports = {
  generateToken,
  generateToken_sub,
  createRooms,
  get_allrooms
};
