const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const moment = require('moment');

const employerDetailsSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    jobTittle: {
      type: String,
    },
    adminActive: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Boolean,
      default: true,
    },
    venue: {
      type: String,
    },
    apply_method: {
      type: String,
    },
    recruiterId: {
      type: String,
    },
    recruiterList: {
      type: String,
    },
    cities: {
      type: Array,
    },
    recruiterList1: {
      type: String,
    },
    userId: {
      type: String,
    },
    designation: {
      type: String,
    },
    recruiterName: {
      type: String,
    },
    recruiterNumber: {
      type: Number,
    },
    // recruiterNumber: {
    //   type: Number,
    // },
    recruiterEmail: {
      type: String,
    },
    jobDescription: {
      type: String,
    },
    keySkill: {
      type: Array,
    },
    salaryRangeFrom: {
      type: Number,
    },
    salaryRangeTo: {
      type: Number,
    },
    preferredindustry: {
      type: String,
    },
    educationalQualification: {
      type: String,
    },
    experienceYear: {
      type: String,
    },
    experiencemonth: {
      type: String,
    },
    experienceFrom: {
      type: Number,
    },
    experienceTo: {
      type: Number,
    },
    interviewType: {
      type: String,
    },
    candidateDescription: {
      type: String,
    },
    salaryDescription: {
      type: String,
    },
    urltoApply: {
      type: String,
    },
    workplaceType: {
      type: String,
    },
    industry: {
      type: String,
    },
    preferedIndustry: {
      type: String,
    },
    functionalArea: {
      type: String,
    },
    role: {
      type: String,
    },
    jobLocation: {
      type: Array,
    },
    templateName: {
      type: String,
    },
    jobortemplate: {
      type: String,
    },
    employmentType: {
      type: String,
    },
    openings: {
      type: String,
    },
    signature: {
      type: String,
    },
    qualification: {
      type: Array,
    },
    qualificationDummy: {
      type: String,
    },
    // course: {
    //   type: Array,
    // },
    // specialization: {
    //   type: Array,
    // },
    openings: {
      type: Number,
    },
    interviewstartDate: {
      type: String,
    },
    interviewendDate: {
      type: String,
    },
    interviewFromTime: {
      type: String,
    },
    interviewToTime: {
      type: String,
    },
    interviewerName: {
      type: String,
    },
    interviewerContactNumber: {
      type: Number,
    },
    perksBenefits: {
      type: String,
    },
    startTime: {
      type: String,
    },
    education: {
      type: Array,
    },
    endTime: {
      type: String,
    },
    location: {
      type: String,
    },
    validity: {
      type: Number,
    },
    location: {
      type: Array,
    },
    department: {
      type: String,
    },
    roleCategory: {
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
    expiredDate: {
      type: String,
    },
    adminStatus: {
      type: String,
      default: 'Pending',
    },
    active: {
      type: Boolean,
      default: true,
    },
    education_object: {
      type: Array,
    },
    education_array: {
      type: Array,
    },
    education_match: {
      type: Array,
    },
    status: {
      type: String,
      default: "Published"
    },
    appliedCount: {
      type: Number,
      default: 0
    },
    expireAt: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);
