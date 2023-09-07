const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const moment = require('moment');

const keySkillSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    image: {
      type: String,
    },
    keyskill: {
      type: Array,
    },
    languages: {
      type: Object,
    },
    userId: {
      type: String,
    },
    recruiterName: {
      type: String,
    },
    recruiterEmail: {
      type: String,
    },
    recruiterNumber: {
      type: String,
    },
    experienceMonth: {
      type: Number,
    },
    experienceYear: {
      type: Number,
    },
    expectedctc: {
      type: Number,
    },
    currentctc: {
      type: Number,
    },
    currentctc_th: {
      type: Number,
    },
    totalCTC: {
      type: String,
    },
    expCTC_strat: {
      type: Number,
    },
    expCTC_end: {
      type: Number,
    },
    dob: {
      type: String,
    },
    noticeperiod: {
      type: String,
    },
    salaryRangeFrom: {
      type: Number,
    },
    salaryRangeTo: {
      type: Number,
    },
    locationNative: {
      type: String,
    },
    locationCurrent: {
      type: String,
    },
    education: {
      type: String,
    },
    course: {
      type: String,
    },
    specification: {
      type: String,
    },
    university: {
      type: String,
    },
    courseType: {
      type: String,
    },
    passingYear: {
      type: Number,
    },
    gradingSystem: {
      type: String,
    },
    availability: {
      type: String,
    },
    currentSkill: {
      type: Array,
    },
    preferredSkill: {
      type: Array,
    },
    secondarySkill: {
      type: Array,
    },
    pasrSkill: {
      type: Array,
    },
    gender: {
      type: String,
    },
    maritalStatus: {
      type: String,
    },
    mark: {
      type: String,
    },
    Jobtype: {
      type: String,
    },
    relocate: {
      type: String,
    },
    keyskillSet: {
      type: Array,
    },
    experienceMonthSet: {
      type: Number,
    },
    experienceYearSet: {
      type: Number,
    },
    designationSet: {
      type: String,
    },
    locationSet: {
      type: String,
    },
    date: {
      type: String,
      // default:moment().format('YYYY-MM-DD')
    },
    time: {
      type: String,
      // default:moment().format('HHmmss')
    },
    active: {
      type: Boolean,
      default: true,
    },
    industry: {
      type: String,
    },
    department: {
      type: String,
    },
    roleCategory: {
      type: String,
    },
    role: {
      type: String,
    },
    // 10th
    sslcQualification: {
      type: String,
      // default:'SSLC'
    },
    sslcBoard: {
      type: String,
    },
    sslcPassedYear: {
      type: Number,
    },
    sslcMedium: {
      type: String,
    },
    sslctotalmarks: {
      type: String,
    },
    // 12th
    hsQualification: {
      type: String,
      // default:'HSC'
    },
    hsBoard: {
      type: String,
    },
    hsPassedYear: {
      type: Number,
    },
    hsMedium: {
      type: String,
    },
    hstotalmarks: {
      type: String,
    },

    // graduation/diploma
    ugQualification: {
      type: String,
      // default:'Graduation/Diploma'
    },
    ugCourse: {
      type: String,
    },
    ugSpecialization: {
      type: String,
    },
    ugCourseType: {
      type: String,
    },
    ugCourseDurationFrom: {
      type: String,
    },
    ugCourseDurationTo: {
      type: String,
    },
    ugGradingSystem: {
      type: String,
    },
    ugUniversity: {
      type: String,
    },
    ugMarks: {
      type: String,
    },

    // pg
    pgQualification: {
      type: String,
      // default:'Masters/Post-Graduation'
    },
    pgCourse: {
      type: String,
    },
    pgSpecialization: {
      type: String,
    },
    pgCourseType: {
      type: String,
    },
    pgCourseDurationFrom: {
      type: String,
    },
    pgCourseDurationTo: {
      type: String,
    },
    pgGradingSystem: {
      type: String,
    },
    pgUniversity: {
      type: String,
    },
    pgMarks: {
      type: String,
    },

    // docterate
    drQualification: {
      type: String,
      // default:'Doctorate/PhD'
    },
    drCourse: {
      type: String,
    },
    drSpecialization: {
      type: String,
    },
    drCourseType: {
      type: String,
    },
    drCourseDurationFrom: {
      type: String,
    },
    drCourseDurationTo: {
      type: String,
    },
    drGradingSystem: {
      type: String,
    },
    drUniversity: {
      type: String,
    },
    drMarks: {
      type: String,
    },
    currentIndustry: {
      type: String,
    },
    currentDepartment: {
      type: String,
    },
    role_Category: {
      type: String,
    },
    salaryFrom: {
      type: String,
    },
    preferredLocation: {
      type: Array,
    },
    locationdummy: {
      type: Array,
    },
    SalaryTo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const KeySkill = mongoose.model('candidateDetail', keySkillSchema);
const educationDeatilsSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    keyskill: {
      type: Array,
    },
    userId: {
      type: String,
    },

    Qualification: {
      type: String,
    },
    course: {
      type: String,
    },
    specification: {
      type: String,
    },
    university: {
      type: String,
    },
    courseType: {
      type: String,
    },
    passingYear: {
      type: Number,
    },
    gradingSystem: {
      type: String,
    },
    mark: {
      type: String,
    },
    Board: {
      type: String,
    },
    medium: {
      type: String,
    },
    courseDurationFrom: {
      type: String,
    },
    courseDurationTo: {
      type: String,
    },
    date: {
      type: String,
      // default:moment().format('YYYY-MM-DD')
    },
    time: {
      type: String,
      // default:moment().format('HHmmss')
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const EducationDeatils = mongoose.model('educationDeatil', educationDeatilsSchema);
const candidatePostjobSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    jobId: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    approvedStatus: {
      type: String,
      default: 'Applied',
    },
    employerCommand: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const CandidatePostjob = mongoose.model('candidatepostjob', candidatePostjobSchema);
const candidateSaveJobSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    savejobId: {
      type: String,
    },
    applied_side: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const CandidateSaveJob = mongoose.model('candidateSaveJob', candidateSaveJobSchema);
const candidateSearchjobCandidateSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    search: {
      type: Array,
    },
    experience: {
      type: Number,
    },
    exp: {
      type: String,
    },
    Location: {
      type: String,
    },
    preferredindustry: {
      type: String,
    },
    salary: {
      type: Number,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const CandidateSearchjobCandidate = mongoose.model('candidateSearchjobsave', candidateSearchjobCandidateSchema);

const candidataSearchEmployerSetSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    keyskill: {
      type: Array,
    },
    experienceMonth: {
      type: Number,
    },
    experienceYear: {
      type: Number,
    },
    location: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const candidataSearchEmployerSet = mongoose.model('candidatesetSearch', candidataSearchEmployerSetSchema);
const candidateRecentSearchjobCandidateSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    search: {
      type: Array,
    },
    advsearch: {
      type: Array,
    },
    experience: {
      type: Number,
    },
    Location: {
      type: String,
    },
    preferredindustry: {
      type: String,
    },
    salary: {
      type: Number,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const CandidateRecentSearchjobCandidate = mongoose.model(
  'candidateRecentSearchjob',
  candidateRecentSearchjobCandidateSchema
);
module.exports = {
  KeySkill,
  CandidatePostjob,
  CandidateSaveJob,
  CandidateSearchjobCandidate,
  candidataSearchEmployerSet,
  CandidateRecentSearchjobCandidate,
  EducationDeatils,
};
