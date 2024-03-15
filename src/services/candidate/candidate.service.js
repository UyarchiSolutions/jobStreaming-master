const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const Agora = require('agora-access-token');
const axios = require('axios');
const { EmployerDetails, Jobpoststream, Applypost } = require('../../models/employerDetails.model');

const { AgriCandidate, AgriEventSlot, agriCandReview, IntrestedCandidate, SlotBooking, BookedSlot, Reference, } = require('../../models/agri.Event.model')

const get_all_candidates = async (req) => {


  let range = req.body.range == null || req.body.range == undefined || req.body.range == null ? 10 : parseInt(req.body.range);
  let page = req.body.page == null || req.body.page == undefined || req.body.page == null ? 0 : parseInt(req.body.page);


  let candidate = await AgriCandidate.aggregate([
    {
      $match: {
        $or: [
          { skills: { $elemMatch: { $regex: "Horticulture", $options: "i" } } },
          { skills: { $elemMatch: { $regex: "Forestrxzczy", $options: "i" } } }
        ]
      }
    },

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

module.exports = {
  get_all_candidates,
  get_applied_jobs,
  get_candidate_applies

};


