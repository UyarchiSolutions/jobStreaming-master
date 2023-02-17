const httpStatus = require('http-status');
const {
  KeySkill,
  CandidatePostjob,
  CandidateSaveJob,
  CandidateSearchjobCandidate,
  candidataSearchEmployerSet,
  CandidateRecentSearchjobCandidate,
  EducationDeatils,
} = require('../models/candidateDetails.model');
const { CandidateRegistration } = require('../models');
const { Languages } = require('../models/languages.model');
const { EmployerDetails, EmployerPostjob } = require('../models/employerDetails.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');
//keySkill

const createkeySkill = async (userId, userBody) => {
  console.log(userId);
  // let secondarySkill;
  // let pasrSkill;
  // let keyskill = userBody.keyskill.split(',');
  // let currentSkill = userBody.currentSkill.split(',');
  // let preferredSkill = userBody.preferredSkill.split(',');
  // if (userBody.secondarySkill != null) {
  //   secondarySkill = userBody.secondarySkill.split(',');
  // }
  // if (userBody.pasrSkill != null) {
  //   pasrSkill = userBody.pasrSkill.split(',');
  // }
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  let values = {
    ...userBody,
    ...{
      userId: userId,
      date: date,
      time: creat1,
      // keyskill: keyskill,
      // currentSkill: currentSkill,
      // preferredSkill: preferredSkill,
      // secondarySkill: secondarySkill,
      // pasrSkill: pasrSkill,
    },
  };
  let data = await KeySkill.create(values);
  return data;
};

const getByIdUser = async (id) => {
  const data = await CandidateRegistration.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidatedetails',
        localField: '_id',
        foreignField: 'userId',
        pipeline:[
          {
            $lookup: {
              from: 'qualifications',
              localField: 'sslcQualification',
              foreignField: '_id',
              as: 'sslcqualifications',
            },
          },
          {
            $unwind: {
              path: '$sslcqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'hsQualification',
              foreignField: '_id',
              as: 'hscqualifications',
            },
          },
          {
            $unwind: {
              path: '$hscqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'drQualification',
              foreignField: '_id',
              as: 'qualifications',
            },
          },
          {
            $unwind: {
              path: '$qualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'drcourses',
              localField: 'drCourse',
              foreignField: '_id',
              as: 'drcourses',
            },
          },
          {
            $unwind: {
              path: '$drcourses',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'drspecializations',
              localField: 'drSpecialization',
              foreignField: '_id',
              as: 'drspecializations',
            },
          },
          {
            $unwind: {
              path: '$drspecializations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'pgQualification',
              foreignField: '_id',
              as: 'pgqualifications',
            },
          },
          {
            $unwind: {
              path: '$pgqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'pgcourses',
              localField: 'pgCourse',
              foreignField: '_id',
              as: 'pgcourses',
            },
          },
          {
            $unwind: {
              path: '$pgcourses',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'pgspecializations',
              localField: 'pgSpecialization',
              foreignField: '_id',
              as: 'pgspecializations',
            },
          },
          {
            $unwind: {
              path: '$pgspecializations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'ugQualification',
              foreignField: '_id',
              as: 'ugqualifications',
            },
          },
          {
            $unwind: {
              path: '$ugqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'ugcourses',
              localField: 'ugCourse',
              foreignField: '_id',
              as: 'ugcourses',
            },
          },
          {
            $unwind: {
              path: '$ugcourses',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'specializations',
              localField: 'ugSpecialization',
              foreignField: '_id',
              as: 'specializations',
            },
          },
          {
            $unwind: {
              path: '$specializations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'industries',
              localField: 'industry',
              foreignField: '_id',
              as: 'industries',
            },
          },
          {
            $unwind: {
              path: '$industries',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'department',
              foreignField: '_id',
              as: 'departments',
            },
          },
          {
            $unwind: {
              path: '$departments',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'rolecategories',
              localField: 'roleCategory',
              foreignField: '_id',
              as: 'rolecategories',
            },
          },
          {
            $unwind: {
              path: '$rolecategories',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'jobroles',
              localField: 'role',
              foreignField: '_id',
              as: 'jobroles',
            },
          },
          {
            $unwind: {
              path: '$jobroles',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'candidatedetails',
      },
    },
    {
      $unwind: {
        path: '$candidatedetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        resume: 1,
        email: 1,
        workStatus: 1,
        mobileNumber: 1,
        name: 1,
        lat: 1,
        long: 1,
        resume: 1,
        createdAt: 1,
        updatedAt: 1,
        // candidateDetails: '$candidatedetails',
        keyskill:'$candidatedetails.keyskill',
        currentSkill:'$candidatedetails.currentSkill',
        preferredSkill:'$candidatedetails.preferredSkill',
        active:'$candidatedetails.active',
        image:'$candidatedetails.image',
        dob:'$candidatedetails.dob',
        experienceYear:'$candidatedetails.experienceYear',
        experienceMonth:'$candidatedetails.experienceMonth',
        expectedctc:'$candidatedetails.expectedctc',
        currentctc:'$candidatedetails.currentctc',
        locationCurrent:'$candidatedetails.locationCurrent',
        locationNative:'$candidatedetails.locationNative',
        noticeperiod:'$candidatedetails.noticeperiod',
        gender:'$candidatedetails.gender',
        maritalStatus:'$candidatedetails.maritalStatus',
        ugMarks:'$candidatedetails.ugMarks',
        ugGradingSystem:'$candidatedetails.ugGradingSystem',
        ugCourseType:'$candidatedetails.ugCourseType',
        ugCourseDurationTo:'$candidatedetails.ugCourseDurationTo',
        ugCourseDurationFrom:'$candidatedetails.ugCourseDurationFrom',
        relocate:'$candidatedetails.relocate',
        languages:'$candidatedetails.languages',
        ugUniversity:'$candidatedetails.ugUniversity',
        drQualification:'$candidatedetails.qualifications.qualification',
        drcourses:'$candidatedetails.drcourses.Course',
        drSpecialization:'$candidatedetails.drspecializations.Specialization',
        pgQualification:'$candidatedetails.pgqualifications.qualification',
        pgCourse:'$candidatedetails.pgcourses.Course',
        pgSpecialization:'$candidatedetails.pgspecializations.Specialization',
        ugQualification:'$candidatedetails.ugqualifications.qualification',
        ugCourse:'$candidatedetails.ugcourses.Course',
        ugSpecialization:'$candidatedetails.specializations.Specialization',
        role:'$candidatedetails.jobroles.Job_role',
        roleCategory:'$candidatedetails.rolecategories.Role_Category',
        department:'$candidatedetails.departments.Department',
        industry:'$candidatedetails.industries.Industry',
        sslctotalmarks:'$candidatedetails.sslctotalmarks',
        sslcPassedYear:'$candidatedetails.sslcPassedYear',
        sslcMedium:'$candidatedetails.sslcMedium',
        sslcBoard:'$candidatedetails.sslcBoard',
        sslcQualification:"$candidatedetails.sslcqualifications.qualification",
        pgUniversity:'$candidatedetails.pgUniversity',
        pgMarks:'$candidatedetails.pgUniversity',
        pgGradingSystem:'$candidatedetails.pgUniversity',
        pgCourseType:'$candidatedetails.pgUniversity',
        pgCourseDurationTo:'$candidatedetails.pgUniversity',
        pgCourseDurationFrom:'$candidatedetails.pgUniversity',
        hstotalmarks:'$candidatedetails.hstotalmarks',
        hsPassedYear:'$candidatedetails.hsPassedYear',
        hsMedium:'$candidatedetails.hsMedium',
        hsBoard:'$candidatedetails.hsBoard',
        drMarks:'$candidatedetails.drMarks',
        drGradingSystem:'$candidatedetails.drGradingSystem',
        drCourseType:'$candidatedetails.drCourseType',
        drCourseDurationTo:'$candidatedetails.drCourseDurationTo',
        drCourseDurationFrom:'$candidatedetails.drCourseDurationFrom',
        hsQualification:'$candidatedetails.hscqualifications.qualification',
        keyskillSet:'$candidatedetails.keyskillSet',
        drUniversity:'$candidatedetails.drUniversity',
        experienceMonthSet:'$candidatedetails.experienceMonthSet',
        locationSet:'$candidatedetails.locationSet',
        experienceYearSet:'$candidatedetails.experienceYearSet',
        designationSet:'$candidatedetails.designationSet',
        currentIndustry:'$candidatedetails.currentIndustry',
        currentDepartment:'$candidatedetails.currentDepartment',
        role_Category:'$candidatedetails.role_Category',
        salaryFrom:'$candidatedetails.salaryFrom',
        SalaryTo:'$candidatedetails.SalaryTo',
        candidateDetails:'$candidatedetails'
      },
    },
  ]);
  return data;
};

