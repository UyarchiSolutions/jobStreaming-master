const httpStatus = require('http-status');
const { Faqe } = require('../models/admin.askQusetions.model');
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
module.exports = {
  createFaqe,
  getAllFaqe,
  get_Faqe_id,
  get_Faqe_update,
  get_Faqe_delete,
};
