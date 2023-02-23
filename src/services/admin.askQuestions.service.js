const httpStatus = require('http-status');
const { Faqe, Enquiry} = require('../models/admin.askQusetions.model');
const { findByIdAndUpdate } = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
var ejs = require('ejs');

const createFaqe = async (body) => {
  return Faqe.create(body);
};

const getAllFaqe = async (range, page) => {
  const data = await Faqe.aggregate([{ $skip: parseInt(range) * parseInt(page) }, { $limit: parseInt(range) }]);
  const count = await Faqe.aggregate([
    {
      $match: { active: true },
    },
  ])
  return {data:data, count:count.length};
};

const get_Faqe_id = async (id) => {
  console.log(id)
  const data = Faqe.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data;
};

const get_Faqe_update = async (id, body) => {
  const data = Faqe.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  let value = await Faqe.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

const get_Faqe_delete = async (id) => {
  const data = Faqe.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  await data.remove();
  return data;
};

const exiting_faqe_data = async () => {
  const data = await Faqe.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { heading: '$heading'},
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        heading: '$_id.heading',
        count: 1,
      },
    },
  ]);
  return data;
};

// enquiry create
const create_enquiry_candidate = async (userId, body) => {
  const values = {...body, ...{userId:userId}}
  return Enquiry.create(values);
};

// dummy
const create_enquiry_dummy = async (body) => {

  let currentDate = moment().format('YYYY-MM-DD');
  const Buy = await Enquiry.find({ date: currentDate });
  let center = '';
  if (Buy.length < 9) {
    center = '0000';
  }
  if (Buy.length < 99 && Buy.length >= 9) {
    center = '000';
  }
  if (Buy.length < 999 && Buy.length >= 99) {
    center = '00';
  }
  if (Buy.length < 9999 && Buy.length >= 999) {
    center = '0';
  }
  let iddd = '';
  let totalcount = Buy.length + 1;

  iddd = 'EQ' + center + totalcount;
  let values = {...body, ...{eq_id:iddd, date:currentDate}}
  return Enquiry.create(values);
};

const get_all_enquiry = async () => {
  const data = await Enquiry.find()
  return data
};


const get_id_enquiry = async (id) => {
  const data = await Enquiry.findById(id)
  return data
};

const get_Enquiry_update = async (id, body) => {
  const data = Enquiry.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  let value = await Enquiry.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'mail.uyarchi.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply-tj@uyarchi.com',
    pass: 'Thunivu@100',
  },
});
const reply_enquiry = async (body) => {
  const {enquiryId, subject, answer} = body
  const data = await  Enquiry.findById(enquiryId);
  console.log(data)
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const data1 = await ejs.renderFile(__dirname + '/enquirytemplate.ejs', {
    subject: subject,
    question:data.enquiry,
    answer: answer,
    email:data.emailId
  })

const mainOptions = {
  from: "noreply-tj@uyarchi.com",
  to: data.emailId,
  // to:"vignesh1041996@gmail.com",
  subject: 'templates',
  html: data1,
};

transporter.sendMail(mainOptions, (err, info) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Message sent: ' + info.response);
  }
});
  let value = await Enquiry.findByIdAndUpdate({ _id: enquiryId }, {answer:answer}, { new: true });
  
  return value;
};
module.exports = {
  createFaqe,
  getAllFaqe,
  get_Faqe_id,
  get_Faqe_update,
  get_Faqe_delete,
  exiting_faqe_data,
  create_enquiry_candidate,
  get_all_enquiry,
  get_id_enquiry,
  create_enquiry_dummy,
  get_Enquiry_update,
  reply_enquiry,
};
