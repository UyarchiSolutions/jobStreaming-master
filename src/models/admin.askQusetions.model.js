const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const faqeSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  question: {
    type: String,
  },
  heading: {
    type: String,
    //  Enum:['true','false'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  answer: {
    type: String,
  },
},
{
  timestamps: true,
}
);
const Faqe = mongoose.model('faqe', faqeSchema);

const enquirySchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  name: {
    type: String,
  },
  emailId: {
    type: String,
    //  Enum:['true','false'],
  },
  mobileNumber: {
    type: String,
  },
  enquiry: {
    type: String,
  },
  whooseSend:{
    type:String,
  },
  date:{
    type:String,
  },
  eq_id:{
    type:String,
  },
  status:{
    type:String,
    default:'Pending',
  },
  userId:{
    type:String,
  },
  active: {
    type: Boolean,
    default: true,
  },
},
{
  timestamps: true,
}
);
const Enquiry = mongoose.model('enquiry', enquirySchema);

module.exports = {Faqe, Enquiry};