const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { EmployerDetails, Jobpoststream, Applypost, Savedpost, Recruiters, Interviewer } = require('../models/employerDetails.model');
const { EmployerRegistration } = require('../models/employerRegistration.model');

const { StreamAppID, Streamtoken } = require('../models/stream.model');

const { videoupload } = require('./S3video.service')
const fileupload = require('fs');

const moment = require('moment');
// create job Alert


const get_my_job_post = async (req) => {
  let userId = req.userId;
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

  let now_time = new Date().getTime();
  await EmployerDetails.updateMany({ userId: { $eq: userId }, status: { $eq: "Published" }, expireAt: { $lt: now_time }, }, { $set: { status: "Expired" } }, { new: true });
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

const toggle_job_stream = async (req) => {
  let userId = req.userId;
  let data = await Jobpoststream.findById(req.query.id);
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
  let userBody = req.body
  let data = await EmployerDetails.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');
  }

  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  let recruiter;
  if (userBody.recruiterList == 'Recruiters List') {
    recruiter = await Recruiters.findById(userBody.recruiterId);
  }
  if (userBody.recruiterList == 'New Recruiter') {
    recruiter = await Recruiters.findOne({ userId: userId, email: userBody.recruiterEmail, mobileNumber: userBody.recruiterNumber });
    if (!recruiter) {
      recruiter = await Recruiters.create({ userId: userId, recruiterName: userBody.recruiterName, mobileNumber: userBody.recruiterNumber, email: userBody.recruiterEmail });
    }
  }
  if (!recruiter) {
    throw new ApiError(httpStatus.NOT_FOUND, 'recruiter Not found');
  }
  userBody.recruiterList = 'Recruiters List';
  let values = { ...userBody, ...{ recruiterId: recruiter._id, status: "Published" } };
  data = await EmployerDetails.findByIdAndUpdate({ _id: data._id }, values, { new: true });
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
    { $match: { $and: [filter, { status: { $eq: "Published" } }, { userId: { $eq: userId } }] } },
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

  let already = await Jobpoststream.find({ post: body.post, $or: [{ $and: [{ startTime: { $lt: iso } }, { endTime: { $gt: iso } }] }, { $and: [{ startTime: { $lt: end } }, { endTime: { $gt: end } }] }] })


  if (already.length != 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Another stream Inbetween Time');

  }
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Able Update');
  }
  let already = await Jobpoststream.find({ _id: { $ne: update._id }, post: body.post, $or: [{ $and: [{ startTime: { $lt: iso } }, { endTime: { $gt: iso } }] }, { $and: [{ startTime: { $lt: end } }, { endTime: { $gt: end } }] }] });
  if (already.length != 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Another stream Inbetween Time');
  }
  update = await Jobpoststream.findByIdAndUpdate({ _id: req.body.stream }, { ...body, ...{ startTime, endTime, actualEnd } }, { new: true });
  return update;
}


const get_my_job_stream = async (req) => {

  let userId = req.userId;
  console.log(userId)
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

  let now_time = new Date().getTime();
  await Jobpoststream.updateMany({ userId: userId, status: "On Going", endTime: { $lt: now_time } }, { $set: { status: "Completed" } }, { new: true })
  await Jobpoststream.updateMany({ userId: userId, status: "Pending", endTime: { $lt: now_time } }, { $set: { status: "Time Out" } }, { new: true })

  // 
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
      $addFields: {
        status: {
          $cond: {
            if: { $lt: ["$endTime", now_time] },
            then: {
              $cond: {
                if: { $in: ["$status", ['Completed', 'On Going']] },
                then: "Completed",
                else: "Time Out"
              }
            },
            else: "$status"
          }
        }
      }
    },
    {
      $project: {
        endTime: 1,
        startTime: 1,
        actualEnd: 1,
        _id: 1,
        createdAt: 1,
        datetime: 1,
        status: 1,
        active: 1,
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
        post: 1,
        totalApply: "$employerdetails.appliedCount",
        appliedCount: 1,
        stream_video_URL: 1,
        selected_video: 1,
        show_video: 1,
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

const get_post_details_candidateAuth = async (req) => {
  let userId = req.userId;
  let update = await Streamtoken.findById(req.query.id);
  console.log(update)
  if (!update) {
    update = await Jobpoststream.findById(req.query.id);
  }

  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job Post not found');

  }

  let stream = await EmployerDetails.aggregate([
    { $match: { $and: [{ _id: { $eq: update.post } }] } },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'employerregistrations',
      },
    },
    { $unwind: "$employerregistrations" },

    {
      $lookup: {
        from: 'jobpostapplies',
        localField: '_id',
        foreignField: 'jobpostId',
        pipeline: [
          { $match: { candidateID: { $eq: userId } } }
        ],
        as: 'jobpostapplies',
      },
    },
    {
      $unwind: {
        path: '$jobpostapplies',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        cmp_choosefile: "$employerregistrations.choosefile",
        cmp_companyAddress: "$employerregistrations.companyAddress",
        cmp_companyDescription: "$employerregistrations.companyDescription",
        cmp_companyType: "$employerregistrations.companyType",
        cmp_companyWebsite: "$employerregistrations.companyWebsite",
        cmp_contactName: "$employerregistrations.contactName",
        cmp_industryType: "$employerregistrations.industryType",
        cmp_location: "$employerregistrations.location",
        cmp_logo: "$employerregistrations.logo",
        cmp_name: "$employerregistrations.name",
        cmp_postedBy: "$employerregistrations.postedBy",
        cmp_registrationType: "$employerregistrations.choosefile",
        apply: { $ifNull: ["$jobpostapplies.active", false] }
      }
    },
    { $unset: "employerregistrations" },
    { $unset: "jobpostapplies" },


  ])

  if (stream.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }


  return stream[0];
}


