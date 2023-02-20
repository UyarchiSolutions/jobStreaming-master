const httpStatus = require('http-status');
const {
  CandiadteSearch,
  CreateSavetoFolder,
  CreateSavetoFolderseprate,
  CreateoutSearchHistory,
  CreateoutSearchHistorySave,
} = require('../models/employerCandidateSearch.model');
const { EmployerDetails, EmployerPostjob } = require('../models/employerDetails.model');
const { KeySkill, CandidateSaveJob } = require('../models/candidateDetails.model');
const { EmployerRegistration } = require('../models');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const createCandidateSearch = async (userId, userBody) => {
  let values = { ...userBody, ...{ userId: userId } };
  let data = await CandiadteSearch.create(values);
  return data;
};

const createSaveSeprate = async (userId, userBody) => {
  userBody.candidateId.forEach(async (e) => {
    await CreateSavetoFolderseprate.create({ ...userBody, ...{ userId: userId, candidateId: e } });
    console.log(e);
  });
  return { message: 'Save Sucessfully...' };
};

const getSaveSeprate = async (userId) => {
  const data = await CreateSavetoFolderseprate.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'candidateId',
        foreignField: '_id',
        pipeline: [
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
            }
          }    
        ],
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: {
        path: '$candidateregistrations',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'employercomments',
        localField: 'candidateId',
        foreignField: 'candidateId',
        pipeline:[
          {
            $match: {
              $and: [{ userId: { $eq: userId } }],
            },
          },
        ],
        as: 'employercomments',
      },
    },
    {
      $unwind: {
        path: '$employercomments',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        candidateData: '$candidateregistrations',
        comments:'$employercomments.comment',
        commentId:'$employercomments._id'
      },
    },
  ]);
  return data;
};

const delete_Seprate_saveCandidate = async (id) => {
  const data = await CreateSavetoFolderseprate.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'candidate not found');
  }
  await data.remove();
  return data;
};

const employerSearchCandidate = async (id) => {
  let data = await KeySkill.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'savetofolderemployersearches',
              localField: '_id',
              foreignField: 'candidateId',
              as: 'savetofolderemployersearches',
            },
          },
          {
            $unwind: {
              path: '$savetofolderemployersearches',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: '$candidateregistrations',
    },
    {
      $project: {
        keyskill: 1,
        currentSkill: 1,
        preferredSkill: 1,
        secondarySkill: 1,
        pasrSkill: 1,
        experienceMonth: 1,
        experienceYear: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        locationNative: 1,
        locationCurrent: 1,
        education: 1,
        specification: 1,
        university: 1,
        courseType: 1,
        passingYear: 1,
        gradingSystem: 1,
        availability: 1,
        gender: 1,
        maritalStatus: 1,
        image: 1,
        userId: 1,
        createdAt: 1,
        saveDataOrNot: { $ifNull: ['$candidateregistrations.savetofolderemployersearches.status', false] },
        candidateregistrations: '$candidateregistrations',
      },
    },
  ]);
  return data;
};

const searchCandidate = async (key) => {
  console.log(key);
  let keyskill = key.keyskill;
  let keywords = key.keywords;
  let locationCurrent = key.location;
  let courseType = key.courseType;
  let passingYearFrom = key.passingYearFrom;
  let passingYearTo = key.passingYearTo;

  // if (parseInt(passingYearFrom) <= parseInt(passingYearTo)) {
  //     to = parseInt(passingYearFrom);
  //     from = parseInt(passingYearTo);
  //   } else {
  //     to = parseInt(passingYearTo);
  //     from = parseInt(passingYearFrom);
  //   }
  let _keyskill = { active: true };
  let _keywords = { active: true };
  let _location = { active: true };
  let _courseType = { active: true };
  let _passingYearFrom = { active: true };
  //  let _passingYearTo = {active:true};

  // keywords = ["hjkhgjk"]
  // locationCurrent = "chennai"
  if (keyskill != null && keyskill != '') {
    keyskill = keyskill.split(',');
    console.log(keyskill);
    _keyskill = { keyskill: { $elemMatch: { $in: keyskill } } };
  }
  if (keywords != null && keywords != '') {
    keywords = keywords.split(',');
    _keywords = {
      $or: [
        { currentSkill: { $elemMatch: { $in: keywords } } },
        { preferredSkill: { $elemMatch: { $in: keywords } } },
        { pasrSkill: { $elemMatch: { $in: keywords } } },
        { secondarySkill: { $elemMatch: { $in: keywords } } },
      ],
    };
  }
  if (locationCurrent != null && locationCurrent != '') {
    _location = { locationCurrent: { $eq: locationCurrent } };
  }
  if (courseType != null || courseType != '') {
    _courseType = { courseType: { $eq: courseType } };
  }
  if (passingYearFrom != null && passingYearTo != null && passingYearFrom != '' && passingYearTo != '') {
    (_passingYearFrom = { passingYear: { $gte: parseInt(passingYearFrom) } }),
      { passingYear: { $lte: parseInt(passingYearTo) } };
  }

  console.log(_keyskill);
  const data = await KeySkill.aggregate([
    {
      $match: {
        $or: [_location, _courseType, _passingYearFrom],
      },
    },
    {
      $match: {
        $and: [_keyskill],
      },
    },
    {
      $match: _keywords,
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: '$candidateregistrations',
    },
  ]);

  return data;
};