const getById = async (id) => {
  const data = await KeySkill.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'keySkill not found');
  }
  return data;
};

const updateById = async (userId, updateBody) => {
  const user = await KeySkill.findOne({ userId: userId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Keyskill not found');
  }
  const data = await KeySkill.findOneAndUpdate({ userId: userId }, updateBody, { new: true });
  await data.save();
  return data;
};

const updateEducation = async (userId, updateBody) => {
  const user = await KeySkill.findOne({ userId: userId });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Keyskill not found');
  }
  const data = await KeySkill.findOneAndUpdate({ userId: userId }, updateBody, { new: true });
  await data.save();
  return data;
};

const updateByIdImage = async (id, updateBody) => {
  const user = await KeySkill.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Keyskill not found');
  }
  const data = await KeySkill.findOneAndUpdate({ _id: id }, updateBody, { new: true });
  await data.save();
  return data;
};

const deleteById = async (id) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

// const createSearchCandidate = async (userId, userBody) => {
//   console.log(userId)
//   let values = {...userBody, ...{userId:userId}}
// let data = await CandidateSearchjobCandidate.create(values);
// return data
// };

const candidateSearch = async (body) => {
  let {
    search,
    experience,
    experienceAnotherfrom,
    experienceAnotherto,
    location,
    preferredindustry,
    salary,
    workmode,
    education,
    salaryfilter,
    role,
    freshness,
    locationfilter,
    companytype,
    postedby,
  } = body;
  //  await CandidateSearchjobCandidate.create(values);

  //  search = ["fbhfghfh","software engineer"]
  // console.log(body)
  let experienceSearch = { active: true };
  let experienceAnotherSearch = [{ active: true }];
  let locationSearch = { active: true };
  let allSearch = [{ active: true }];
  let salarySearch = { active: true };
  let preferredindustrySearch = { active: true };
  let workmodeSearch = { active: true };
  let educationSearch = { active: true };
  let salaryfilterSearch = { active: true };
  let roleSearch = { active: true };
  let freshnessSearch = { active: true };
  let locationfilterSearch = { active: true };
  let companytypeSearch = { active: true };
  let postedbySearch = { active: true };
  if (postedby != null) {
    postedbySearch = { companyType: { $in: postedby } };
  }
  if (experienceAnotherfrom != null && experienceAnotherto != null) {
    experienceAnotherSearch = [
      { experienceFrom: { $gte: parseInt(experienceAnotherfrom) } },
      { experienceFrom: { $lte: parseInt(experienceAnotherto) } },
    ];
  }
  if (workmode != null) {
    workmodeSearch = { workplaceType: { $in: workmode } };
  }
  if (companytype != null) {
    companytypeSearch = { industry: { $in: companytype } };
  }
  if (role != null) {
    roleSearch = { role: { $in: role } };
  }
  if (education != null) {
    educationSearch = { educationalQualification: { $in: education } };
  }
  if (preferredindustry != null) {
    preferredindustrySearch = { preferedIndustry: { $eq: preferredindustry } };
  }
  if (salary != null) {
    salarySearch = { salaryRangeFrom: { $lte: parseInt(salary) }, salaryRangeTo: { $gte: parseInt(salary) } };
  }
  if (search.length != 0) {
    // search = search.split(',');
    allSearch = [
      { designation: { $in: search } },
      { keySkill: { $elemMatch: { $in: search } } },
      { jobTittle: { $in: search } },
    ];
  }

  if (experience != null) {
    // experienceSearch = { experienceFrom: { $lte: parseInt(experience) },experienceTo: { $gte: parseInt(experience) } }
    experienceSearch = { experienceFrom: { $gte: parseInt(experience) } };
  }
  if (location != null) {
    locationSearch = { jobLocation: { $eq: location } };
  }
  // console.log(experienceSearch,
  //   locationSearch,
  //   salarySearch,
  //   preferredindustrySearch,
  //   workmodeSearch,
  //   educationSearch,
  //   roleSearch,
  //   companytypeSearch,);
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $or: allSearch,
      },
    },
    {
      $match: {
        $and: experienceAnotherSearch,
      },
    },
    {
      $match: {
        $and: [
          // { adminStatus: { $eq: 'Approved' } },
          experienceSearch,
          locationSearch,
          salarySearch,
          preferredindustrySearch,
          workmodeSearch,
          educationSearch,
          roleSearch,
          companytypeSearch,
        ],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [postedbySearch],
            },
          },
        ],
        as: 'employerregistrations',
      },
    },
    {
      $unwind: '$employerregistrations',
    },
  ]);
  return data;
};

