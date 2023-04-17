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
  let totalCTC = 0;
  if (userBody.experienceYear != 0) {
    let currentctc_th = userBody.currentctc_th;
    let currentctc = userBody.currentctc * 100000;
    totalCTC = parseInt(currentctc_th) + parseInt(currentctc);
  }
  // let expCTC = userBody.expectedctc.split('-');
  let expCTC_strat = 0;
  let expCTC_end = 0;
  expCTC_strat = userBody.expectedctc * 100000;
  // if (expCTC[1] != 'more') {
  //   expCTC_end = expCTC[1] * 100000;
  // }

  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  let values = {
    ...userBody,
    ...{
      userId: userId,
      date: date,
      time: creat1,
      totalCTC: totalCTC,
      expCTC_strat: expCTC_strat,
      // expCTC_end: expCTC_end,
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
        pipeline: [
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
        location: 1,
        // candidateDetails: '$candidatedetails',
        keyskill: '$candidatedetails.keyskill',
        currentSkill: '$candidatedetails.currentSkill',
        preferredSkill: '$candidatedetails.preferredSkill',
        active: '$candidatedetails.active',
        image: '$candidatedetails.image',
        dob: '$candidatedetails.dob',
        experienceYear: '$candidatedetails.experienceYear',
        experienceMonth: '$candidatedetails.experienceMonth',
        expectedctc: '$candidatedetails.expectedctc',
        currentctc: '$candidatedetails.currentctc',
        locationCurrent: '$candidatedetails.locationCurrent',
        locationNative: '$candidatedetails.locationNative',
        noticeperiod: '$candidatedetails.noticeperiod',
        preferredLocation: '$candidatedetails.preferredLocation',
        gender: '$candidatedetails.gender',
        maritalStatus: '$candidatedetails.maritalStatus',
        ugMarks: '$candidatedetails.ugMarks',
        ugGradingSystem: '$candidatedetails.ugGradingSystem',
        ugCourseType: '$candidatedetails.ugCourseType',
        ugCourseDurationTo: '$candidatedetails.ugCourseDurationTo',
        ugCourseDurationFrom: '$candidatedetails.ugCourseDurationFrom',
        relocate: '$candidatedetails.relocate',
        languages: '$candidatedetails.languages',
        ugUniversity: '$candidatedetails.ugUniversity',
        drQualification: '$candidatedetails.qualifications.qualification',
        drcourses: '$candidatedetails.drcourses.Course',
        drSpecialization: '$candidatedetails.drspecializations.Specialization',
        pgQualification: '$candidatedetails.pgqualifications.qualification',
        pgCourse: '$candidatedetails.pgcourses.Course',
        pgSpecialization: '$candidatedetails.pgspecializations.Specialization',
        ugQualification: '$candidatedetails.ugqualifications.qualification',
        ugCourse: '$candidatedetails.ugcourses.Course',
        ugSpecialization: '$candidatedetails.specializations.Specialization',
        role: '$candidatedetails.jobroles.Job_role',
        roleCategory: '$candidatedetails.rolecategories.Role_Category',
        department: '$candidatedetails.departments.Department',
        industry: '$candidatedetails.industries.Industry',
        sslctotalmarks: '$candidatedetails.sslctotalmarks',
        sslcPassedYear: '$candidatedetails.sslcPassedYear',
        sslcMedium: '$candidatedetails.sslcMedium',
        sslcBoard: '$candidatedetails.sslcBoard',
        sslcQualification: '$candidatedetails.sslcqualifications.qualification',
        pgUniversity: '$candidatedetails.pgUniversity',
        pgMarks: '$candidatedetails.pgMarks',
        pgGradingSystem: '$candidatedetails.pgGradingSystem',
        pgCourseType: '$candidatedetails.pgCourseType',
        pgCourseDurationTo: '$candidatedetails.pgCourseDurationTo',
        pgCourseDurationFrom: '$candidatedetails.pgCourseDurationFrom',
        hstotalmarks: '$candidatedetails.hstotalmarks',
        hsPassedYear: '$candidatedetails.hsPassedYear',
        hsMedium: '$candidatedetails.hsMedium',
        hsBoard: '$candidatedetails.hsBoard',
        drMarks: '$candidatedetails.drMarks',
        drGradingSystem: '$candidatedetails.drGradingSystem',
        drCourseType: '$candidatedetails.drCourseType',
        drCourseDurationTo: '$candidatedetails.drCourseDurationTo',
        drCourseDurationFrom: '$candidatedetails.drCourseDurationFrom',
        hsQualification: '$candidatedetails.hscqualifications.qualification',
        keyskillSet: '$candidatedetails.keyskillSet',
        drUniversity: '$candidatedetails.drUniversity',
        experienceMonthSet: '$candidatedetails.experienceMonthSet',
        locationSet: '$candidatedetails.locationSet',
        experienceYearSet: '$candidatedetails.experienceYearSet',
        designationSet: '$candidatedetails.designationSet',
        currentIndustry: '$candidatedetails.currentIndustry',
        currentDepartment: '$candidatedetails.currentDepartment',
        role_Category: '$candidatedetails.role_Category',
        salaryFrom: '$candidatedetails.salaryFrom',
        SalaryTo: '$candidatedetails.SalaryTo',
        candidateDetails: '$candidatedetails',
        currentctc_th: '$candidatedetails.currentctc_th',
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
  let data;
  let totalCTC = 0;
  let currentctc_th;
  console.log(updateBody.currentctc_th, updateBody.currentctc);
  if (updateBody.experienceYear != 0) {
    currentctc_th = updateBody.currentctc_th;
    if (!updateBody.currentctc_th) {
      currentctc_th = 0;
    }
    let currentctc = updateBody.currentctc * 100000;
    totalCTC = parseInt(currentctc_th) + parseInt(currentctc);
  }
  // expCTC = updateBody.expectedctc.split('-');
  expCTC_strat = 0;
  // expCTC_end = 0;
  if (updateBody.expectedctc) {
    expCTC_strat = updateBody.expectedctc * 100000;
    // if (expCTC[1] != 'more') {
    //   expCTC_end = expCTC[1] * 100000;
    // }
  }
  console.log(totalCTC);
  data = await KeySkill.findOneAndUpdate(
    { userId: userId },
    { ...updateBody, ...{ expCTC_strat: expCTC_strat, totalCTC: totalCTC } },
    { new: true }
  );
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

const edit_details = async (id, updateBody) => {
  const user = await KeySkill.findOne({ userId: id });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Keyskill not found');
  }
  const data = await KeySkill.findOneAndUpdate({ userId: id }, updateBody, { new: true });
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
    Location,
    preferredIndustry,
    Salary,
    workmode,
    department,
    education,
    // salaryfilter,
    role,
    freshness,
    // locationfilter,
    companytype,
    postedby,
    range,
    page,
  } = body;
  // if (
  //   search.length != 0 ||
  //   experience != null ||
  //   experienceAnotherfrom != null ||
  //   experienceAnotherto != null ||
  //   Location.length != 0 ||
  //   preferredIndustry.length != 0 ||
  //   Salary.length != 0 ||
  //   workmode.length != 0 ||
  //   department.length != 0 ||
  //   education.length != 0 ||
  //   // salaryfilter != null ||
  //   role.length != 0 ||
  //   freshness.length != 0 ||
  //   // locationfilter != null ||
  //   companytype.length != 0 ||
  //   postedby.length != 0
  // ) {
  //   await CandidateRecentSearchjobCandidate.create(values);
  // }
  //  await CandidateSearchjobCandidate.create(values);

  //  search = ["fbhfghfh","software engineer"]
  // console.log(body)
  let experienceSearch = { active: true };
  let experienceAnotherSearch = [{ active: true }];
  let locationSearch = { active: true };
  let allSearch = [{ active: true }];
  let salarySearch = { active: true };
  let preferredindustrySearch = [{ active: true }];
  let workmodeSearch = { active: true };
  let educationSearch = { active: true };
  let departmentSearch = { active: true };
  // let salaryfilterSearch = { active: true };
  let roleSearch = { active: true };
  let freshnessSearch = { active: true };
  // let locationfilterSearch = { active: true };
  let companytypeSearch = { active: true };
  // let postedbySearch = { active: true };

  if (companytype) {
    if (companytype.length != 0) {
      companytypeSearch = { companyType: { $in: companytype } };
    }
  }

  if (experienceAnotherfrom != null && experienceAnotherto != null) {
    experienceAnotherSearch = [
      { experienceFrom: { $eq: parseInt(experienceAnotherfrom) } },
      { experienceTo: { $lte: parseInt(experienceAnotherto) } },
    ];
  }

  if (workmode.length != 0) {
    workmodeSearch = { workplaceType: { $in: workmode } };
  }

  if (department.length != 0) {
    departmentSearch = { department: { $in: department } };
  }

  if (role.length != 0) {
    roleSearch = { role: { $in: role } };
  }

  if (preferredIndustry.length != 0) {
    preferredindustrySearch = [{ preferedIndustry: { $elemMatch: { $in: preferredIndustry } } }];
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
    experienceSearch = { experienceFrom: { $eq: parseInt(experience) } };
  }

  if (Location.length != 0) {
    // locationSearch = { jobLocation: { $in: Location } };
    let stringloc = Location.toString();
    locationSearch = { jobLocation: { $regex: stringloc, $options: 'i' } };
  }

  if (freshness.length != 0) {
    let one = [];
    for (let i = 0; i <= freshness.length; i++) {
      if (freshness[i] == '1') {
        one.push(moment().subtract(1, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '3') {
        one.push(moment().subtract(3, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '7') {
        one.push(moment().subtract(7, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '15') {
        one.push(moment().subtract(15, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '30') {
        one.push(moment().subtract(30, 'days').format('YYYY-MM-DD'));
      }
    }
    freshnessSearch = { date: { $in: one } };
  }

  if (Salary.length != 0) {
    let salary_macth = [];
    Salary.forEach((a) => {
      let value = a.split('-');
      let start = value[0] * 100000;

      let end = 0;
      if (value[1] != 'more') {
        end = value[1] * 100000;
      }
      if (end != 0) {
        salary_macth.push({ $and: [{ salaryRangeFrom: { $gte: start } }, { salaryRangeTo: { $lte: end } }] });
      } else {
        salary_macth.push({ $and: [{ salaryRangeFrom: { $gte: start } }] });
      }
    });
    console.log(salary_macth);
    salarySearch = { $or: salary_macth };
    // salarySearch = { salaryRangeFrom: { $lte: parseInt(salary1) }, salaryRangeTo: { $gte: parseInt(salary2) } };
  }

  if (education.length != 0) {
    educationSearch = { course: { $elemMatch: { $in: education } } };
  }
  //  console.log(experienceSearch,
  //   locationSearch,
  //   salarySearch,
  //   preferredindustrySearch,
  //   workmodeSearch,
  //   educationSearch,
  //   roleSearch,
  //   experienceAnotherSearch,
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
        $and: preferredindustrySearch,
      },
    },
    {
      $match: {
        $and: [
          //  { jobortemplate: { $eq: 'job' } },
          experienceSearch,
          locationSearch,
          salarySearch,
          workmodeSearch,
          educationSearch,
          roleSearch,
          departmentSearch,
          freshnessSearch,
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
              $and: [companytypeSearch],
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
    // {
    //   $lookup: {
    //     from: 'candidatepostjobs',
    //     localField: '_id',
    //     foreignField: 'jobId',
    //     pipeline: [
    //       {
    //         $match: { userId: { $eq: id } },
    //       },
    //     ],
    //     as: 'candidatepostjobs',
    //   },
    // },
    // {
    //   $unwind: {
    //     path: '$candidatepostjobs',
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    {
      $project: {
        keySkill: 1,
        jobTittle: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        educationalQualification: 1,
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
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        date: 1,
        expiredDate: 1,
        date: 1,
        time: 1,
        role: '$jobroles.Job_role',
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrationscontactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        // appliedStatus: '$candidatepostjobs.approvedStatus',
      },
    },
    { $skip: range * page },
    { $limit: range },
  ]);

  const count = await EmployerDetails.aggregate([
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
        $and: preferredindustrySearch,
      },
    },
    {
      $match: {
        $and: [
          //  { jobortemplate: { $eq: 'job' } },
          experienceSearch,
          locationSearch,
          salarySearch,
          workmodeSearch,
          educationSearch,
          roleSearch,
          departmentSearch,
          freshnessSearch,
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
              $and: [companytypeSearch],
            },
          },
        ],
        as: 'employerregistrations',
      },
    },
    {
      $unwind: '$employerregistrations',
    },
    // {
    //   $lookup: {
    //     from: 'candidatepostjobs',
    //     localField: '_id',
    //     foreignField: 'jobId',
    //     pipeline: [
    //       {
    //         $match: { userId: { $eq: id } },
    //       },
    //     ],
    //     as: 'candidatepostjobs',
    //   },
    // },
    // {
    //   $unwind: {
    //     path: '$candidatepostjobs',
    //     preserveNullAndEmptyArrays: true,
    //   },
    // },
    {
      $project: {
        keySkill: 1,
        jobTittle: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        educationalQualification: 1,
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
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        date: 1,
        expiredDate: 1,
        date: 1,
        time: 1,
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrationscontactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        // appliedStatus: '$candidatepostjobs.approvedStatus',
      },
    },
  ]);

  return { data: data, count: count.length };
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
    {
      $lookup: {
        from: 'qualifications',
        let: { userId: '$qualification' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $group: { _id: { qualification: '$qualification' } },
          },
          {
            $project: {
              _id: null,
              qualification: '$_id.qualification',
            },
          },
        ],
        as: 'qualifications',
      },
    },
    {
      $lookup: {
        from: 'allcourses',
        let: { userId: '$course' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $group: { _id: { Course: '$Course' } },
          },
          {
            $project: {
              _id: null,
              Course: '$_id.Course',
            },
          },
        ],
        as: 'allcourses',
      },
    },
    {
      $lookup: {
        from: 'allspecializations',
        let: { userId: '$specialization' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $group: { _id: { Specialization: '$Specialization' } },
          },
          {
            $project: {
              _id: null,
              Specialization: '$_id.Specialization',
            },
          },
        ],
        as: 'allspecializations',
      },
    },
    {
      $lookup: {
        from: 'industries',
        let: { userId: '$preferedIndustry' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
              },
            },
          },
          {
            $group: { _id: { Industry: '$Industry' } },
          },
          {
            $project: {
              _id: null,
              Industry: '$_id.Industry',
            },
          },
        ],
        as: 'industries',
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
        // role: 1,
        role: '$jobroles.Job_role',
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        createdAt: 1,
        expiredDate: 1,
        date: 1,
        time: 1,
        recruiterName: 1,
        recruiterEmail: 1,
        recruiterNumber: 1,
        interviewstartDate: 1,
        interviewendDate: 1,
        department: '$departments.Department',
        startTime: 1,
        endTime: 1,
        qualifications: '$qualifications',
        allcourses: '$allcourses',
        preferredIndustrys: '$industries',
        allspecializations: '$allspecializations',
        appliedCount: '$employerpostjobs.count',
        appliedStatus: '$candidatepostjobs.approvedStatus',
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
  const { savejobId } = userBody;
  let getSavedJob = await CandidateSaveJob.find({ savejobId: savejobId });
  let len = getSavedJob.length;
  let data;
  if (len > 0) {
    await CandidateSaveJob.deleteMany({ savejobId: savejobId });
    data = { message: 'Deleted' };
  } else {
    data = await CandidateSaveJob.create({ ...userBody, ...{ userId: userId } });
  }
  return data;
};