const outSearch_employer = async (userId, body) => {
  const check = await EmployerRegistration.findById(userId);

  if (!check) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employer not found');
  }
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HH:mm:ss');
  console.log(body.keyskills);
  const {
    keyskills,
    // Anykeywords,
    experiencefrom,
    experienceto,
    salary,
    Location,
    displayDetails,
    course,
    role,
    department,
    industry,
    noticeperiod,
    experience,
    gender,
    range,
    page,
  } = body;
  if (
    keyskills.length != 0 ||
    // Anykeywords.length != 0 ||
    experience != null ||
    experiencefrom != null ||
    experienceto != null ||
    // salaryRange != null ||
    Location.length != 0 ||
    salary.length != 0 ||
    course.length != 0 ||
    gender != null ||
    role.length != 0 ||
    department.length != 0 ||
    industry.length != 0 ||
    noticeperiod.length != 0 ||
    displayDetails != null
  ) {
    await CreateoutSearchHistory.create({ ...body, ...{ userId: userId, date: date, time: creat1 } });
  }
  let keyskillSearch = { active: true };
  let expSearch = { active: true };
  let anykeywordsSearch = [{ active: true }];
  let experienceSearch = [{ active: true }];

  let genderSearch = { active: true };
  let locationSearch = [{ active: true }];
  let displayDetailsSearch = [{ active: true }];
  let qualificationSearch = [{ active: true }];

  let salarySearch = { active: true };
  let roleSearch = { active: true };
  let departmentSearch = { active: true };
  let industrySearch = { active: true };
  let noticeperiodSearch = { active: true };
  // filter if condition

  // if (keyskills.length != 0) {
  //   keyskillSearch = { keyskill: { $elemMatch: { $in: keyskills } } };
  // }

  if (role.length != 0) {
    roleSearch = { role: { $in: role } };
  }

  if (department.length != 0) {
    departmentSearch = { department: { $in: department } };
  }

  if (industry.length != 0) {
    industrySearch = { industry: { $in: industry } };
  }

  if (noticeperiod.length != 0) {
    noticeperiodSearch = { noticeperiod: { $in: noticeperiod } };
  }

  if (keyskills.length != 0) {
    console.log(keyskills);
    anykeywordsSearch = [
      { currentSkill: { $elemMatch: { $in: keyskills } } },
      { preferredSkill: { $elemMatch: { $in: keyskills } } },
      { keyskill: { $elemMatch: { $in: keyskills } } },
    ];
  }
  if (experiencefrom != null && experienceto != null) {
    // experienceSearch = [
    //   { experienceYear: { $gte: parseInt(experiencefrom) } },
    //   { experienceYear: { $lte: parseInt(experienceto) } },
    // ];
    experienceSearch = [
      { experienceYear: { $eq: parseInt(experiencefrom) } },
      { experienceYear: { $lte: parseInt(experienceto) } },
    ];
  }
  if (experience != null) {
    expSearch = { experienceYear: { $eq: experience } };
  }

  if (Location.length != 0) {
    locationSearch = [{ locationCurrent: { $in: Location } }, { locationNative: { $in: Location } }];
  }

  if (course.length != 0) {
    qualificationSearch = [
      { drCourse: { $in: course } },
      { pgCourse: { $in: course } },
      { ugCourse: { $in: course } },
      { sslcQualification: { $in: course } },
      { hsQualification: { $in: course } },
    ];
  }
  if (salary.length != 0) {
    let salary_macth = [];
    salary.forEach((a) => {
      let value = a.split('-');
      let start = value[0] * 100000;

      let end = 0;
      if (value[1] != 'more') {
        end = value[1] * 100000;
      }
      if (end != 0) {
        salary_macth.push({
          $or: [
            {
              $and: [
                { expCTC_strat: { $gte: start } },
                { $or: [{ expCTC_end: { $lte: end } }, { expCTC_end: { $eq: 0 } }] },
              ],
            },
            {
              $and: [{ totalCTC: { $gte: start } }, { totalCTC: { $lte: end } }],
            },
          ],
        });
      } else {
        salary_macth.push({
          $or: [{ expCTC_strat: { $gte: start } }, { totalCTC: { $gte: start } }],
        });
      }
    });
    salarySearch = { $or: salary_macth };
  }

  if (gender != null) {
    genderSearch = { gender: { $eq: gender } };
  }
  let sc = moment().subtract(14, 'days').format('YYYY-MM-DD');
  if (displayDetails != null) {
    displayDetailsSearch = [{ date: { $gte: sc } }];
  }
  // console.log(
  // keyskillSearch,
  // locationSearch,
  // expSearch,
  // displayDetailsSearch,
  // genderSearch,
  //  salarySearch,
  // roleSearch,
  // departmentSearch,
  // industrySearch,
  // noticeperiodSearch,
  // anykeywordsSearch
  // );
  const data = await KeySkill.aggregate([
    {
      $match: {
        $and: [
          // keyskillSearch,
          // locationSearch,
          expSearch,
          // displayDetailsSearch,
          genderSearch,
          salarySearch,
          roleSearch,
          departmentSearch,
          industrySearch,
          noticeperiodSearch,
        ],
      },
    },
    {
      $match: {
        $or: qualificationSearch,
      },
    },
    {
      $match: {
        $or: locationSearch,
      },
    },
    {
      $match: {
        $or: anykeywordsSearch,
      },
    },
    {
      $match: {
        $and: experienceSearch,
      },
    },
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
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $match: {
              $and: displayDetailsSearch,
            },
          },
        ],
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: '$candidateregistrations',
    },
    {
      $project: {
        resume: '$candidateregistrations.resume',
        email: '$candidateregistrations.email',
        workStatus: '$candidateregistrations.workStatus',
        mobileNumber: '$candidateregistrations.mobileNumber',
        name: '$candidateregistrations.name',
        lat: '$candidateregistrations.lat',
        long: '$candidateregistrations.long',
        resume: '$candidateregistrations.resume',
        createdAt: '$candidateregistrations.createdAt',
        updatedAt: '$candidateregistrations.updatedAt',
        candiadteId: '$candidateregistrations._id',
        // candidateDetails: '$candidatedetails',
        keyskill: 1,
        currentSkill: 1,
        preferredSkill: 1,
        active: 1,
        image: 1,
        dob: 1,
        experienceYear: 1,
        experienceMonth: 1,
        expectedctc: 1,
        currentctc: 1,
        locationCurrent: 1,
        locationNative: 1,
        noticeperiod: 1,
        gender: 1,
        maritalStatus: 1,
        ugMarks: 1,
        ugGradingSystem: 1,
        ugCourseType: 1,
        ugCourseDurationTo: 1,
        ugCourseDurationFrom: 1,
        relocate: 1,
        languages: 1,
        ugUniversity: 1,
        drQualification: '$qualifications.qualification',
        drcourses: '$drcourses.Course',
        drSpecialization: '$drspecializations.Specialization',
        pgQualification: '$pgqualifications.qualification',
        pgCourse: '$candidatedetails.pgcourses.Course',
        pgSpecialization: '$pgspecializations.Specialization',
        ugQualification: '$ugqualifications.qualification',
        ugCourse: '$ugcourses.Course',
        ugSpecialization: '$specializations.Specialization',
        role: '$jobroles.Job_role',
        roleCategory: '$rolecategories.Role_Category',
        department: '$departments.Department',
        industry: '$industries.Industry',
        sslctotalmarks: 1,
        sslcPassedYear: 1,
        sslcMedium: 1,
        sslcBoard: 1,
        sslcQualification: '$sslcqualifications.qualification',
        pgUniversity: 1,
        pgMarks: 1,
        pgGradingSystem: 1,
        pgCourseType: 1,
        pgCourseDurationTo: 1,
        pgCourseDurationFrom: 1,
        hstotalmarks: 1,
        hsPassedYear: 1,
        hsMedium: 1,
        hsBoard: 1,
        drMarks: 1,
        drGradingSystem: 1,
        drCourseType: 1,
        drCourseDurationTo: 1,
        drCourseDurationFrom: 1,
        hsQualification: '$hscqualifications.qualification',
        keyskillSet: 1,
        drUniversity: 1,
        experienceMonthSet: 1,
        locationSet: 1,
        experienceYearSet: 1,
        designationSet: 1,
        currentIndustry: 1,
        currentDepartment: '$departments.Department',
        role_Category: 1,
        salaryFrom: 1,
        SalaryTo: 1,
        currentctc_th:1,
        expCTC_end:1,
        expCTC_strat:1,
        totalCTC:1
      },
    },
    { $skip: range * page },
    { $limit: range },
  ]);
  return data;
};