const getByIdEmployerDetailsShownCandidate = async (id, userId) => {
  // const applyjob = await CandidatePostjob.find({userId:userId})
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'employerregistrations',
      },
    },
    {
      $unwind: '$employerregistrations',
    },
    {
      $lookup: {
        from: 'employerpostjobs',
        localField: '_id',
        foreignField: 'postajobId',
        pipeline: [
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
        as: 'employerpostjobs',
      },
    },
    {
      $unwind: {
        path: '$employerpostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'jobId',
        pipeline: [
          {
            $match: {
              $and: [{ userId: { $eq: userId } }],
            },
          },
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidatesavejobs',
        localField: '_id',
        foreignField: 'savejobId',
        pipeline: [
          {
            $match: {
              $and: [{ userId: { $eq: userId } }],
            },
          },
        ],
        as: 'candidatesavejobs',
      },
    },
    {
      $unwind: {
        path: '$candidatesavejobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        companyType: '$employerregistrations.companyType',
        companyName: '$employerregistrations.name',
        logo: '$employerregistrations.logo',
        contactName: '$employerregistrations.contactName',
        aboutCompany: '$employerregistrations.aboutCompany',
        // email: '$employerregistrations.email',
        pincode: '$employerregistrations.pincode',
        lat: '$employerregistrations.lat',
        long: '$employerregistrations.long',
        location: '$employerregistrations.location',
        choosefile: '$employerregistrations.choosefile',
        keySkill: 1,
        jobTittle: 1,
        designation: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        experienceFrom: 1,
        experienceTo: 1,
        interviewType: 1,
        candidateDescription: 1,
        salaryDescription: 1,
        urltoApply: 1,
        workplaceType: 1,
        industry: 1,
        preferedIndustry: 1,
        functionalArea: 1,
        role: 1,
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        createdAt: 1,
        expiredDate: 1,
        date: 1,
        time: 1,
        appliedCount: '$employerpostjobs.count',
        candidatesubmitButton: { $ifNull: ['$candidatepostjobs.status', false] },
        saveButton: { $ifNull: ['$candidatesavejobs.status', false] },
      },
    },
  ]);
  return data;
};

const createCandidatePostjob = async (userId, userBody) => {
  const { jobId } = userBody;
  const data = await CandidatePostjob.create({ ...userBody, ...{ userId: userId } });
  await EmployerPostjob.create({ candidateId: userId, postajobId: jobId });
  return data;
};

