const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const Agora = require('agora-access-token');
const axios = require('axios');
const { EmployerDetails, Jobpoststream, Applypost, Myinterview } = require('../../models/employerDetails.model');

const { AgriCandidate, AgriEventSlot, agriCandReview, IntrestedCandidate, SlotBooking, BookedSlot, Reference, } = require('../../models/agri.Event.model')

const get_all_candidates = async (req) => {


  let range = req.body.range == null || req.body.range == undefined || req.body.range == null ? 10 : parseInt(req.body.range);
  let page = req.body.page == null || req.body.page == undefined || req.body.page == null ? 0 : parseInt(req.body.page);


  let candidate = await AgriCandidate.aggregate([
    // {
    //   $match: {
    //     $or: [
    //       { skills: { $elemMatch: { $regex: "Horticulture", $options: "i" } } },
    //       { skills: { $elemMatch: { $regex: "Forestrxzczy", $options: "i" } } }
    //     ]
    //   }
    // },

    { $skip: range * page },
    { $limit: range },
  ]);

  let next = await AgriCandidate.aggregate([
    { $skip: range * (page + 1) },
    { $limit: range },
  ]);

  return { candidate, next: next != 0 };

}


const get_applied_jobs = async (req) => {
  let userId = req.userId;
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);

  let jobs = await Applypost.aggregate([
    { $sort: { createdAt: -1 } },
    { $match: { $and: [{ candidateID: { $eq: userId } }] } },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobpostId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          { $unwind: "$employerregistrations" },

        ],
        as: 'employerdetails',
      },
    },
    { $unwind: "$employerdetails" },

    {
      $addFields: {
        adminActive: "$employerdetails.adminActive",
        data: "$employerdetails.data",
        cities: "$employerdetails.cities",
        keySkill: "$employerdetails.keySkill",
        jobLocation: "$employerdetails.jobLocation",
        qualification: "$employerdetails.qualification",
        education: "$employerdetails.education",
        location: "$employerdetails.location",
        adminStatus: "$employerdetails.adminStatus",
        education_object: "$employerdetails.education_object",
        education_array: "$employerdetails.education_array",
        education_match: "$employerdetails.education_match",
        appliedCount: "$employerdetails.appliedCount",
        jobTittle: "$employerdetails.jobTittle",
        jobDescription: "$employerdetails.jobDescription",
        candidateDescription: "$employerdetails.candidateDescription",
        salaryDescription: "$employerdetails.salaryDescription",
        salaryRangeFrom: "$employerdetails.salaryRangeFrom",
        salaryRangeTo: "$employerdetails.salaryRangeTo",
        industry: "$employerdetails.industry",
        experienceFrom: "$employerdetails.experienceFrom",
        experienceTo: "$employerdetails.experienceTo",
        preferedIndustry: "$employerdetails.preferedIndustry",
        interviewType: "$employerdetails.interviewType",
        employmentType: "$employerdetails.employmentType",
        openings: "$employerdetails.openings",
        workplaceType: "$employerdetails.workplaceType",
        urltoApply: "$employerdetails.urltoApply",
        apply_method: "$employerdetails.apply_method",
        recruiterList: "$employerdetails.recruiterList",
        department: "$employerdetails.department",
        roleCategory: "$employerdetails.roleCategory",
        recruiterName: "$employerdetails.recruiterName",
        recruiterEmail: "$employerdetails.recruiterEmail",
        recruiterNumber: "$employerdetails.recruiterNumber",
        post_createdAt: "$employerdetails.createdAt",
        companyType: "$employerdetails.employerregistrations.companyType",
        companyType: "$employerdetails.employerregistrations.companyType",
        companyAddress: "$employerdetails.employerregistrations.companyAddress",
        companyDescription: "$employerdetails.employerregistrations.companyDescription",
        contactName: "$employerdetails.employerregistrations.contactName",
        name: "$employerdetails.employerregistrations.name",
        cmp_location: "$employerdetails.employerregistrations.location",
        registrationType: "$employerdetails.employerregistrations.registrationType",
        companyWebsite: "$employerdetails.employerregistrations.companyWebsite",
      }
    },
    { $unset: "employerdetails" },
    { $skip: range * page },
    { $limit: range },
  ])


  let next = await Applypost.aggregate([
    { $match: { $and: [{ candidateID: { $eq: userId } }] } },
    { $skip: range * (page + 1) },
    { $limit: range },

  ])

  return { jobs, next: next.length != 0 }
}