const outSearchSave = async (userId, userBody) => {
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HH:mm:ss');
  const data = await CreateoutSearchHistorySave.create({ ...userBody, ...{ userId: userId, date: date, time: creat1 } });
  return data;
};

const outSearchRecentSearch = async (userId) => {
  const data = await CreateoutSearchHistory.aggregate([
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

const recent_search_byId = async (id) => {
  const data = await CreateoutSearchHistory.findById(id);
  return data;
};

const recent_searchSave_byId = async (id) => {
  const data = await CreateoutSearchHistorySave.findById(id);
  return data;
};

const outSearchSaveData = async (userId) => {
  const data = await CreateoutSearchHistorySave.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $limit: 4,
    },
  ]);
  return data;
};

const outSearchSaveData_all = async (userId) => {
  const data = await CreateoutSearchHistorySave.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
  ]);
  return data;
};

const createSavetoFolder = async (userId, userBody) => {
  userBody.candidateId.forEach(async (e) => {
    await CreateSavetoFolder.create({ ...userBody, ...{ userId: userId, candidateId: e } });
  });
  return { message: 'saved sucessfully' };
};

const employerPost_Jobs = async (userId) => {
  let data = await EmployerDetails.aggregate([
    { $sort: { date: -1 } },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    // {
    //   $lookup: {
    //     from: 'employerregistrations',
    //     localField: 'userId',
    //     foreignField: '_id',
    //     as: 'employerregistrations',
    //   },
    // },
    // {
    //   $unwind:'$employerregistrations',
    // },
  ]);
  return data;
};