const createCandidateSavejob = async (userId, userBody) => {
  const data = await CandidateSaveJob.create({ ...userBody, ...{ userId: userId } });
  return data;
};

const getByIdAppliedJobs = async (userId) => {
  console.log(userId);
  const data = await CandidatePostjob.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'candidatesavejobs',
              localField: '_id',
              foreignField: 'savejobId',
              pipeline: [
                {
                  $match: {
                    $and: [{ userId: { $eq: userId } }],
                  },
                },
              ],
              as: 'candidatesavejobs',
            },
          },
          {
            $unwind: {
              path: '$candidatesavejobs',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: '$employerregistrations',
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: '$employerdetails',
    },
    {
      $project: {
        userId: 1,
        approvedStatus: 1,
        appliedDate: '$employerdetails.createdAt',
        companyType: '$employerdetails.employerregistrations.companyType',
        companyName: '$employerdetails.employerregistrations.name',
        designation: '$employerdetails.jobTittle',
        recruiterName: '$employerdetails.recruiterName',
        contactNumber: '$employerdetails.contactNumber',
        jobDescription: '$employerdetails.jobDescription',
        salaryRangeFrom: '$employerdetails.salaryRangeFrom',
        salaryRangeTo: '$employerdetails.salaryRangeTo',
        experienceFrom: '$employerdetails.experienceFrom',
        experienceTo: '$employerdetails.experienceTo',
        interviewType: '$employerdetails.interviewType',
        candidateDescription: '$employerdetails.candidateDescription',
        workplaceType: '$employerdetails.workplaceType',
        industry: '$employerdetails.industry',
        preferredindustry: '$employerdetails.preferredindustry',
        functionalArea: '$employerdetails.functionalArea',
        role: '$employerdetails.role',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        candidatesavejobs: { $ifNull: ['$employerdetails.candidatesavejobs.status', false] },
      },
    },
  ]);
  return data;
};

const applyJobsView = async (userId) => {
  const data = await CandidatePostjob.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'candidatesavejobs',
              localField: '_id',
              foreignField: 'savejobId',
              pipeline: [
                {
                  $match: {
                    $and: [{ userId: { $eq: userId } }],
                  },
                },
              ],
              as: 'candidatesavejobs',
            },
          },
          {
            $unwind: {
              path: '$candidatesavejobs',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: '$employerregistrations',
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: '$employerdetails',
    },
    {
      $project: {
        userId: 1,
        companyType: '$employerdetails.employerregistrations.companyType',
        companyName: '$employerdetails.employerregistrations.name',
        appliedDate: '$employerdetails.createdAt',
        designation: '$employerdetails.jobTittle',
        recruiterName: '$employerdetails.recruiterName',
        contactNumber: '$employerdetails.contactNumber',
        jobDescription: '$employerdetails.jobDescription',
        salaryRangeFrom: '$employerdetails.salaryRangeFrom',
        salaryRangeTo: '$employerdetails.salaryRangeTo',
        experienceFrom: '$employerdetails.experienceFrom',
        experienceTo: '$employerdetails.experienceTo',
        interviewType: '$employerdetails.interviewType',
        candidateDescription: '$employerdetails.candidateDescription',
        workplaceType: '$employerdetails.workplaceType',
        industry: '$employerdetails.industry',
        preferredindustry: '$employerdetails.preferredindustry',
        functionalArea: '$employerdetails.functionalArea',
        role: '$employerdetails.role',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        jobTittle: '$employerdetails.jobTittle',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        candidatesavejobs: { $ifNull: ['$employerdetails.candidatesavejobs.status', false] },
        approvedStatus: 1,
      },
    },
  ]);
  return data;
};

const deleteByIdSavejOb = async (id) => {
  const data = await CandidateSaveJob.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'savejob not found');
  }
  await data.remove();
  return data;
};

