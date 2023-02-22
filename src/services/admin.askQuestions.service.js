const httpStatus = require('http-status');
const { Faqe, Enquiry} = require('../models/admin.askQusetions.model');
const { findByIdAndUpdate } = require('../models/token.model');
const ApiError = require('../utils/ApiError');

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

const get_all_enquiry = async () => {
  const data = await Enquiry.find()
  return data
};


const get_id_enquiry = async (id) => {
  const data = await Enquiry.findById(id)
  return data
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
};