const get_post_details_completed = async (req) => {
  let userId = req.userId;
  let streamId = req.query.id;

  let stream = await Jobpoststream.aggregate([
    { $match: { $and: [{ userId: { $eq: userId } }, { _id: { $eq: streamId } }, { status: { $eq: "Completed" } }] } },
    {
      $lookup: {
        from: 'streamtokens',
        localField: '_id',
        foreignField: 'streamId',
        pipeline: [
          { $match: { $and: [{ videoLink: { $ne: null } }, { type: { $eq: 'CloudRecording' } }] } },
        ],
        as: 'streamtokens',
      },
    },
  ])


  if (stream.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }


  return stream[0];
}



const apply_candidate_jobpost_onlive = async (req) => {
  let userId = req.userId;
  let update = await Streamtoken.findById(req.body.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let stream = await Jobpoststream.findById(update.chennel);
  if (!stream) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let post = await EmployerDetails.findById(stream.post);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let apply = await Applypost.findOne({ jobpostId: update.post, candidateID: userId });
  if (!apply) {
    apply = await Applypost.create({ jobpostId: update.post, joineduser: update._id, candidateID: userId, streamId: update.streamId, type: "Onlive" });
    stream.appliedCount = stream.appliedCount + 1;
    stream.save();
    post.appliedCount = post.appliedCount + 1;
    post.save();
  }
  return apply;

}

const apply_candidate_jobpost_completed = async (req) => {
  let userId = req.userId;
  let update = await Jobpoststream.findById(req.body.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let post = await EmployerDetails.findById(update.post);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let apply = await Applypost.findOne({ jobpostId: update.post, candidateID: userId });
  if (!apply) {
    apply = await Applypost.create({ jobpostId: update.post, candidateID: userId, streamId: update._id, type: "Completed" });
    update.appliedCount = update.appliedCount + 1;
    update.save();
    post.appliedCount = post.appliedCount + 1;
    post.save();
  }
  return apply;

}

const apply_candidate_jobpost = async (req) => {
  let userId = req.userId;
  let update = await EmployerDetails.findById(req.body.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let apply = await Applypost.findOne({ jobpostId: update._id, candidateID: userId });
  if (!apply) {
    apply = await Applypost.create({ jobpostId: update._id, candidateID: userId, type: "Normal" });
    update.appliedCount = update.appliedCount + 1;
    update.save();
  }
  return apply;

}


const saved_post_candidate = async (req) => {
  let userId = req.userId;
  let update = await EmployerDetails.findById(req.body.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  let apply = await Savedpost.findOne({ jobpostId: update._id, candidateID: userId });
  if (!apply) {
    apply = await Savedpost.create({ jobpostId: update._id, candidateID: userId });
  }

  return apply;
}


const create_recruiters = async (req) => {
  let userId = req.userId;
  let userBody = req.body;

  let exit = await Recruiters.findOne({ userId: userId, email: userBody.email });
  if (exit && exit.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exists');
  }
  exit = await Recruiters.findOne({ userId: userId, mobileNumber: userBody.mobileNumber });
  if (exit && exit.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Already Exists');
  }
  if (exit) {
    if (!exit.active) {
      exit = await Recruiters.findByIdAndUpdate({ _id: exit._id }, { ...req.body, ...{ active: true, createdAt: moment() } }, { new: true });
    }
  }
  if (!exit) {
    exit = await Recruiters.create({ ...userBody, ...{ userId } });
  }
  return exit;
}

const update_recruiters = async (req) => {
  let userBody = req.body;
  let userId = req.userId;
  let update = await Recruiters.findById(req.body.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'StRecruitersream not found');
  }
  let exit = await Recruiters.findOne({ userId: userId, email: userBody.email, _id: { $ne: update._id } });
  if (exit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exists');
  }
  exit = await Recruiters.findOne({ userId: userId, mobileNumber: userBody.mobileNumber, _id: { $ne: update._id } });
  if (exit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Already Exists');
  }
  update = await Recruiters.findByIdAndUpdate({ _id: update._id }, userBody, { new: true });

  return update;
}
const get_recruiters = async (req) => {
  let userId = req.userId;
  let data = await Recruiters.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }
  if (data.userId != userId || !data.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }
  return data;
}
const get_all_recruiters = async (req) => {
  let userId = req.userId;
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

  let data = await Recruiters.aggregate([
    { $match: { $and: [{ active: { $eq: true } }, { userId: { $eq: userId } }] } },
    { $skip: range * page },
    { $limit: range },
  ]);
  let next = await Recruiters.aggregate([
    { $match: { $and: [{ active: { $eq: true } }, { userId: { $eq: userId } }] } },
    { $skip: range * (page + 1) },
    { $limit: range },
  ]);

  return { data, next: next.length != 0 };
}

const delete_recruiters = async (req) => {
  let userId = req.userId;
  let data = await Recruiters.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }
  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }

  data.active = false;
  data.save();

  return data;
}
const toggle_recruiters = async (req) => {
  let userId = req.userId;
  let data = await Recruiters.findById(req.body.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  data.activity = !data.activity;
  data.save();
  return data;

}

const list_recruiters = async (req) => {
  let userId = req.userId;
  let data = await Recruiters.find({ userId, active: true, activity: true });

  return data;

}





// interviewers


const create_interviewer = async (req) => {
  let userId = req.userId;
  let userBody = req.body;

  let exit = await Interviewer.findOne({ userId: userId, email: userBody.email });
  if (exit && exit.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exists');
  }
  exit = await Interviewer.findOne({ userId: userId, mobileNumber: userBody.mobileNumber });
  if (exit && exit.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Already Exists');
  }
  if (exit) {
    if (!exit.active) {
      exit = await Interviewer.findByIdAndUpdate({ _id: exit._id }, { ...req.body, ...{ active: true, createdAt: moment() } }, { new: true });
    }
  }
  if (!exit) {
    exit = await Interviewer.create({ ...userBody, ...{ userId } });
  }
  return exit;
}

const update_interviewer = async (req) => {
  let userBody = req.body;
  let userId = req.userId;
  let update = await Interviewer.findById(req.body.id);
  if (!update) {
    throw new ApiError(httpStatus.NOT_FOUND, 'StRecruitersream not found');
  }
  let exit = await Interviewer.findOne({ userId: userId, email: userBody.email, _id: { $ne: update._id } });
  if (exit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email Already Exists');
  }
  exit = await Interviewer.findOne({ userId: userId, mobileNumber: userBody.mobileNumber, _id: { $ne: update._id } });
  if (exit) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mobile Number Already Exists');
  }
  update = await Interviewer.findByIdAndUpdate({ _id: update._id }, userBody, { new: true });

  return update;
}
const get_interviewer = async (req) => {
  let userId = req.userId;
  let data = await Interviewer.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }
  if (data.userId != userId || !data.active) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }
  return data;
}
const get_all_interviewer = async (req) => {
  let userId = req.userId;
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

  let data = await Interviewer.aggregate([
    { $match: { $and: [{ active: { $eq: true } }, { userId: { $eq: userId } }] } },
    { $skip: range * page },
    { $limit: range },
  ]);
  let next = await Interviewer.aggregate([
    { $match: { $and: [{ active: { $eq: true } }, { userId: { $eq: userId } }] } },
    { $skip: range * (page + 1) },
    { $limit: range },
  ]);

  return { data, next: next.length != 0 };
}

