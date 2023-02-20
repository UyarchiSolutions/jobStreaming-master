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

module.exports = {
    createFaqe,
    getAllFaqe,
};