const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const Agora = require('agora-access-token');
const moment = require('moment');
const { Groupchat } = require('../../models/liveStreaming/chat.model');
const fs = require('fs');

const multer = require('multer');

const chat_room_create = async (req, io) => {
  const storage = multer.memoryStorage({
    destination: function (req, res, callback) {
      callback(null, '');
    },

  });
  const upload = multer({ storage }).single('teaser');


  console.log(req)
  let dateIso = new Date(new Date(moment().format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss'))).getTime();
  let data = await Groupchat.create({ ...req, ...{ created: moment(), dateISO: dateIso } })
  const buffer = Buffer.from(req.text);
  console.log(buffer)
  fs.writeFile(`public/voicerecord/${data._id}.mp3`, buffer, err => {
    if (err) throw err;

    // socket.emit('uploaded');
  });

  io.sockets.emit(req.channel, data);
}

const getoldchats = async (req) => {
  console.log(req)
  let data = await Groupchat.find({ channel: req.query.channel }).sort({ dateISO: 1 });
  return data;
}

module.exports = {
  chat_room_create,
  getoldchats
};