const delete_interviewer = async (req) => {
  let userId = req.userId;
  let data = await Interviewer.findById(req.query.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }
  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Recruiter not found');
  }

  data.active = false;
  data.save();

  return data;
}
const toggle_interviewer = async (req) => {
  let userId = req.userId;
  let data = await Interviewer.findById(req.body.id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  if (data.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  data.activity = !data.activity;
  data.save();
  return data;

}

const list_interviewer = async (req) => {
  let userId = req.userId;
  let data = await Interviewer.find({ userId, active: true, activity: true });

  return data;

}

const resume_interviewer = async (req) => {
  let userId = req.userId;
  let data = await Interviewer.findById(req.body.id);
  if (!data) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }
  if (data.userId != userId) {
    fileupload.unlink(req.file.path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    throw new ApiError(httpStatus.NOT_FOUND, 'Stream not found');
  }

  let up = await videoupload(req.file, 'upload/resume/', 'mp4');
  if (up) {
    data.resumeURL = up.Location;
    data.save();
  }
  fileupload.unlink(req.file.path, (err) => {
    if (err) {
      return;
    }
  });
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
  get_post_details_single,
  get_post_details_completed,
  get_post_details_candidateAuth,
  apply_candidate_jobpost_onlive,
  apply_candidate_jobpost_completed,
  apply_candidate_jobpost,
  saved_post_candidate,
  toggle_job_stream,
  create_recruiters,
  update_recruiters,
  get_recruiters,
  get_all_recruiters,
  delete_recruiters,
  toggle_recruiters,
  list_recruiters,
  create_interviewer,
  update_interviewer,
  get_interviewer,
  get_all_interviewer,
  delete_interviewer,
  toggle_interviewer,
  list_interviewer,
  resume_interviewer
};