const getByIdSavedJobs = async (userId) => {
  // console.log(userId)
  const data = await CandidateSaveJob.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'savejobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'candidatepostjobs',
              localField: '_id',
              foreignField: 'jobId',
              pipeline: [
                {
                  $match: {
                    $and: [{ userId: { $eq: userId } }],
                  },
                },
              ],
              as: 'candidatepostjobs',
            },
          },
          {
            $unwind: {
              path: '$candidatepostjobs',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: '$employerregistrations',
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: '$employerdetails',
    },
    {
      $project: {
        userId: 1,
        companyType: '$employerdetails.employerregistrations.companyType',
        companyName: '$employerdetails.employerregistrations.name',
        designation: '$employerdetails.designation',
        recruiterName: '$employerdetails.recruiterName',
        contactNumber: '$employerdetails.contactNumber',
        jobDescription: '$employerdetails.jobDescription',
        salaryRangeFrom: '$employerdetails.salaryRangeFrom',
        salaryRangeTo: '$employerdetails.salaryRangeTo',
        experienceFrom: '$employerdetails.experienceFrom',
        experienceTo: '$employerdetails.experienceTo',
        interviewType: '$employerdetails.interviewType',
        candidateDescription: '$employerdetails.candidateDescription',
        workplaceType: '$employerdetails.workplaceType',
        industry: '$employerdetails.industry',
        preferredindustry: '$employerdetails.preferredindustry',
        functionalArea: '$employerdetails.functionalArea',
        role: '$employerdetails.role',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        jobTittle: '$employerdetails.jobTittle',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        candidatepostjobsStatus: { $ifNull: ['$employerdetails.candidatepostjobs.status', false] },
        candidatepostjobs: { $ifNull: ['$employerdetails.candidatepostjobs', false] },
        approvedStatus: '$employerdetails.candidatepostjobs.approvedStatus',
      },
    },
  ]);
  return data;
};
const getByIdSavedJobsView = async (userId) => {
  // console.log(userId)
  const data = await CandidateSaveJob.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'savejobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'candidatepostjobs',
              localField: '_id',
              foreignField: 'jobId',
              pipeline: [
                {
                  $match: {
                    $and: [{ userId: { $eq: userId } }],
                  },
                },
              ],
              as: 'candidatepostjobs',
            },
          },
          {
            $unwind: {
              path: '$candidatepostjobs',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: '$employerregistrations',
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: '$employerdetails',
    },
    {
      $project: {
        userId: 1,
        companyType: '$employerdetails.employerregistrations.companyType',
        companyName: '$employerdetails.employerregistrations.name',
        designation: '$employerdetails.designation',
        recruiterName: '$employerdetails.recruiterName',
        contactNumber: '$employerdetails.contactNumber',
        jobDescription: '$employerdetails.jobDescription',
        salaryRangeFrom: '$employerdetails.salaryRangeFrom',
        salaryRangeTo: '$employerdetails.salaryRangeTo',
        experienceFrom: '$employerdetails.experienceFrom',
        experienceTo: '$employerdetails.experienceTo',
        interviewType: '$employerdetails.interviewType',
        candidateDescription: '$employerdetails.candidateDescription',
        workplaceType: '$employerdetails.workplaceType',
        industry: '$employerdetails.industry',
        preferredindustry: '$employerdetails.preferredindustry',
        functionalArea: '$employerdetails.functionalArea',
        role: '$employerdetails.role',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        jobTittle: '$employerdetails.jobTittle',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        candidatepostjobs: { $ifNull: ['$employerdetails.candidatepostjobs', false] },
        approvedStatus: '$employerdetails.candidatepostjobs.approvedStatus',
      },
    },
  ]);
  return data;
};

const createdSearchhistory = async (userId, body) => {
  console.log(userId);
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HH:mm:ss');
  let values = { ...body, ...{ userId: userId, date:date, time:creat1} };
  let data = await CandidateSearchjobCandidate.create(values);
  return data;
};

const createdSearchhistoryData = async (userId) => {
  let data = await CandidateSearchjobCandidate.aggregate([  
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $limit: 10,
    },
]);
  return data;
};

const autojobSearch = async (userId) => {
  // console.log(userId)
  //  { keySkill: {$elemMatch:{$in:search}}}
  const data = await CandidateSearchjobCandidate.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        let: { keySkill: '$keyskill' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [{ $in: ['$keySkill', '$$keySkill'] }],
              },
            },
          },
        ],
        as: 'employerdetails',
      },
    },
    // {
    //   $lookup: {
    //     from: 'shops',
    //     let: { street: '$_id' },

    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $eq: ['$$street', '$Strid']
    //           },
    //         },
    //       },
    //     ],
    //     as: 'shopData',
    //   },
    // },
    {
      $project: {
        keySkill: '$employerdetails',
      },
    },
  ]);
  return data;
};

const CandidateRegistrations = async (page) => {
  const data = await CandidateRegistration.find()
    .limit(10)
    .skip(10 * page);
  let count = await CandidateRegistration.find();

  return { data: data, count: count.length };
};

const updateByIdCandidateRegistration = async (id, updateBody) => {
  const user = await CandidateRegistration.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'candidateRegistration not found');
  }
  const data = await CandidateRegistration.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  await data.save();
  return data;
};

const createSetSearchEmployerData = async (userId, userBody) => {
  console.log(userId);
  let values = { ...userBody, ...{ userId: userId } };
  let data = await candidataSearchEmployerSet.create(values);
  return data;
};

const updateByIdcandidataSearchEmployerSet = async (id, updateBody) => {
  const user = await candidataSearchEmployerSet.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'candidataSearchEmployerSet not found');
  }
  const data = await candidataSearchEmployerSet.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  await data.save();
  return data;
};

