const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const moment = require('moment');

const EmployerPlanSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userType: {
      type: String,
    },
    planType: {
      type: String,
    },
    planName: {
      type: String,
    },
    planmode: {
      type: String,
    },
    streamvalidity: {
      type: Number,
      default: 30,
    },
    no_of_host: {
      type: Number,
    },
    numberofStream: {
      type: Number,
    },
    Duration: {
      type: Number,
    },
    numberOfParticipants: {
      type: Number,
    },
    validityofplan: {
      type: Number,
    },
    regularPrice: {
      type: Number,
    },
    offer_price: {
      type: Number,
    },
    chat_Option: {
      type: String,
    },
    PostCount: {
      type: Number,
    },
    RaiseHands: {
      type: String,
    },
    raisehandcontrol: {
      type: String,
    },
    completedStream: {
      type: String,
    },
    Duration: {
      type: Number,
    },
    DurationType: {
      type: String,
    },
    transaction: {
      type: String,
    },
    Candidate_Contact_reveal: {
      type: String,
    },
    Pdf: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    Teaser: {
      type: String,
    },
    Special_Notification: {
      type: String,
    },
    Service_Charges: {
      type: Number,
    },
    TimeType: {
      type: String,
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
    status:{
        type: String,
        default: 'Created'
    }
  },
  { timestamps: true }
);

const EmployerPlan = mongoose.model('employerPlan', EmployerPlanSchema);

module.exports = {
  EmployerPlan,
};
