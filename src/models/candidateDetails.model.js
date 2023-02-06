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
    image:{
        type:String,
    },
    keyskill: {
        type:Array,
    },
    userId:{
        type:String,
    },
    experienceMonth:{
        type:Number
    },
    experienceYear:{
        type:Number
    },
    expectedctc:{
      type:Number,
    },
    currentctc:{
      type:String,
    },
    noticeperiod:{
      type:String,
    },
    salaryRangeFrom:{
        type:Number,
    },
    salaryRangeTo:{
        type:Number,
    },
    locationNative:{
        type:String,
    },
    locationCurrent:{
        type:String,
    },
    education:{
        type:String,
    },
    course:{
        type:String,
    },
    specification:{
        type:String,
    },
    university:{
        type:String,
    },
    courseType:{
        type:String,
    },
    passingYear:{
        type:Number,
    },
    gradingSystem:{
        type:String,
    },
    availability:{
        type:String,
    },
    currentSkill:{
        type:Array,
    },
    preferredSkill:{
        type:Array,
    },
    secondarySkill:{
        type:Array,
    },
    pasrSkill:{
        type:Array,
    },
    gender:{
        type:String,
    },
    maritalStatus:{
        type:String,
    },
    mark:{
        type:String,
    },
    Jobtype:{
        type:String,
    },
    relocate:{
      type:String,
    },
    keyskillSet:{
      type:Array,
    },
    experienceMonthSet:{
      type:Number,
    },
    experienceYeaSet:{
      type:Number,
    },
    locationSet:{
      type:String,
    },
    date:{
      type:String,
      // default:moment().format('YYYY-MM-DD')
    },
    time: {
      type: String,
      // default:moment().format('HHmmss')
    },
    active:{
        type:Boolean,
        default:true,
    },
    // 10th
    sslc:{
      sslcQualification:{
        type:String,
      },
      sslcBoard:{
        type:String,
      },
      sslcPassedYear:{
        type:Number,
      },
      sslcMedium:{
        type:String
      },
      sslctotalmarks:{
        type:String,
      },
    },
    // 12th
     hsc:{
      hsQualification:{
         type:String,
      },
      hsBoard:{
        type:String,
      },
      hsPassedYear:{
        type:Number,
      },
      hsMedium:{
        type:String
      },
      hstotalmarks:{
        type:String,
      },
    },
    
    // graduation/diploma
    ugraduation_diploma:{
      ugQualification:{
        type:String,
      },
      ugCourse:{
        type:String,
      },
      ugSpecialization:{
        type:String,
      },
      ugCourseType:{
        type:String,
      },
      ugCourseDurationFrom:{
        type:String,
      },
      ugCourseDurationTo:{
        type:String,
      },
      ugGradingSystem:{
        type:String,
      },
      ugMarks:{
        type:String,
      },
    },
    // pg
    pg:{
      pgQualification:{
         type:String,
      },
      pgCourse:{
        type:String,
      },
      pgSpecialization:{
        type:String,
      },
      pgCourseType:{
        type:String,
      },
      pgCourseDurationFrom:{
        type:String,
      },
      pgCourseDurationTo:{
        type:String,
      },
      pgGradingSystem:{
        type:String,
      },
      pgMarks:{
        type:String,
      },
  
    },
     // docterate
     doctrate_mphil:{
      drQualification:{
        type:String,
      },
      drCourse:{
        type:String,
      },
      drSpecialization:{
        type:String,
      },
      drCourseType:{
        type:String,
      },
      drCourseDurationFrom:{
        type:String,
      },
      drCourseDurationTo:{
        type:String,
      },
      drGradingSystem:{
        type:String,
      },
      drMarks:{
        type:String,
      },
    },
    
  },
  {
    timestamps: true,
  }
);
const KeySkill = mongoose.model('candidateDetail', keySkillSchema);
const candidatePostjobSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      userId:{
        type:String
      },
      jobId:{
        type:String,
      },
      status:{
        type:Boolean,
        default:true,
      },
      approvedStatus:{
        type:String,
        default:"Applied"
      },
      employerCommand:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const CandidatePostjob = mongoose.model('candidatePostjob', candidatePostjobSchema);
  const candidateSaveJobSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      userId:{
        type:String
      },
      savejobId:{
        type:String,
      },
      status:{
        type:Boolean,
        default:true,
      },
      active:{
          type:Boolean,
          default:true,
      }
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
      userId:{
        type:String,
      },
      search:{
        type:Array,
      },
      experience:{
        type:Number,
      },
      location:{
        type:String,
      },
      preferredindustry:{
        type:String,
      },
      salary:{
        type:Number,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const CandidateSearchjobCandidate = mongoose.model('candidateSearchjob', candidateSearchjobCandidateSchema);

  const candidataSearchEmployerSetSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      userId:{
        type:String,
      },
      keyskill:{
        type:Array,
      },
      experienceMonth:{
        type:Number,
      },
      experienceYear:{
        type:Number,
      },
      location:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
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
      userId:{
        type:String,
      },
      search:{
        type:Array,
      },
      experience:{
        type:Number,
      },
      location:{
        type:String,
      },
      preferredindustry:{
        type:String,
      },
      salary:{
        type:Number,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const CandidateRecentSearchjobCandidate = mongoose.model('candidateRecentSearchjob', candidateRecentSearchjobCandidateSchema);
module.exports = {KeySkill, CandidatePostjob, CandidateSaveJob, CandidateSearchjobCandidate, candidataSearchEmployerSet, CandidateRecentSearchjobCandidate} ;