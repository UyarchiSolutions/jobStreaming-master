
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const { timeStamp } = require('console');



const crudschema = mongoose.Schema({
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
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: Number,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},
    { timestamps: true }
);

const Crud = mongoose.model('crud', crudschema);

module.exports = { Crud };