const EmployerDetails = mongoose.model('employerDetail', employerDetailsSchema);
const employerPostDraftSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    jobTittle: {
      type: String,
    },
    userId: {
      type: String,
    },
    designation: {
      type: String,
    },
    recruiterName: {
      type: String,
    },
    contactNumber: {
      type: Number,
    },
    jobDescription: {
      type: String,
    },
    keySkill: {
      type: Array,
    },
    salaryRangeFrom: {
      type: Number,
    },
    salaryRangeTo: {
      type: Number,
    },
    preferredindustry: {
      type: String,
    },
    educationalQualification: {
      type: String,
    },
    experienceFrom: {
      type: Number,
    },
    experienceTo: {
      type: Number,
    },
    interviewType: {
      type: String,
    },
    candidateDescription: {
      type: String,
    },
    workMode: {
      type: String,
    },
    industry: {
      type: String,
    },
    preferedIndustry: {
      type: String,
    },
    functionalArea: {
      type: String,
    },
    role: {
      type: String,
    },
    jobLocation: {
      type: String,
    },
    employmentType: {
      type: String,
    },
    openings: {
      type: Number,
    },
    interviewstartDate: {
      type: String,
    },
    interviewstartDate: {
      type: String,
    },
    interviewendDate: {
      type: String,
    },
    interviewTime: {
      type: String,
    },
    interviewerName: {
      type: String,
    },
    interviewerContactNumber: {
      type: Number,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    location: {
      type: String,
    },
    validity: {
      type: Number,
    },
    date: {
      type: String,
      // default:moment().format('YYYY-MM-DD')
    },
    time: {
      type: String,
      // default:moment().format('HHmmss')
    },
    expiredDate: {
      type: String,
    },
    adminStatus: {
      type: String,
      default: 'Pending',
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
const EmployerPostDraft = mongoose.model('employerPostDraft', employerPostDraftSchema);
const employerPostjobSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    postajobId: {
      type: String,
    },
    candidateId: {
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
const EmployerPostjob = mongoose.model('employerPostjob', employerPostjobSchema);
const EmployercommentSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    candidateId: {
      type: String,
    },
    comment: {
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
const Employercomment = mongoose.model('Employercomment', EmployercommentSchema);
const EmployerMailTemplateSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    templateName: {
      type: String,
    },
    jobTitle: {
      type: String,
    },
    experienceFrom: {
      type: Number,
    },
    experienceTo: {
      type: Number,
    },
    ctc: {
      type: String,
    },
    jobLocation: {
      type: String,
    },
    keySkills: {
      type: Array,
    },
    jobDescription: {
      type: String,
    },
    signature: {
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
const EmployerMailTemplate = mongoose.model('EmployerMailTemplate', EmployerMailTemplateSchema);
const EmployerMailNotificationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    candidateId: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    mailId: {
      type: String,
    },
    mail: {
      type: String,
    },
    email: {
      type: String,
    },
    signature: {
      type: String,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
    date: {
      type: String,
      default: moment().format('YYYY-MM-DD'),
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
const EmployerMailNotification = mongoose.model('EmployerMailNotification', EmployerMailNotificationSchema);
const RecruiterSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    recruiterName: {
      type: String,
    },
    email: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    date: {
      type: String,
      default: moment().format('YYYY-MM-DD'),
    },
    active: {
      type: Boolean,
      default: true,
    },
    activity: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);
const Recruiters = mongoose.model('recruiter', RecruiterSchema);

const EmployeOtpSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  mobile: {
    type: Number,
  },
  empId: {
    type: String,
  },
  OTP: {
    type: Number,
  },
  verify: {
    type: Boolean,
    default: true,
  },
  expired: {
    type: Boolean,
    default: true,
  },
  otpExpiedTime: {
    type: Number,
  },
  setpassword: {
    type: Boolean,
    default: false,
  },
});

const EmployerOTP = mongoose.model('empotp', EmployeOtpSchema);






const JobpoststreamSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  DateIso: {
    type: Number,
  },
  date: {
    type: String,
  },
  created: {
    type: Date,
  },
  userId: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending'
  },
  datetime: {
    type: String,
  },
  startTime: {
    type: Number,
  },
  endTime: {
    type: Number,
  },
  actualEnd: {
    type: Number,
  },
  active: {
    type: Boolean,
    default: true,
  },
  post: {
    type: String,
  },
  agoraID: {
    type: String,
  },
  goLive: {
    type: Boolean,
    default: false,
  },
  appliedCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Jobpoststream = mongoose.model('jobpoststream', JobpoststreamSchema);




const jobpostApplyschema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    status: {
      type: String,
      default: 'Applied'
    },
    active: {
      type: Boolean,
      default: true,
    },
    jobpostId: {
      type: String,
    },
    joineduser: {
      type: String,
    },
    candidateID: {
      type: String,
    },
    type: {
      type: String,
    },
    streamId: {
      type: String,
    },
    device: {
      type: Object,

    }

  },
  { timestamps: true }
);

const Applypost = mongoose.model('jobpostapply', jobpostApplyschema);





const jobpostsavedschema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    status: {
      type: String,
      default: 'Saved'
    },
    active: {
      type: Boolean,
      default: true,
    },
    jobpostId: {
      type: String,
    },
    joineduser: {
      type: String,
    },
    candidateID: {
      type: String,
    },
    type: {
      type: String,
    },
    streamId: {
      type: String,
    },
    device: {
      type: Object,
    }
  },
  { timestamps: true }
);

const Savedpost = mongoose.model('jobpostsaved', jobpostsavedschema);



module.exports = {
  EmployerDetails,
  EmployerPostjob,
  EmployerPostDraft,
  Employercomment,
  EmployerMailTemplate,
  EmployerMailNotification,
  Recruiters,
  EmployerOTP,
  Jobpoststream,
  Applypost,
  Savedpost
};