const get_candidate_applies = async (req) => {
  let userId = req.userId
  let post = req.query.id;
  let range = req.query.range == null || req.query.range == undefined || req.query.range == null ? 10 : parseInt(req.query.range);
  let page = req.query.page == null || req.query.page == undefined || req.query.page == null ? 0 : parseInt(req.query.page);


  let posts = await Jobpoststream.findById(post);
  let match = { jobpostId: { $eq: post } };
  if (posts) {
    post = posts._id;
    match = { streamId: { $eq: post } };

  }


  let applies = await Applypost.aggregate([
    { $match: { $and: [match] } },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobpostId',
        foreignField: '_id',
        pipeline: [
          { $match: { userId: { $eq: userId } } }
        ],
        as: 'employerdetails',
      },
    },
    { $unwind: "$employerdetails" },
    { $unset: "employerdetails" },


    {
      $lookup: {
        from: 'agricandidates',
        localField: 'candidateID',
        foreignField: '_id',
        as: 'agricandidates',
      },
    },
    { $unwind: "$agricandidates" },

    {
      $addFields: {
        _id: "$agricandidates._id",
        applyID: "$_id",
        skills: "$agricandidates.skills",
        language: "$agricandidates.language",
        intrest: "$agricandidates.intrest",
        techIntrest: "$agricandidates.techIntrest",
        experience_year: "$agricandidates.experience_year",
        experience_month: "$agricandidates.experience_month",
        name: "$agricandidates.name",
        mail: "$agricandidates.mail",
        mobile: "$agricandidates.mobile",
        location: "$agricandidates.location",
        Instituitionname: "$agricandidates.Instituitionname",
        affiliateduniversity: "$agricandidates.affiliateduniversity",
        Education: "$agricandidates.Education",
        course: "$agricandidates.course",
        yearOfPassing: "$agricandidates.yearOfPassing",
        dob: "$agricandidates.dob",
        gender: "$agricandidates.gender",
        resumeUrl: "$agricandidates.resumeUrl",
      }
    },

    { $unset: "agricandidates" },

    { $skip: range * page },
    { $limit: range },
  ])
  let next = await Applypost.aggregate([
    { $match: { $and: [match] } },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobpostId',
        foreignField: '_id',
        pipeline: [
          { $match: { userId: { $eq: userId } } }
        ],
        as: 'employerdetails',
      },
    },
    { $unwind: "$employerdetails" },
    { $unset: "employerdetails" },
    { $skip: range * (page + 1) },
    { $limit: range },
  ])

  return { data: applies, next: next.length != 0 }
}


