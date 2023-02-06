const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const languagesSchema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  code: {
    type: String,
  },
  name:{
    type:String,
  },
  nativeName:{
    type:String,
  },
});

const Languages = mongoose.model('languages', languagesSchema);

module.exports = {Languages};