const SearchByIdcandidataSearchEmployerSet = async (userId) => {
  // const user = await KeySkill.aggregate([

  // ])
  // let products1 = []
  const user = await KeySkill.findOne({ userId: userId });
  let search = user.keyskillSet;
  let locetion = user.locationSet;
  let expYear = user.experienceYearSet;
  // let expMonth = user.experienceMonthSet
  // console.log(search,expYear, expMonth)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'candidateDetails not found');
  }
  if(search.length == 0){
    throw new ApiError(httpStatus.NOT_FOUND, 'job alert data not found');
  }
  // console.log(search,locetion)
  //  user.forEach(async (e) => {
  //   // const product = await Product.findById(e)
  //   products1.push(e);
  // });
  // const data = await EmployerDetails.find({ keySkill: {$elemMatch:{$in:user.keyskillSet}}, location:user.locationSet})
  //    user.forEach(async (e) => {
  //   // const product = await Product.findById(e)
  //   products1.push(e);
  // });
  //  experienceSearch = { experienceFrom: { $lte: parseInt(expYear) },experienceTo: { $gte: parseInt(expYear) } }

  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [
          { jobLocation: { $eq: locetion } },
          { keySkill: { $elemMatch: { $in: search } } },
          { experienceFrom: { $eq: (expYear) } },
        ],
      },
    },
    // {
    //   $match: {
    //     $and: [
    //       { jobortemplate: { $eq: "job" } },
    //     ],
    //   },
    // },
    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'jobId',
        pipeline:[
          {
            $match:{ userId: { $eq: userId } }
          }
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'employerregistrations',
      },
    },
    {
      $unwind: '$employerregistrations',
    },
    {
      $project: {
        keySkill: 1,
        date: 1,
        adminStatus: 1,
        active: 1,
        jobTittle: 1,
        designation: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        experienceFrom: 1,
        experienceTo: 1,
        interviewType: 1,
        candidateDescription: 1,
        workplaceType: 1,
        industry: 1,
        interviewerName: 1,
        preferredindustry: 1,
        functionalArea: 1,
        role: 1,
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        interviewDate: 1,
        interviewTime: 1,
        location: 1,
        interviewerName: 1,
        interviewerContactNumber: 1,
        validity: 1,
        educationalQualification: 1,
        userId: 1,
        expiredDate: 1,
        createdAt: 1,
        companyName: '$employerregistrations.companyName',
        email: '$employerregistrations.email',
        mobileNumber: '$employerregistrations.mobileNumber',
        companyType: '$employerregistrations.companyType',
        name: '$employerregistrations.name',
        regitserStatus: '$employerregistrations.adminStatus',
        appliedStatus:'$candidatepostjobs.approvedStatus'
      },
    },
  ]);
  return data;
};

const getByIdEmployerDetails = async (id) => {
  const data = await EmployerDetails.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  return data;
};

const candidateSearch_front_page = async (id, body) => {
  console.log(id)
  const check = await CandidateRegistration.findById(id);
  if (!check) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HH:mm:ss');
  let values = { ...body, ...{ userId: id, date:date, time:creat1 } };
  // let values = {...body, ...{userId:userId}}
  let {
    search,
    experience,
    experienceAnotherfrom,
    experienceAnotherto,
    location,
    preferredindustry,
    salary,
    workmode,
    education,
    salaryfilter,
    role,
    freshness,
    locationfilter,
    companytype,
    postedby,
  } = body;
  if (
    search.length != 0 ||
    experience != null ||
    experienceAnotherfrom != null ||
    experienceAnotherto != null ||
    location != null ||
    preferredindustry != null ||
    salary != null ||
    workmode != null ||
    education != null ||
    salaryfilter != null ||
    role != null ||
    freshness != null ||
    locationfilter != null ||
    companytype != null ||
    postedby != null
  ) {
    await CandidateRecentSearchjobCandidate.create(values);
  }
  //  await CandidateSearchjobCandidate.create(values);

  //  search = ["fbhfghfh","software engineer"]
  // console.log(body)
  let experienceSearch = { active: true };
  let experienceAnotherSearch = [{ active: true }];
  let locationSearch = { active: true };
  let allSearch = [{ active: true }];
  let salarySearch = { active: true };
  let preferredindustrySearch = { active: true };
  let workmodeSearch = { active: true };
  let educationSearch = { active: true };
  let salaryfilterSearch = { active: true };
  let roleSearch = { active: true };
  let freshnessSearch = { active: true };
  let locationfilterSearch = { active: true };
  let companytypeSearch = { active: true };
  let postedbySearch = { active: true };
  if (postedby != null) {
    postedbySearch = { companyType: { $in: postedby } };
  }
  if (experienceAnotherfrom != null && experienceAnotherto != null) {
    experienceAnotherSearch = [
      { experienceFrom: { $gte: parseInt(experienceAnotherfrom) } },
      { experienceFrom: { $lte: parseInt(experienceAnotherto) } },
    ];
  }
  if (workmode != null) {
    workmodeSearch = { workplaceType: { $in: workmode } };
  }
  if (companytype != null) {
    companytypeSearch = { industry: { $in: companytype } };
  }
  if (role != null) {
    roleSearch = { role: { $in: role } };
  }
  if (education != null) {
    educationSearch = { educationalQualification: { $in: education } };
  }
  if (preferredindustry != null) {
    preferredindustrySearch = { preferedIndustry: { $eq: preferredindustry } };
  }
  if (salary != null) {
    salarySearch = { salaryRangeFrom: { $lte: parseInt(salary) }, salaryRangeTo: { $gte: parseInt(salary) } };
  }
  if (search.length != 0) {
    // search = search.split(',');
    allSearch = [
      { designation: { $in: search } },
      { keySkill: { $elemMatch: { $in: search } } },
      { jobTittle: { $in: search } },
    ];
  }

  if (experience != null) {
    // experienceSearch = { experienceFrom: { $lte: parseInt(experience) },experienceTo: { $gte: parseInt(experience) } }
    experienceSearch = { experienceFrom: { $gte: parseInt(experience) } };
  }
  if (location != null) {
    locationSearch = { jobLocation: { $regex: location, $options: 'i' }  };
  }
  // console.log(experienceSearch,
  //   locationSearch,
  //   salarySearch,
  //   preferredindustrySearch,
  //   workmodeSearch,
  //   educationSearch,
  //   roleSearch,
  //   companytypeSearch,);
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $or: allSearch,
      },
    },
    {
      $match: {
        $and: experienceAnotherSearch,
      },
    },
    {
      $match: {
        $and: [
          //  { jobortemplate: { $eq: 'job' } },
          experienceSearch,
          locationSearch,
          salarySearch,
          preferredindustrySearch,
          workmodeSearch,
          educationSearch,
          roleSearch,
          companytypeSearch,
        ],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: [postedbySearch],
            },
          },
        ],
        as: 'employerregistrations',
      },
    },
    {
      $unwind: '$employerregistrations',
    },
    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'jobId',
        pipeline:[
          {
            $match:{ userId: { $eq: id } }
          }
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project:{
        keySkill:1,
        jobTittle:1,
        recruiterName:1,
        contactNumber:1,
        jobDescription:1,
        educationalQualification:1,
        salaryRangeFrom:1,
        salaryRangeTo:1,
        experienceFrom:1,
        experienceTo:1,
        interviewType:1,
        candidateDescription:1,
        salaryDescription:1,
        urltoApply:1,
        workplaceType:1,
        industry:1,
        preferedIndustry:1,
        jobLocation:1,
        employmentType:1,
        openings:1,
        date:1,
        expiredDate:1,
        date:1,
        time:1,
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrationscontactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        appliedStatus:'$candidatepostjobs.approvedStatus',
      }
    }
  ]);
  return data;
};