const employer_job_post_edit = async (id, updateBody) => {
  const user = await EmployerDetails.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'post a Job not found');
  }
  const data = await EmployerDetails.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  await data.save();
  return data;
};

const candidatdeSaveJobRemove = async (id) => {
  const data = await CandidateSaveJob.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'savejob not found');
  }
  await data.remove();
  return data;
};

const candidate_applied_Details = async (id) => {
  const data = await EmployerPostjob.aggregate([
    {
      $match: {
        $and: [{ postajobId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'candidateId',
        foreignField: '_id',
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: '$candidateregistrations',
    },
  ]);
  return data;
};

const candidate_applied_Details_view = async (id) => {
  const data = await KeySkill.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'savetofolderemployersearches',
              localField: '_id',
              foreignField: 'candidateId',
              as: 'savetofolderemployersearches',
            },
          },
          {
            $unwind: {
              path: '$savetofolderemployersearches',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: '$candidateregistrations',
    },
    {
      $project: {
        keyskill: 1,
        currentSkill: 1,
        preferredSkill: 1,
        secondarySkill: 1,
        pasrSkill: 1,
        experienceMonth: 1,
        experienceYear: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        locationNative: 1,
        locationCurrent: 1,
        education: 1,
        specification: 1,
        university: 1,
        courseType: 1,
        passingYear: 1,
        gradingSystem: 1,
        availability: 1,
        gender: 1,
        maritalStatus: 1,
        image: 1,
        userId: 1,
        createdAt: 1,
        saveDataOrNot: { $ifNull: ['$candidateregistrations.savetofolderemployersearches.status', false] },
        candidateregistrations: '$candidateregistrations',
      },
    },
  ]);
  return data;
};