const applied_candidate_details = async (req) => {
  let candidateID = req.query.id;
  let userId = req.userId;
  let candidate = await Applypost.findById(candidateID);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  candidate = await Applypost.aggregate([
    { $match: { $and: [{ _id: { $eq: candidateID } }] } },
    {
      $lookup: {
        from: 'myinterviews',
        localField: 'candidateID',
        foreignField: 'candidateId',
        pipeline: [
          { $match: { $and: [{ userId: { $eq: userId } }] } }
        ],
        as: 'myinterviews',
      },
    },
    {
      $unwind: {
        path: '$myinterviews',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobpostId',
        pipeline: [{ $match: { $and: [{ userId: { $eq: userId } }] } }],
        foreignField: '_id',
        as: 'employerdetails',
      },
    },
    { $unwind: "$employerdetails" },
    {
      $lookup: {
        from: 'agricandidates',
        localField: 'candidateID',
        foreignField: '_id',
        as: 'agricandidates',
      },
    },
    { $unwind: "$agricandidates" },
    { $unset: "employerdetails" },
    {
      $addFields: {
        "skills": "$agricandidates.skills",
        "language": "$agricandidates.language",
        "experience_year": "$agricandidates.experience_year",
        "experience_month": "$agricandidates.experience_month",
        "name": "$agricandidates.name",
        "mail": "$agricandidates.mail",
        "mobile": "$agricandidates.mobile",
        "location": "$agricandidates.location",
        "Instituitionname": "$agricandidates.Instituitionname",
        "affiliateduniversity": "$agricandidates.affiliateduniversity",
        "Education": "$agricandidates.Education",
        "course": "$agricandidates.course",
        "yearOfPassing": "$agricandidates.yearOfPassing",
        "dob": "$agricandidates.dob",
        "gender": "$agricandidates.gender",
        "resumeUrl": "$agricandidates.resumeUrl",
        interview: { $ifNull: ["$myinterviews.active", false] }
      }
    },
    { $unset: "myinterviews" },
    { $unset: "agricandidates" }
  ]);

  if (candidate.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  return candidate[0];
}


const shortlist_candidate = async (req) => {
  let candidateID = req.body.applied;
  let userId = req.userId;
  let candidate = await Applypost.findById(candidateID);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  let post = await EmployerDetails.findById(candidate.jobpostId);

  if (post.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  candidate.status = 'Shortlisted';
  candidate.save();

  let move = await Myinterview.findOne({ userId, candidateId: candidate.candidateID });
  if (move) {
    move.short = new Date().getTime();
    move.save();
  }
  return { status: candidate.status };
}
const reject_candidate = async (req) => {
  let candidateID = req.body.applied;
  let userId = req.userId;
  let candidate = await Applypost.findById(candidateID);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  let post = await EmployerDetails.findById(candidate.jobpostId);

  if (post.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  candidate.status = 'Rejected';
  candidate.save();
  return { status: candidate.status };
}

const shortlist_candidate_multible = async (req) => {
  let candidateID = req.body.applied;
  let userId = req.userId;
  let candidate = await Applypost.find({ _id: { $in: candidateID } });
  if (candidate.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  candidate.forEach(async (element) => {
    let post = await EmployerDetails.findById(element.jobpostId);
    if (post.userId == userId) {
      element.status = 'Shortlisted';
      element.save();
      let move = await Myinterview.findOne({ userId, candidateId: element.candidateID });
      if (move) {
        move.short = new Date().getTime();
        move.save();
      }
    }
  });

  return { status: "Shortlisted" };
}
const reject_candidate_multible = async (req) => {
  let candidateID = req.body.applied;
  let userId = req.userId;
  let candidate = await Applypost.find({ _id: { $in: candidateID } });
  if (candidate.length == 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  candidate.forEach(async (element) => {
    let post = await EmployerDetails.findById(element.jobpostId);
    if (post.userId == userId) {
      element.status = 'Rejected';
      element.save();
      let move = await Myinterview.findOne({ userId, candidateId: element.candidateID });
      if (move) {
        move.short = new Date().getTime();
        move.save();
      }
    }
  });

  return { status: "Rejected" };
}

const undo_candidate = async (req) => {
  let candidateID = req.body.applied;
  let userId = req.userId;
  let candidate = await Applypost.findById(candidateID);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  let post = await EmployerDetails.findById(candidate.jobpostId);

  if (post.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }
  candidate.status = 'Applied';
  candidate.save();
  return { status: candidate.status };
}


const move_to_interview = async (req) => {

  let candidateID = req.body.applied;
  let userId = req.userId;
  let candidate = await Applypost.findById(candidateID);
  if (!candidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Applies Not Found');
  }
  let post = await EmployerDetails.findById(candidate.jobpostId);

  if (post.userId != userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Access');
  }

  let move = await Myinterview.findOne({ userId, candidateId: candidate.candidateID });
  if (!move) {
    move = await Myinterview.create({ userId, candidateId: candidate.candidateID });
  }
  move.short = new Date().getTime();
  move.status = 'moved';
  move.save();
  return { interview: move.active };
  // Myinterview
}


const get_my_interviews = async (req) => {

  let userId = req.userId;

  let range = req.body.range == null || req.body.range == undefined || req.body.range == null ? 10 : parseInt(req.body.range);
  let page = req.body.page == null || req.body.page == undefined || req.body.page == null ? 0 : parseInt(req.body.page);

  let nowTime = new Date().getTime();
  let candidate = await Myinterview.aggregate([
    { $match: { $and: [{ userId: { $eq: userId } }] } },
    {
      $lookup: {
        from: 'agricandidates',
        localField: 'candidateId',
        foreignField: '_id',
        as: 'agricandidates',
      },
    },
    { $unwind: "$agricandidates" },
    { $unset: "employerdetails" },
    {
      $lookup: {
        from: 'candidateinterviews',
        localField: '_id',
        foreignField: 'interviewId',
        pipeline: [
          { $sort: { startTime: -1 } },
          { $limit: 1 }
        ],
        as: 'candidateinterviews',
      },
    },
    {
      $unwind: {
        path: '$candidateinterviews',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidateinterviews',
        localField: '_id',
        foreignField: 'interviewId',
        pipeline: [
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'candidateinterviews_count',
      },
    },
    {
      $unwind: {
        path: '$candidateinterviews_count',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "skills": "$agricandidates.skills",
        "language": "$agricandidates.language",
        "experience_year": "$agricandidates.experience_year",
        "experience_month": "$agricandidates.experience_month",
        "name": "$agricandidates.name",
        "mail": "$agricandidates.mail",
        "mobile": "$agricandidates.mobile",
        "location": "$agricandidates.location",
        "Instituitionname": "$agricandidates.Instituitionname",
        "affiliateduniversity": "$agricandidates.affiliateduniversity",
        "Education": "$agricandidates.Education",
        "course": "$agricandidates.course",
        "yearOfPassing": "$agricandidates.yearOfPassing",
        "dob": "$agricandidates.dob",
        "gender": "$agricandidates.gender",
        "resumeUrl": "$agricandidates.resumeUrl",
        interviewStatus: { $ifNull: ["$candidateinterviews.streamStatus", 'Pending'] },
        streamStatus: "$candidateinterviews.status",
        startTime: { $ifNull: ["$candidateinterviews.startTime", null] },
        endTime: { $ifNull: ["$candidateinterviews.endTime", null] },
        interviewCount: { $ifNull: ["$candidateinterviews_count.count", 0] },
        startTime_now: { $gt: ["$candidateinterviews.startTime", nowTime] },
      },
    },

    {
      $addFields: {
        interviewStatus: {
          $cond: {
            if: { $eq: ["$interviewStatus", 'Upcoming'] },
            then: {
              $cond: {
                if: { $lt: ["$startTime", nowTime] },
                then: "Time Out",
                else: "Upcoming"
              }
            },
            else: "$interviewStatus"
          }
        }
      }
    },
    { $unset: "agricandidates" },
    { $unset: "candidateinterviews" },
    { $skip: range * page },
    { $limit: range },
  ]);

  let next = await Myinterview.aggregate([
    { $match: { $and: [{ userId: { $eq: userId } }] } },
    { $skip: range * (page + 1) },
    { $limit: range },
  ]);

  return { candidate, next: next != 0 };

}



module.exports = {
  get_all_candidates,
  get_applied_jobs,
  get_candidate_applies,
  applied_candidate_details,
  shortlist_candidate,
  reject_candidate,
  undo_candidate,
  move_to_interview,
  shortlist_candidate_multible,
  reject_candidate_multible,
  get_my_interviews


};






