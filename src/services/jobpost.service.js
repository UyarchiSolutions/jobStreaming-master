const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { EmployerDetails, Jobpoststream } = require('../models/employerDetails.model');
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
          { userId: { $eq: userId } },
          { status: { $ne: "draft" } },
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
          { userId: { $eq: userId } },
          { status: { $ne: "draft" } },
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: range * (page + 1) },
    { $limit: range },
  ])

  return { data, next: next.length != 0 };
};

const get_my_job_post_draft = async (req) => {
  let userId = req.userId;
  console.log(userId)
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);
  let data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [
          { userId: { $eq: userId } },
          { status: { $eq: "draft" } },
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
          { userId: { $eq: userId } },
          { status: { $eq: "draft" } },
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

const update_employer_post = async (req) => {
  let userId = req.userId;
  let data = await EmployerDetails.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }

  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }

  data = await EmployerDetails.findByIdAndUpdate({ _id: data._id }, { ...req.body, ...{ status: "Published" } }, { new: true });
  return data;
}

const update_employer_post_draft = async (req) => {
  let userId = req.userId;
  let data = await EmployerDetails.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }

  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }

  data = await EmployerDetails.findByIdAndUpdate({ _id: data._id }, req.body, { new: true });
  return data;
}

const get_active_postes = async (req) => {
  console.log("sdkhj")
  let userId = req.userId;
  let filter = { active: true };

  if (req.query.key != null && req.query.key != '' && req.query.key != 'null') {
    filter = { $or: [{ jobTittle: { $regex: req.query.key, $options: 'i' } }, { keySkill: { $in: [req.query.key] } }, { jobLocation: { $in: [req.query.key] } }] }
  }
  console.log(filter)

  let data = await EmployerDetails.aggregate([
    { $match: { $and: [filter, { status: { $ne: "draft" } }, { userId: { $eq: userId } }] } },
    { $limit: 20 },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        jobTittle: 1,
        keySkill: 1,

      }
    }
  ])
  return data;
}

const create_stream_request = async (req) => {

  let userId = req.userId;
  let body = req.body;
  let findpost = await EmployerDetails.findById(req.body.post);
  if (!findpost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }
  let iso = new Date(req.body.datetime).getTime();
  let end = moment(iso).add(30, 'minutes');
  let startTime = iso;
  let endTime = end;
  let actualEnd = end;

  let create = await Jobpoststream.create({ ...body, ...{ userId: userId, startTime, endTime, actualEnd } });

  return create;

}

const update_stream_request = async (req) => {
  let body = req.body;
  let findpost = await EmployerDetails.findById(req.body.post);
  if (!findpost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }
  let iso = new Date(req.body.datetime).getTime();
  let end = moment(iso).add(30, 'minutes');
  let startTime = iso;
  let endTime = end;
  let actualEnd = end;
  let update = await Jobpoststream.findById(req.body.stream);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream Request not found');
  }
  if (update.status != 'Pending') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Aable Update');
  }
  update = await Jobpoststream.findByIdAndUpdate({ _id: req.body.stream }, { ...body, ...{ startTime, endTime, actualEnd } }, { new: true });
  return update;

}


const get_my_job_stream = async (req) => {

  let userId = req.userId;
  console.log(userId)
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

  let data = await Jobpoststream.aggregate([
    {
      $match: {
        $and: [
          { userId: { $eq: userId } },
        ]
      }
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'post',
        foreignField: '_id',
        as: 'employerdetails',
      },
    },
    { $unwind: "$employerdetails" },
    { $sort: { createdAt: -1 } },
    { $skip: range * page },
    { $limit: range },

    {
      $project: {
        endTime: 1,
        startTime: 1,
        actualEnd: 1,
        _id: 1,
        createdAt: 1,
        datetime: 1,
        status: 1,
        adminActive: "$employerdetails.adminActive",
        adminStatus: "$employerdetails.adminStatus",
        apply_method: "$employerdetails.apply_method",
        candidateDescription: "$employerdetails.candidateDescription",
        department: "$employerdetails.department",
        education: "$employerdetails.education",
        education_array: "$employerdetails.education_array",
        education_match: "$employerdetails.education_match",
        education_object: "$employerdetails.education_object",
        employmentType: "$employerdetails.employmentType",
        experienceFrom: "$employerdetails.experienceFrom",
        experienceTo: "$employerdetails.experienceTo",
        industry: "$employerdetails.industry",
        interviewType: "$employerdetails.interviewType",
        jobDescription: "$employerdetails.jobDescription",
        jobLocation: "$employerdetails.jobLocation",
        jobTittle: "$employerdetails.jobTittle",
        keySkill: "$employerdetails.keySkill",
        location: "$employerdetails.location",
        openings: "$employerdetails.openings",
        preferedIndustry: "$employerdetails.preferedIndustry",
        qualification: "$employerdetails.qualification",
        recruiterEmail: "$employerdetails.recruiterEmail",
        recruiterList: "$employerdetails.recruiterList",
        recruiterName: "$employerdetails.recruiterName",
        recruiterNumber: "$employerdetails.recruiterNumber",
        roleCategory: "$employerdetails.roleCategory",
        salaryDescription: "$employerdetails.salaryDescription",
        salaryRangeFrom: "$employerdetails.salaryRangeFrom",
        salaryRangeTo: "$employerdetails.salaryRangeTo",
        urltoApply: "$employerdetails.urltoApply",
        workplaceType: "$employerdetails.workplaceType",
        post: 1
      }
    }

  ])

  let next = await Jobpoststream.aggregate([
    {
      $match: {
        $and: [
          { userId: { $eq: userId } },
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: range * (page + 1) },
    { $limit: range },
  ])

  return { data, next: next.length != 0 };
}

const get_post_details_single = async (req) => {
  let userId = req.userId;
  let update = await Jobpoststream.findById(req.query.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }
  let data = await EmployerDetails.findById(update.post);
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
  get_post_details,
  update_employer_post,
  update_employer_post_draft,
  get_my_job_post_draft,
  get_active_postes,
  create_stream_request,
  get_my_job_stream,
  update_stream_request,
  get_post_details_single
};
