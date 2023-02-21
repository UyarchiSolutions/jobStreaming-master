const httpStatus = require('http-status');
const { Faqe } = require('../models/admin.askQusetions.model')
const ApiError = require('../utils/ApiError');

const createFaqe = async (body) => {
  return Faqe.create(body);
};

const getAllFaqe = async () => {
  const data = Faqe.find();
  return data;
};

const get_Faqe_id = async (id) => {
  const data = Faqe.findById(id);
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data;
};

module.exports = {
    createFaqe,
    getAllFaqe,
    get_Faqe_id,
};