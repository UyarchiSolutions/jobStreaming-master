const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('../plugins');
const { roles } = require('../../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');


const Groupchat_schema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    dateISO: {
        type: Number,
    },
    created: {
        type: Date,
    },
    userId: {
        type: String,
    },
    channel: {
        type: String,
    },
    text: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
    },
    userName: {
        type: String,
    },
    userType: {
        type: String,
    },
    joinuser: {
        type: String,
    },
    supplierId: {
        type: String,
    },
    removeMessage: {
        type: Boolean,
        default: false,
    }

}, { timeStamp: true });

const Groupchat = mongoose.model('groupchat', Groupchat_schema);


const Ricehands_schema = mongoose.Schema({
    _id: {
        type: String,
        default: v4,
    },
    riceuserId: {
        type: String,
    },
    streamId: {
        type: String,
    },
    tokenId: {
        type: String,
    },
    status: {
        type: String,
    },
    date: {
        type: Number,
    },
    time: {
        type: Number,
    },
    active: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
    }

}, { timeStamp: true });

const Ricehands = mongoose.model('ricehands', Ricehands_schema);
module.exports = { Groupchat, Ricehands };
