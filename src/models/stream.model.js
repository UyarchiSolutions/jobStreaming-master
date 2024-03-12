
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const { timeStamp } = require('console');



const streamAppidschema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    active: {
        type: Boolean,
        default: true,
    },
    archive: {
        type: Boolean,
        default: false,
    },
    streamId: {
        type: String,
    },
    appID: {
        type: String,
    },
    Authorization: {
        type: String,
    },
    cloud_KEY: {
        type: String,
    },
    cloud_secret: {
        type: String,
    },
    appCertificate: {
        type: String,
    },
    duration: {
        type: Number,
        default: 0
    }

},
    { timestamps: true }
);

const StreamAppID = mongoose.model('streamappid', streamAppidschema);




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
        type: Number,
    },
    cloud_id: {
        type: String,
    },
    store: {
        type: String,
    },
    supplierId: {
        type: String,
    },
    streamId: {
        type: String,
    },
    candidateId: {
        type: String,
    },
    Duration: {
        type: Number,
    },
    joinedUser: {
        type: String,
    },
    resourceId: {
        type: String,
    },
    sid: {
        type: String,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    videoLink: {
        type: String,
    },
    videoLink_array: {
        type: Array,
    },
    videoLink_mp4: {
        type: String,
    },
    recoredStart: {
        type: String,
        default: 'Pending',
    },
    video: {
        type: Boolean,
        default: true,
    },
    audio: {
        type: Boolean,
        default: true,
    },
    video: {
        type: Boolean,
        default: true,
    },
    allMedia: {
        type: Boolean,
        default: true,
    },
    mainhostLeave: {
        type: Boolean,
        default: false
    },
    bigSize: {
        type: Boolean,
        default: false
    },
    convertedVideo: {
        type: String,
        default: 'Pending',
    },
    convertStatus: {
        type: String,
        default: 'Pending',
    },
    appID: {
        type: String,
    },
    raise_hands: {
        type: Boolean,
        default: true
    },
    lot: {
        type: String,
    },
    long: {
        type: String,
    },
    last_joined: {
        type: String,
    },
    front_code: {
        type: String,
    },
    post: {
        type: String,
    }
});

const Streamtoken = mongoose.model('streamtoken', tempToken);




const joinedusers = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    active: {
        type: Boolean,
        default: true,
    },
    archive: {
        type: Boolean,
        default: false,
    },
    created: {
        type: Date,
    },
    DateIso: {
        type: Number,
    },
    token: {
        type: String,
    },
    shopId: {
        type: String,
    },
    streamId: {
        type: String,
    },
    hostId: {
        type: String,
    },
    latestedToken: {
        type: String,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    joindedUserBan: {
        type: Boolean,
        default: false
    },
    last_joined: {
        type: String,
    }
});

const Joinusers = mongoose.model('joinedusers', joinedusers);




module.exports = { Streamtoken, StreamAppID, Joinusers };
