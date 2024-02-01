const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { EmployerDetails } = require('../models/employerDetails.model');
const { EmployerRegistration } = require('../models/employerRegistration.model');

const moment = require('moment');
// create job Alert


const get_my_job_post = async (req) => {
  let userId = req.userId;
  console.log(userId)
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);
  let data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [
          { userId: { $eq: userId } }
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: range * page },
    { $limit: range },
  ])

  let next = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [
          { userId: { $eq: userId } }
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: range * (page + 1) },
    { $limit: range },
  ])

  return { data, next: next.length != 0 };
};

const toggle_job_post = async (req) => {
  let userId = req.userId;
  let data = await EmployerDetails.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }

  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  data.active = !data.active;

  data.save();

  return data;

}

const get_post_details = async (req) => {
  let userId = req.userId;
  let data = await EmployerDetails.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }

  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }

  return data;

}
module.exports = {
  get_my_job_post,
  toggle_job_post,
  get_post_details
};
