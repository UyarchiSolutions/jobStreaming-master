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
    //    Enum:['true','false'],
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

module.exports = {Faqe};