const saveSearchData_EmployerSide = async (userId) => {
  const data = await CandiadteSearch.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
  ]);
  return data;
};

const employerRemovePostJobs = async (id) => {
  const data = await CandiadteSearch.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'savejob not found');
  }
  await data.remove();
  return data;
};

const allFolderData = async (userId, folderName) => {
  // console.log(userId, folderName);
  const data = await CreateSavetoFolder.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }, { folderName: { $eq: folderName } }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'candidateId',
        foreignField: '_id',
        pipeline: [
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
              // candidateDetails:'$candidatedetails'
            },
          },
        ],
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: '$candidateregistrations',
    },
    {
      $project: {
        status: 1,
        candidateId: 1,
        folderName: 1,
        userId: 1,
        createdAt: 1,
        name: '$candidateregistrations.name',
        email: '$candidateregistrations.email',
        workStatus: '$candidateregistrations.workStatus',
        mobileNumber: '$candidateregistrations.mobileNumber',
        resume: '$candidateregistrations.resume',
        candidateDetails: '$candidateregistrations',
        // userId:"$candidateregistrations.candidatedetails.userId",
      },
    },
    // {
    //   $group: {
    //     _id: { folderName: '$folderName' },
    //     email : { $addToSet : "$email" }
    //   },
    // },
  ]);
  return data;
};

const saveFolderData_view = async (userId) => {
  const data = await CreateSavetoFolder.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $group: {
        _id: { folderName: '$folderName', userId: '$userId' },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        folderName: '$_id.folderName',
        count: 1,
        userId: userId,
      },
    },
    {
      $limit: 3,
    },
  ]);
  return data;
};

const edit_all_folder = async (userId, body) => {
  const data = await CreateSavetoFolder.find({ userId: userId, folderName: body.folderName });
  data.forEach(async (e) => {
    await CreateSavetoFolder.findByIdAndUpdate({ _id: e._id }, { folderName: body.newfoldername }, { new: true });
  });
  return { message: 'folderName changed sucessfully' };
};

const saveFolderData_view_All_data = async (userId) => {
  const data = await CreateSavetoFolder.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $group: {
        _id: { folderName: '$folderName', userId: '$userId' },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        folderName: '$_id.folderName',
        count: 1,
        userId: userId,
      },
    },
  ]);
  return data;
};

// delete folder

const delete_folder = async (id, folder) => {
  const data = await CreateSavetoFolder.find({ userId: id, folderName: folder });
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'savejob not found');
  }
  data.forEach(async (e) => {
    e.remove();
    // console.log("delete")
  });
  return { message: 'folder deleted successfully' };
};

// delete folderBy one data

const delete_one_data = async (body) => {
  const { candidateId } = body;
  let data = await CreateSavetoFolder.deleteMany({ _id: { $in: candidateId } });
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'data not found');
  }
  return { message: 'Deleted data ' };
};

// recent search delete

const recent_saver_search_delete = async (body) => {
  const { candidateId } = body;
  await CreateoutSearchHistorySave.deleteMany({ _id: { $in: candidateId } });
  return { message: 'deleted...' };
};

module.exports = {
  createCandidateSearch,
  searchCandidate,
  employerSearchCandidate,
  createSavetoFolder,
  employerPost_Jobs,
  employer_job_post_edit,
  candidate_applied_Details,
  candidate_applied_Details_view,
  saveSearchData_EmployerSide,
  employerRemovePostJobs,
  allFolderData,
  candidatdeSaveJobRemove,
  saveFolderData_view,
  createSaveSeprate,
  getSaveSeprate,
  delete_Seprate_saveCandidate,
  outSearch_employer,
  outSearchSave,
  outSearchRecentSearch,
  outSearchSaveData,
  recent_search_byId,
  recent_searchSave_byId,
  delete_folder,
  delete_one_data,
  saveFolderData_view_All_data,
  outSearchSaveData_all,
  edit_all_folder,
  recent_saver_search_delete,
};