const recentSearch = async (userId) => {
  const data = await CandidateRecentSearchjobCandidate.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $limit: 10,
    },
  ]);
  return data;
};


const recentSearch_byId = async (id) => {
  const data = await CandidateRecentSearchjobCandidate.findById(id)
  return data;
};
// candidate education details
const educationDetails = async (userId, body) => {
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  const data = await EducationDeatils.create({ ...body, ...{ userId: userId, date:date, time:creat1} });
  return data;
};

// languages

const languages = async () => {
  let data = await Languages.find();
  return data;
};

// candidate details

const candidate_detials = async (id, jobid) => {
  const data = await CandidateRegistration.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'userId',
        pipeline:[
          {
            $match: {
              $and: [{ jobId: { $eq: jobid } }],
            },
          },
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidatedetails',
        localField: '_id',
        foreignField: 'userId',
        pipeline:[
          {
            $lookup: {
              from: 'qualifications',
              localField: 'sslcQualification',
              foreignField: '_id',
              as: 'sslcqualifications',
            },
          },
          {
            $unwind: {
              path: '$sslcqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'hsQualification',
              foreignField: '_id',
              as: 'hscqualifications',
            },
          },
          {
            $unwind: {
              path: '$hscqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'drQualification',
              foreignField: '_id',
              as: 'qualifications',
            },
          },
          {
            $unwind: {
              path: '$qualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'drcourses',
              localField: 'drCourse',
              foreignField: '_id',
              as: 'drcourses',
            },
          },
          {
            $unwind: {
              path: '$drcourses',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'drspecializations',
              localField: 'drSpecialization',
              foreignField: '_id',
              as: 'drspecializations',
            },
          },
          {
            $unwind: {
              path: '$drspecializations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'pgQualification',
              foreignField: '_id',
              as: 'pgqualifications',
            },
          },
          {
            $unwind: {
              path: '$pgqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'pgcourses',
              localField: 'pgCourse',
              foreignField: '_id',
              as: 'pgcourses',
            },
          },
          {
            $unwind: {
              path: '$pgcourses',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'pgspecializations',
              localField: 'pgSpecialization',
              foreignField: '_id',
              as: 'pgspecializations',
            },
          },
          {
            $unwind: {
              path: '$pgspecializations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              localField: 'ugQualification',
              foreignField: '_id',
              as: 'ugqualifications',
            },
          },
          {
            $unwind: {
              path: '$ugqualifications',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'ugcourses',
              localField: 'ugCourse',
              foreignField: '_id',
              as: 'ugcourses',
            },
          },
          {
            $unwind: {
              path: '$ugcourses',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'specializations',
              localField: 'ugSpecialization',
              foreignField: '_id',
              as: 'specializations',
            },
          },
          {
            $unwind: {
              path: '$specializations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'industries',
              localField: 'industry',
              foreignField: '_id',
              as: 'industries',
            },
          },
          {
            $unwind: {
              path: '$industries',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'department',
              foreignField: '_id',
              as: 'departments',
            },
          },
          {
            $unwind: {
              path: '$departments',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'rolecategories',
              localField: 'roleCategory',
              foreignField: '_id',
              as: 'rolecategories',
            },
          },
          {
            $unwind: {
              path: '$rolecategories',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'jobroles',
              localField: 'role',
              foreignField: '_id',
              as: 'jobroles',
            },
          },
          {
            $unwind: {
              path: '$jobroles',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'candidatedetails',
      },
    },
    {
      $unwind: {
        path: '$candidatedetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        resume: 1,
        email: 1,
        workStatus: 1,
        mobileNumber: 1,
        name: 1,
        lat: 1,
        long: 1,
        resume: 1,
        createdAt: 1,
        updatedAt: 1,
        // candidateDetails: '$candidatedetails',
        keyskill:'$candidatedetails.keyskill',
        currentSkill:'$candidatedetails.currentSkill',
        preferredSkill:'$candidatedetails.preferredSkill',
        active:'$candidatedetails.active',
        image:'$candidatedetails.image',
        dob:'$candidatedetails.dob',
        experienceYear:'$candidatedetails.experienceYear',
        experienceMonth:'$candidatedetails.experienceMonth',
        expectedctc:'$candidatedetails.expectedctc',
        currentctc:'$candidatedetails.currentctc',
        locationCurrent:'$candidatedetails.locationCurrent',
        locationNative:'$candidatedetails.locationNative',
        noticeperiod:'$candidatedetails.noticeperiod',
        gender:'$candidatedetails.gender',
        maritalStatus:'$candidatedetails.maritalStatus',
        ugMarks:'$candidatedetails.ugMarks',
        ugGradingSystem:'$candidatedetails.ugGradingSystem',
        ugCourseType:'$candidatedetails.ugCourseType',
        ugCourseDurationTo:'$candidatedetails.ugCourseDurationTo',
        ugCourseDurationFrom:'$candidatedetails.ugCourseDurationFrom',
        relocate:'$candidatedetails.relocate',
        languages:'$candidatedetails.languages',
        ugUniversity:'$candidatedetails.ugUniversity',
        drQualification:'$candidatedetails.qualifications.qualification',
        drcourses:'$candidatedetails.drcourses.Course',
        drSpecialization:'$candidatedetails.drspecializations.Specialization',
        pgQualification:'$candidatedetails.pgqualifications.qualification',
        pgCourse:'$candidatedetails.pgcourses.Course',
        pgSpecialization:'$candidatedetails.pgspecializations.Specialization',
        ugQualification:'$candidatedetails.ugqualifications.qualification',
        ugCourse:'$candidatedetails.ugcourses.Course',
        ugSpecialization:'$candidatedetails.specializations.Specialization',
        role:'$candidatedetails.jobroles.Job_role',
        roleCategory:'$candidatedetails.rolecategories.Role_Category',
        department:'$candidatedetails.departments.Department',
        industry:'$candidatedetails.industries.Industry',
        sslctotalmarks:'$candidatedetails.sslctotalmarks',
        sslcPassedYear:'$candidatedetails.sslcPassedYear',
        sslcMedium:'$candidatedetails.sslcMedium',
        sslcBoard:'$candidatedetails.sslcBoard',
        sslcQualification:"$candidatedetails.sslcqualifications.qualification",
        pgUniversity:'$candidatedetails.pgUniversity',
        pgMarks:'$candidatedetails.pgUniversity',
        pgGradingSystem:'$candidatedetails.pgUniversity',
        pgCourseType:'$candidatedetails.pgUniversity',
        pgCourseDurationTo:'$candidatedetails.pgUniversity',
        pgCourseDurationFrom:'$candidatedetails.pgUniversity',
        hstotalmarks:'$candidatedetails.hstotalmarks',
        hsPassedYear:'$candidatedetails.hsPassedYear',
        hsMedium:'$candidatedetails.hsMedium',
        hsBoard:'$candidatedetails.hsBoard',
        drMarks:'$candidatedetails.drMarks',
        drGradingSystem:'$candidatedetails.drGradingSystem',
        drCourseType:'$candidatedetails.drCourseType',
        drCourseDurationTo:'$candidatedetails.drCourseDurationTo',
        drCourseDurationFrom:'$candidatedetails.drCourseDurationFrom',
        hsQualification:'$candidatedetails.hscqualifications.qualification',
        keyskillSet:'$candidatedetails.keyskillSet',
        drUniversity:'$candidatedetails.drUniversity',
        experienceMonthSet:'$candidatedetails.experienceMonthSet',
        locationSet:'$candidatedetails.locationSet',
        experienceYearSet:'$candidatedetails.experienceYearSet',
        designationSet:'$candidatedetails.designationSet',
        currentIndustry:'$candidatedetails.currentIndustry',
        currentDepartment:'$candidatedetails.currentDepartment',
        role_Category:'$candidatedetails.role_Category',
        salaryFrom:'$candidatedetails.salaryFrom',
        SalaryTo:'$candidatedetails.SalaryTo',
        appliedStatus:'$candidatepostjobs.approvedStatus',
        postjobId:'$candidatepostjobs._id',
      },
    },
  ]);
  return data;
};

const createdSearchhistoryData_byId = async (id) => {
  let data = await CandidateSearchjobCandidate.findById(id);
  return data;
};
module.exports = {
  createkeySkill,
  getByIdUser,
  deleteById,
  updateById,
  candidateSearch,
  getByIdEmployerDetailsShownCandidate,
  createCandidatePostjob,
  createCandidateSavejob,
  getByIdAppliedJobs,
  deleteByIdSavejOb,
  getByIdSavedJobs,
  applyJobsView,
  getByIdSavedJobsView,
  autojobSearch,
  createdSearchhistory,
  CandidateRegistrations,
  updateByIdCandidateRegistration,
  createSetSearchEmployerData,
  updateByIdcandidataSearchEmployerSet,
  SearchByIdcandidataSearchEmployerSet,
  getByIdEmployerDetails,
  candidateSearch_front_page,
  recentSearch,
  updateByIdImage,
  educationDetails,
  languages,
  createdSearchhistoryData,
  recentSearch_byId,
  candidate_detials,
  updateEducation,
  createdSearchhistoryData_byId,
  
  // createSearchCandidate,
};