const getByIdAppliedJobs = async (userId, status) => {
  console.log(userId);
  let search;
  if (status == 'null') {
    search = { active: { $eq: true } };
  } else {
    search = { approvedStatus: { $eq: status } };
  }
  const data = await CandidatePostjob.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }, search],
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
        // role: '$employerdetails.role',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        jodId: '$employerdetails._id',
        role: '$employerdetails.roleCategory',
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
        role: '$employerdetails.roleCategory',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        jobTittle: '$employerdetails.jobTittle',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        jobId: '$employerdetails._id',
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
        // role: '$employerdetails.role',
        jobLocation: '$employerdetails.jobLocation',
        employmentType: '$employerdetails.employmentType',
        openings: '$employerdetails.openings',
        createdAt: '$employerdetails.createdAt',
        updatedAt: '$employerdetails.updatedAt',
        jobTittle: '$employerdetails.jobTittle',
        date: '$employerdetails.date',
        time: '$employerdetails.time',
        role: '$employerdetails.jobroles.Job_role',
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
  let assvalue = {};
  if (body.exp) {
    assvalue = { ...assvalue, ...{ exp: body.exp } };
  }
  if (body.search && body.search.length > 0) {
    assvalue = { ...assvalue, ...{ search: body.search } };
  }
  if (body.experience) {
    assvalue = { ...assvalue, ...{ experience: body.experience } };
  }
  if (body.experienceAnotherfrom) {
    assvalue = { ...assvalue, ...{ experience: body.experienceAnotherfrom } };
  }
  if (body.Location) {
    assvalue = { ...assvalue, ...{ Location: body.Location } };
  }
  if (body.advsearch && body.advsearch.length > 0) {
    assvalue = { ...assvalue, ...{ search: body.advsearch } };
  }
  if (body.keySkillArr && body.keySkillArr.length > 0) {
    assvalue = { ...assvalue, ...{ search: body.keySkillArr } };
  }
  if (body.preferredindustry) {
    assvalue = { ...assvalue, ...{ preferredindustry: body.preferredindustry } };
  }
  if (body.salary) {
    assvalue = { ...assvalue, ...{ salary: body.salary } };
  }
  let values = { ...assvalue, ...{ userId: userId, date: date, time: creat1 } };
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
  let salaryFrom = user.salaryFrom;
  let SalaryTo = user.SalaryTo;
  let currentIndustry = user.currentIndustry;
  let currentDepartment = user.currentDepartment;
  let role_Category = user.role_Category;
  let designationSet = user.designationSet;
  let locationSet = user.locationSet;
  // let expMonth = user.experienceMonthSet
  // console.log(search,expYear, expMonth)
  let expCTC = salaryFrom.split('-');
  let expCTC_strat = 0;
  let expCTC_end = 0;
  if (expCTC.length != 0) {
    expCTC_strat = expCTC[0] * 100000;
    if (expCTC[1] != 'more') {
      expCTC_end = expCTC[1] * 100000;
    }
  }
  let start;
  if (expCTC_end != 0) {
    start = { salaryRangeFrom: { $gte: expCTC_strat }, salaryRangeTo: { $lte: expCTC_end } };
  } else {
    start = { salaryRangeFrom: { $gte: expCTC_strat } };
  }
  console.log(start);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'candidateDetails not found');
  }
  if (search.length == 0) {
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
          { experienceFrom: { $eq: expYear } },
          { industry: { $eq: currentIndustry } },
          { department: { $eq: currentDepartment } },
          { role: { $eq: designationSet } },
          { jobLocation: { $eq: locationSet } },
          start,
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
        pipeline: [
          {
            $match: { userId: { $eq: userId } },
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
        // role: 1,
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
        appliedStatus: '$candidatepostjobs.approvedStatus',
        role: '$jobroles.Job_role',
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
  console.log(id);
  const check = await CandidateRegistration.findById(id);
  if (!check) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HH:mm:ss');
  // let values = {...body, ...{userId:userId}}
  let salary1;
  let salary2;
  let {
    search,
    experience,
    experienceAnotherfrom,
    experienceAnotherto,
    Location,
    preferredIndustry,
    Salary,
    workmode,
    department,
    education,
    // salaryfilter,
    role,
    freshness,
    // locationfilter,
    companytype,
    postedby,
    range,
    page,
    keySkillArr,
    salaryFrom,
    salaryTo,
    refWorkmode,
    advsearch,
  } = body;
  let assvalue = {};

  if (body.advsearch) {
    assvalue = { ...assvalue, search: body.advsearch };
  }
  if (body.keySkillArr) {
    assvalue = { ...assvalue, search: body.keySkillArr };
  }
  if (body.search) {
    assvalue = { ...assvalue, search: body.search };
  }
  if (body.experienceAnotherfrom) {
    assvalue = { ...assvalue, experience: body.experienceAnotherfrom };
  }
  if (body.experience) {
    assvalue = { ...assvalue, experience: body.experience };
  }
  if (body.Location) {
    assvalue = { ...assvalue, ...{ Location: body.Location } };
  }
  if (body.salary) {
    assvalue = { ...assvalue, ...{ salary: body.salary } };
  }
  let values = { ...assvalue, ...{ userId: id, date: date, time: creat1 } };
  if (
    search.length != 0 ||
    experience != null ||
    experienceAnotherfrom != null ||
    experienceAnotherto != null ||
    Location != null ||
    preferredIndustry.length != 0 ||
    Salary.length != 0 ||
    workmode.length != 0 ||
    department.length != 0 ||
    education.length != 0 ||
    // salaryfilter != null ||
    role.length != 0 ||
    freshness.length != 0 ||
    // locationfilter != null ||
    companytype.length != 0 ||
    postedby.length != 0 ||
    advsearch.length != 0
  ) {
    // await CandidateRecentSearchjobCandidate.create(values);
  }
  //  await CandidateSearchjobCandidate.create(values);

  //  search = ["fbhfghfh","software engineer"]
  // console.log(body)
  let experienceSearch = { active: true };
  let experienceAnotherSearch = [{ active: true }];
  let locationSearch = { active: true };
  let allSearch = [{ active: true }];
  let salarySearch = { active: true };
  let preferredindustrySearch = [{ active: true }];
  let workmodeSearch = { active: true };
  let educationSearch = { active: true };
  let departmentSearch = { active: true };
  let experienceMatch = { active: true };
  // let salaryfilterSearch = { active: true };
  let roleSearch = { active: true };
  let keySkillSearch = { active: true };
  let salary = { active: true };
  let freshnessSearch = { active: true };
  let expMatch = { active: true };
  // let locationfilterSearch = { active: true };
  let companytypeSearch = { active: true };
  let postedbySearch = { active: true };
  let industryMatch = { active: true };
  let advsearchMatch = { active: true };
  if (companytype.length != 0) {
    companytypeSearch = { companyType: { $in: companytype } };
  }

  if (experienceAnotherfrom != null && experienceAnotherto != null) {
    experienceAnotherSearch = [
      { experienceFrom: { $eq: parseInt(experienceAnotherfrom) } },
      { experienceTo: { $lte: parseInt(experienceAnotherto) } },
    ];
  }

  if (workmode.length != 0) {
    workmodeSearch = { workplaceType: { $in: workmode } };
  }

  if (department.length != 0) {
    departmentSearch = { department: { $in: department } };
  }

  if (role.length != 0) {
    roleSearch = { role: { $in: role } };
  }

  if (preferredIndustry.length != 0) {
    preferredindustrySearch = [{ preferedIndustry: { $elemMatch: { $in: preferredIndustry } } }];
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
    experienceSearch = { experienceFrom: { $eq: parseInt(experience) } };
  }

  if (Location != null) {
    locationSearch = { jobLocation: { $eq: Location } };
  }

  if (freshness.length != 0) {
    let one = [];
    for (let i = 0; i <= freshness.length; i++) {
      if (freshness[i] == '1') {
        one.push(moment().subtract(1, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '3') {
        one.push(moment().subtract(3, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '7') {
        one.push(moment().subtract(7, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '15') {
        one.push(moment().subtract(15, 'days').format('YYYY-MM-DD'));
      }
      if (freshness[i] == '30') {
        one.push(moment().subtract(30, 'days').format('YYYY-MM-DD'));
      }
    }
    freshnessSearch = { date: { $in: one } };
  }

  if (Salary.length != 0) {
    let salary_macth = [];
    Salary.forEach((a) => {
      let value = a.split('-');
      let start = value[0] * 100000;

      let end = 0;
      if (value[1] != 'more') {
        end = value[1] * 100000;
      }
      if (end != 0) {
        salary_macth.push({ $and: [{ salaryRangeFrom: { $gte: start } }, { salaryRangeTo: { $lte: end } }] });
      } else {
        salary_macth.push({ $and: [{ salaryRangeFrom: { $gte: start } }] });
      }
    });
    console.log(salary_macth);
    salarySearch = { $or: salary_macth };
    // salarySearch = { salaryRangeFrom: { $lte: parseInt(salary1) }, salaryRangeTo: { $gte: parseInt(salary2) } };
  }

  if (education.length != 0) {
    educationSearch = { course: { $elemMatch: { $in: education } } };
  }

  if (postedby.length != 0) {
    postedbySearch = { postedBy: { $in: postedby } };
  }

  if (keySkillArr.length > 0) {
    let arr = [];
    keySkillArr.forEach((e) => {
      arr.push({ keySkill: { $elemMatch: { $regex: e, $options: 'i' } } });
    });
    keySkillSearch = { $or: arr };
  } else {
    keySkillSearch;
  }

  // salary
  if (salaryFrom && salaryTo) {
    salary = { salaryRangeFrom: { $eq: salaryFrom }, salaryRangeTo: { $eq: salaryTo } };
  } else {
    salary;
  }

  // experienceMatch

  if (experienceAnotherfrom && experienceAnotherto) {
    experienceMatch = { experienceFrom: { $eq: experienceAnotherfrom }, experienceTo: { $eq: experienceAnotherto } };
  } else {
    experienceMatch;
  }

  // expMatch
  if (experience) {
    let exp = parseInt(experience);
    expMatch = { experienceFrom: { $eq: exp } };
  } else {
    expMatch;
  }

  // version 2.0 Refined Search
  // refWorkmode
  let workModeMatch = { active: true };
  if (refWorkmode) {
    workModeMatch = { workplaceType: { $regex: refWorkmode, $options: 'i' } };
  } else {
    workModeMatch;
  }
  //

  // advsearchMatch
  if (advsearch && advsearch.length > 0) {
    let arr = [];
    advsearch.forEach((e) => {
      arr.push({ keySkill: { $regex: e, $options: 'i' } });
    });
    advsearchMatch = { $or: arr };
  }
  const data = await EmployerDetails.aggregate([
    {
      $sort: { createdAt: -1 },
    },
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
        $and: preferredindustrySearch,
      },
    },
    {
      $match: {
        $and: [
          //  { jobortemplate: { $eq: 'job' } },
          locationSearch,
          salarySearch,
          salary,
          workmodeSearch,
          educationSearch,
          roleSearch,
          departmentSearch,
          freshnessSearch,
          experienceMatch,
          expMatch,
          advsearchMatch,
          keySkillSearch,
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
              $and: [companytypeSearch, postedbySearch],
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
        pipeline: [
          {
            $match: { userId: { $eq: id } },
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
    {
      $project: {
        keySkill: 1,
        jobTittle: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        educationalQualification: 1,
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
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        date: 1,
        expiredDate: 1,
        date: 1,
        roleCategory: 1,
        time: 1,
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrationscontactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        appliedStatus: '$candidatepostjobs.approvedStatus',
        role: '$jobroles.Job_role',
      },
    },
    { $skip: range * page },
    { $limit: range },
  ]);

  let total = await EmployerDetails.aggregate([
    {
      $sort: { createdAt: -1 },
    },
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
        $and: preferredindustrySearch,
      },
    },
    {
      $match: {
        $and: [
          //  { jobortemplate: { $eq: 'job' } },
          locationSearch,
          salarySearch,
          salary,
          workmodeSearch,
          educationSearch,
          roleSearch,
          departmentSearch,
          freshnessSearch,
          experienceMatch,
          expMatch,
          advsearchMatch,
          keySkillSearch,
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
              $and: [companytypeSearch, postedbySearch],
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
        pipeline: [
          {
            $match: { userId: { $eq: id } },
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
    {
      $project: {
        keySkill: 1,
        jobTittle: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        educationalQualification: 1,
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
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        date: 1,
        expiredDate: 1,
        date: 1,
        roleCategory: 1,
        time: 1,
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrationscontactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        appliedStatus: '$candidatepostjobs.approvedStatus',
        role: '$jobroles.Job_role',
      },
    },
    { $skip: range * (page + 1) },
    { $limit: range },
  ]);

  return { data: data, next: total.length !=0 };
};

const recentSearch = async (userId) => {
  const data = await CandidateSearchjobCandidate.aggregate([
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
  const data = await CandidateRecentSearchjobCandidate.findById(id);
  return data;
};
// candidate education details
const educationDetails = async (userId, body) => {
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  const data = await EducationDeatils.create({ ...body, ...{ userId: userId, date: date, time: creat1 } });
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
        pipeline: [
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
        pipeline: [
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
        keyskill: '$candidatedetails.keyskill',
        currentSkill: '$candidatedetails.currentSkill',
        preferredSkill: '$candidatedetails.preferredSkill',
        active: '$candidatedetails.active',
        image: '$candidatedetails.image',
        dob: '$candidatedetails.dob',
        experienceYear: '$candidatedetails.experienceYear',
        experienceMonth: '$candidatedetails.experienceMonth',
        expectedctc: '$candidatedetails.expectedctc',
        currentctc: '$candidatedetails.currentctc',
        locationCurrent: '$candidatedetails.locationCurrent',
        locationNative: '$candidatedetails.locationNative',
        noticeperiod: '$candidatedetails.noticeperiod',
        gender: '$candidatedetails.gender',
        maritalStatus: '$candidatedetails.maritalStatus',
        ugMarks: '$candidatedetails.ugMarks',
        ugGradingSystem: '$candidatedetails.ugGradingSystem',
        ugCourseType: '$candidatedetails.ugCourseType',
        ugCourseDurationTo: '$candidatedetails.ugCourseDurationTo',
        ugCourseDurationFrom: '$candidatedetails.ugCourseDurationFrom',
        relocate: '$candidatedetails.relocate',
        languages: '$candidatedetails.languages',
        ugUniversity: '$candidatedetails.ugUniversity',
        drQualification: '$candidatedetails.qualifications.qualification',
        drcourses: '$candidatedetails.drcourses.Course',
        drSpecialization: '$candidatedetails.drspecializations.Specialization',
        pgQualification: '$candidatedetails.pgqualifications.qualification',
        pgCourse: '$candidatedetails.pgcourses.Course',
        pgSpecialization: '$candidatedetails.pgspecializations.Specialization',
        ugQualification: '$candidatedetails.ugqualifications.qualification',
        ugCourse: '$candidatedetails.ugcourses.Course',
        ugSpecialization: '$candidatedetails.specializations.Specialization',
        role: '$candidatedetails.jobroles.Job_role',
        roleCategory: '$candidatedetails.rolecategories.Role_Category',
        department: '$candidatedetails.departments.Department',
        industry: '$candidatedetails.industries.Industry',
        sslctotalmarks: '$candidatedetails.sslctotalmarks',
        sslcPassedYear: '$candidatedetails.sslcPassedYear',
        sslcMedium: '$candidatedetails.sslcMedium',
        sslcBoard: '$candidatedetails.sslcBoard',
        sslcQualification: '$candidatedetails.sslcqualifications.qualification',
        pgUniversity: '$candidatedetails.pgUniversity',
        pgMarks: '$candidatedetails.pgUniversity',
        pgGradingSystem: '$candidatedetails.pgUniversity',
        pgCourseType: '$candidatedetails.pgUniversity',
        pgCourseDurationTo: '$candidatedetails.pgUniversity',
        pgCourseDurationFrom: '$candidatedetails.pgUniversity',
        hstotalmarks: '$candidatedetails.hstotalmarks',
        hsPassedYear: '$candidatedetails.hsPassedYear',
        hsMedium: '$candidatedetails.hsMedium',
        hsBoard: '$candidatedetails.hsBoard',
        drMarks: '$candidatedetails.drMarks',
        drGradingSystem: '$candidatedetails.drGradingSystem',
        drCourseType: '$candidatedetails.drCourseType',
        drCourseDurationTo: '$candidatedetails.drCourseDurationTo',
        drCourseDurationFrom: '$candidatedetails.drCourseDurationFrom',
        hsQualification: '$candidatedetails.hscqualifications.qualification',
        keyskillSet: '$candidatedetails.keyskillSet',
        drUniversity: '$candidatedetails.drUniversity',
        experienceMonthSet: '$candidatedetails.experienceMonthSet',
        locationSet: '$candidatedetails.locationSet',
        experienceYearSet: '$candidatedetails.experienceYearSet',
        designationSet: '$candidatedetails.designationSet',
        currentIndustry: '$candidatedetails.currentIndustry',
        currentDepartment: '$candidatedetails.currentDepartment',
        role_Category: '$candidatedetails.role_Category',
        salaryFrom: '$candidatedetails.salaryFrom',
        SalaryTo: '$candidatedetails.SalaryTo',
        appliedStatus: '$candidatepostjobs.approvedStatus',
        postjobId: '$candidatepostjobs._id',
      },
    },
  ]);
  return data;
};

const candidate_detials_id = async (id) => {
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
        pipeline: [
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
        adminStatus: 1,
        lat: 1,
        long: 1,
        resume: 1,
        createdAt: 1,
        updatedAt: 1,
        // candidateDetails: '$candidatedetails',
        keyskill: '$candidatedetails.keyskill',
        currentSkill: '$candidatedetails.currentSkill',
        preferredSkill: '$candidatedetails.preferredSkill',
        // active: '$candidatedetails.active',
        active: 1,
        image: '$candidatedetails.image',
        dob: '$candidatedetails.dob',
        experienceYear: '$candidatedetails.experienceYear',
        experienceMonth: '$candidatedetails.experienceMonth',
        expectedctc: '$candidatedetails.expectedctc',
        currentctc: '$candidatedetails.currentctc',
        locationCurrent: '$candidatedetails.locationCurrent',
        locationNative: '$candidatedetails.locationNative',
        noticeperiod: '$candidatedetails.noticeperiod',
        gender: '$candidatedetails.gender',
        maritalStatus: '$candidatedetails.maritalStatus',
        ugMarks: '$candidatedetails.ugMarks',
        ugGradingSystem: '$candidatedetails.ugGradingSystem',
        ugCourseType: '$candidatedetails.ugCourseType',
        ugCourseDurationTo: '$candidatedetails.ugCourseDurationTo',
        ugCourseDurationFrom: '$candidatedetails.ugCourseDurationFrom',
        relocate: '$candidatedetails.relocate',
        languages: '$candidatedetails.languages',
        ugUniversity: '$candidatedetails.ugUniversity',
        drQualification: '$candidatedetails.qualifications.qualification',
        drcourses: '$candidatedetails.drcourses.Course',
        drSpecialization: '$candidatedetails.drspecializations.Specialization',
        pgQualification: '$candidatedetails.pgqualifications.qualification',
        pgCourse: '$candidatedetails.pgcourses.Course',
        pgSpecialization: '$candidatedetails.pgspecializations.Specialization',
        ugQualification: '$candidatedetails.ugqualifications.qualification',
        ugCourse: '$candidatedetails.ugcourses.Course',
        ugSpecialization: '$candidatedetails.specializations.Specialization',
        role: '$candidatedetails.jobroles.Job_role',
        roleCategory: '$candidatedetails.rolecategories.Role_Category',
        department: '$candidatedetails.departments.Department',
        industry: '$candidatedetails.industries.Industry',
        sslctotalmarks: '$candidatedetails.sslctotalmarks',
        sslcPassedYear: '$candidatedetails.sslcPassedYear',
        sslcMedium: '$candidatedetails.sslcMedium',
        sslcBoard: '$candidatedetails.sslcBoard',
        sslcQualification: '$candidatedetails.sslcqualifications.qualification',
        pgUniversity: '$candidatedetails.pgUniversity',
        pgMarks: '$candidatedetails.pgUniversity',
        pgGradingSystem: '$candidatedetails.pgUniversity',
        pgCourseType: '$candidatedetails.pgUniversity',
        pgCourseDurationTo: '$candidatedetails.pgUniversity',
        pgCourseDurationFrom: '$candidatedetails.pgUniversity',
        hstotalmarks: '$candidatedetails.hstotalmarks',
        hsPassedYear: '$candidatedetails.hsPassedYear',
        hsMedium: '$candidatedetails.hsMedium',
        hsBoard: '$candidatedetails.hsBoard',
        drMarks: '$candidatedetails.drMarks',
        drGradingSystem: '$candidatedetails.drGradingSystem',
        drCourseType: '$candidatedetails.drCourseType',
        drCourseDurationTo: '$candidatedetails.drCourseDurationTo',
        drCourseDurationFrom: '$candidatedetails.drCourseDurationFrom',
        hsQualification: '$candidatedetails.hscqualifications.qualification',
        keyskillSet: '$candidatedetails.keyskillSet',
        drUniversity: '$candidatedetails.drUniversity',
        experienceMonthSet: '$candidatedetails.experienceMonthSet',
        locationSet: '$candidatedetails.locationSet',
        experienceYearSet: '$candidatedetails.experienceYearSet',
        designationSet: '$candidatedetails.designationSet',
        currentIndustry: '$candidatedetails.currentIndustry',
        currentDepartment: '$candidatedetails.currentDepartment',
        role_Category: '$candidatedetails.role_Category',
      },
    },
  ]);
  return data;
};

const createdSearchhistoryData_byId = async (id) => {
  let data = await CandidateSearchjobCandidate.findById(id);
  return data;
};

const CandidateRegistration_names = async (key) => {
  let data = await CandidateRegistration.find({ name: { $regex: key, $options: 'i' } })
    .select('name')
    .limit(7);
  return data;
};

const CandidateRegistration_number = async (key) => {
  let data = await CandidateRegistration.find({ mobileNumber: { $regex: key, $options: 'i' } })
    .select('mobileNumber')
    .limit(7);
  return data;
};

const get_all_candidates = async (body) => {
  let = { date1, date2, mobilenumber, skill, name, location, sortBy, range, page } = body;
  console.log(page);
  let searchfilter = { data: true };
  let datefiletr = { data: true };
  let locationfilter = { data: true };
  // let salaryfilter = { data: true };
  let sortByfilter = { data: true };
  // let experienceFilter = { data: true };
  let mobileNumberfilter = { data: true };
  let skillfilter = { data: true };
  if (name != null) {
    searchfilter = { name: { $eq: name } };
  }
  if (date1 != null && date2 != null) {
    datefiletr = { $and: [{ date: { $gte: date1 } }, { date: { $lte: date2 } }] };
  }
  if (sortBy != null) {
    if (sortBy == 'debarred') {
      sortByfilter = { adminStatus: { $eq: sortBy } };
    }
    if (sortBy == 'inactive') {
      sortByfilter = { active: { $eq: false } };
    }
    if (sortBy == 'Active') {
      sortByfilter = { active: { $eq: true } };
    }
    if (sortBy == 'all') {
      sortByfilter = { data: { $eq: true } };
    }
  }
  if (mobilenumber != null) {
    mobileNumberfilter = { mobileNumber: { $eq: mobilenumber } };
  }

  if (skill.length != 0) {
    skillfilter = { keyskill: { $elemMatch: { $in: skill } } };
  }

  if (location != null) {
    locationfilter = { location: { $regex: location, $options: 'i' } };
  }

  // if (experience != null) {
  //   experienceFilter = { experienceYear:{ $eq: parseInt(experience) } };
  // }

  // if (salary != null) {
  //       let value = salary.split('-');
  //       let start = value[0] * 100000;

  //       let end = 0;
  //       if (value[1] != 'more') {
  //         end = value[1] * 100000;
  //       }
  //       if (end != 0) {

  //         salaryfilter = {$or: [
  //             {
  //               $and: [
  //                 { expCTC_strat: { $gte: start } },
  //                 { $or: [{ expCTC_end: { $lte: end } }, { expCTC_end: { $eq: 0 } }] },
  //               ],
  //             },
  //             {
  //               $and: [{ totalCTC: { $gte: start } }, { totalCTC: { $lte: end } }],
  //             },
  //           ]}
  //       } else {
  //         salaryfilter =  {$or: [{ expCTC_strat: { $gte: start } }, { totalCTC: { $gte: start } }] }
  //       }
  // }

  let data = await CandidateRegistration.aggregate([
    // {
    //   $match: {
    //     $and: [salaryfilter, locationfilter, datefiletr, searchfilter,experienceFilter,sortByfilter],
    //   },
    // },
    {
      $lookup: {
        from: 'candidatedetails',
        localField: '_id',
        foreignField: 'userId',
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
        adminStatus: 1,
        active: 1,
        name: 1,
        email: 1,
        workStatus: 1,
        mobileNumber: 1,
        location: 1,
        date: 1,
        data: 1,
        resume: 1,
        latestdate: 1,
        expCTC_strat: '$candidatedetails.expCTC_strat',
        expCTC_end: '$candidatedetails.expCTC_end',
        totalCTC: '$candidatedetails.totalCTC',
        keyskill: '$candidatedetails.keyskill',
        experienceYear: '$candidatedetails.experienceYear',
      },
    },

    {
      $match: {
        $and: [locationfilter, datefiletr, searchfilter, mobileNumberfilter, skillfilter, sortByfilter],
      },
    },
    { $skip: parseInt(range) * parseInt(page) },
    { $limit: parseInt(range) },
  ]);
  let count = await CandidateRegistration.aggregate([
    // {
    //   $match: {
    //     $and: [salaryfilter, locationfilter, datefiletr, searchfilter,experienceFilter,sortByfilter],
    //   },
    // },
    {
      $lookup: {
        from: 'candidatedetails',
        localField: '_id',
        foreignField: 'userId',
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
        adminStatus: 1,
        active: 1,
        name: 1,
        email: 1,
        workStatus: 1,
        mobileNumber: 1,
        location: 1,
        date: 1,
        data: 1,
        resume: 1,
        latestdate: 1,
        expCTC_strat: '$candidatedetails.expCTC_strat',
        expCTC_end: '$candidatedetails.expCTC_end',
        totalCTC: '$candidatedetails.totalCTC',
        keyskill: '$candidatedetails.keyskill',
        experienceYear: '$candidatedetails.experienceYear',
      },
    },

    {
      $match: {
        $and: [locationfilter, datefiletr, searchfilter, mobileNumberfilter, skillfilter, sortByfilter],
      },
    },
  ]);
  return { data: data, count: count.length };
};

//  remove Resume For Candidate

const DeleteResume = async (userId) => {
  let values = await CandidateRegistration.findById(userId);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Available');
  }
  values = await CandidateRegistration.findByIdAndUpdate({ _id: userId }, { resume: '' }, { new: true });
  return values;
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
  edit_details,
  candidate_detials_id,
  get_all_candidates,
  CandidateRegistration_names,
  CandidateRegistration_number,
  // createSearchCandidate,
  DeleteResume,
};
