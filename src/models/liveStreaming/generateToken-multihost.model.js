const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../plugins');
const { roles } = require('../../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');

const tempToken = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  token: {
    type: String,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
  },
  expDate: {
    type: Number,
  },
  created_num: {
    type: Number,
  },
  participents: {
    type: Number,
  },
  chennel: {
    type: String,
  },
  Uid: {
    type: Number,
  },
  type: {
    type: String,
  },
  hostId: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  cloud_recording: {
    type: String,
  },
  uid_cloud: {
    type: String,
  },
  cloud_id: {
    type: String,
  },
  store: {
    type: String,
  }
});

const tempTokenModel = mongoose.model('multihost', tempToken);




const hostRoomschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  time: {
    type: Number,
  },
  roomName: {
    type: String,
  },
  cloudRecording: {
    type: Boolean,
    default: false
  },
  token: {
    type: String,
  },
  user: {
    type: String,
  },
  UId: {
    type: String,
  },
  storedURL: {
    type: String,
  }
});

const hostRooms = mongoose.model('hostrooms', hostRoomschema);
module.exports = { tempTokenModel, hostRooms };
