const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcryptjs');

const AgriCandidateSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
    },
    mail: {
      type: String,
    },
    mobile: {
      type: String,
    },
    gender: {
      type: String,
    },
    location: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    skills: {
      type: Array,
      default: [],
    },
    dob: {
      type: String,
    },
    language: {
      type: Array,
      default: [],
    },
    booked: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    slotbooked: {
      type: Boolean,
      default: false,
    },
    Instituitionname: {
      type: String,
    },
    affiliateduniversity: {
      type: String,
    },
    Education: {
      type: String,
    },
    course: {
      type: String,
    },
    yearOfPassing: {
      type: String,
    },
    intrest: {
      type: Array,
      default: [],
    },
    techIntrest: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: 'Active',
    },
    interest_HR: {
      type: Number,
      default: 0,
    },
    interest_TECH: {
      type: Number,
      default: 0,
    },
    approved_HR: {
      type: Number,
      default: 0,
    },
    approved_TECH: {
      type: Number,
      default: 0,
    },
    clear: {
      type: Boolean,
      default: false,
    },
    resumeUrl: {
      type: String,
    },
    hrClear: {
      type: Boolean,
      default: false,
    },
    experience_year: {
      type: Number,
      default: 0,
    },
    experience_month: {
      type: Number,
      default: 0,
    },
    setPassword: {
      type: Boolean,
      default: false
    },
    emailVerify: {
      type: String,
      default: "Pending"
    },
    mobileVerify: {
      type: String,
      default: "Pending"
    },
    password: {
      type: String,
    },
    slotBook: {
      type: Boolean,
      default: false

    }

  },
  { timestamps: true }
);

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
AgriCandidateSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

AgriCandidateSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */

const AgriCandidate = mongoose.model('agricandidate', AgriCandidateSchema);

const event_slot_AgriSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    date: {
      type: String,
    },
    slot: {
      type: String,
    },
    no_of_count: {
      type: Number,
    },
    booked_count: {
      type: Number,
      default: 0,
    },
    sortCount: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    Type: {
      type: String,
    },
    dateTime: {
      type: Number,
    },
  },
  { timestamps: true }
);

const AgriEventSlot = mongoose.model('AgriEventSlot', event_slot_AgriSchema);

const agriCandReviewSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    volunteerId: {
      type: String,
    },
    rating: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    desc: {
      type: String,
    },
    candId: {
      type: String,
    },
    streamId: {
      type: String,
    },
    Role: {
      type: String,
    },
    underStating: {
      type: String,
    },
    logic: {
      type: String,
    },
    coding: {
      type: String,
    },
    projectUnderStanding: {
      type: String,
    },
    communication: {
      type: String,
    },
    individualCode: {
      type: String,
    },
    comments: {
      type: String,
    },
    skillAVG: {
      type: Number,
    },
    attrAVG: {
      type: Number,
    },
    langAVG: {
      type: Number,
    },
    lang: {
      type: Array,
      default: [],
    },
    skillsrated: {
      type: Array,
      default: [],
    },
    curCTC: {
      type: String,
    },
    expCTC: {
      type: String,
    },
    noticePeriod: {
      type: String,
    },
    performance: {
      type: String,
    },
    attitude: {
      type: String,
    },
  },
  { timestamps: true }
);

const agriCandReview = mongoose.model('AgriCandReview', agriCandReviewSchema);

const IntrestCandidateSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    candId: {
      type: String,
    },
    volunteerId: {
      type: String,
    },
    status: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    activatedDate: {
      type: Date,
    },
    Role: {
      type: String,
    },
    slotId: {
      type: String,
    },
    slotDate: {
      type: String,
    },
    slotTime: {
      type: String,
    },
    startTime: {
      type: Number,
    },
    endTime: {
      type: Number,
    },
    clear: {
      type: Boolean,
      default: false,
    },
    hrStatus: {
      type: String,
      default: 'Pending',
    },
    rating: {
      type: String,
      default: 'Pending',
    },
    streamStatus: {
      type: String,
      default: 'Pending',
    }
  },
  { timestamps: true }
);

const IntrestedCandidate = mongoose.model('intrestedCandidate', IntrestCandidateSchema);

const SlotBookingSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Type: {
      type: String,
    },
    candId: {
      type: String,
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
    DateTime: {
      type: Number,
    },
    streamStatus: {
      type: String,
      default: 'Pending',
    },
    agoraAppId: {
      type: String,
    },
    otp_verifiyed: {
      type: String,
    },
    linkstatus: {
      type: String,
      default: 'Pending',
    },
    rating: {
      type: String,
      default: 'Pending',
    },
    endTime: {
      type: Number,
    },
    volunteerId: {
      type: String,
    },
    slotId: {
      type: String,
    },
    current_watching_stream: {
      type: Number,
      default: 0,
    },
    mainhost: {
      type: String,
    },
    candidate_join: {
      type: Boolean,
      default: false,
    }

  },
  { timestamps: true }
);

const SlotBooking = mongoose.model('SlotBooking', SlotBookingSchema);

const BookedSlotsShema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    slots: {
      type: Array,
      default: [],
    },
    status: {
      type: String,
      default: 'Pending',
    },
    active: {
      type: Boolean,
      default: true,
    },
    candId: {
      type: String,
    },
  },
  { timestamps: true }
);

const BookedSlot = mongoose.model('agribookedslots', BookedSlotsShema);

const referenceSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    slotId: {
      type: Array,
    },
    userId: {
      type: String,
      default: 'Pending',
    },
    name_1: {
      type: String,
    },
    mobile_1: {
      type: Number,
    },
    designation_1: {
      type: String,
    },
    name_2: {
      type: String,
    },
    mobile_2: {
      type: Number,
    },
    designation_2: {
      type: String,
    },
  },
  { timestamps: true }
);

const Reference = mongoose.model('reference', referenceSchema);






const emailverifySchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },

    userId: {
      type: String,
    },
    type: {
      type: String,
    },
    mail: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    token: {
      type: String,
    },
    OTP: {
      type: Number,
    },
    emailverifyed: {
      type: Boolean,
      default: false,
    },
    mobileverifyed: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const Emailverify = mongoose.model('emailverify', emailverifySchema);





const otpverifySchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },

    userId: {
      type: String,
    },
    type: {
      type: String,
    },
    mail: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    OTP: {
      type: Number,
    },
    otpExpiedTime: {
      type: Number,

    },
    verify: {
      type: Boolean,
      default: false,
    },
    expired: {
      type: Boolean,
      default: false
    },
    DateIso: {
      type: Number,
    },
    mobile: {
      type: Number,
    }




  },
  { timestamps: true }
);

const OTPverify = mongoose.model('otpverify', otpverifySchema);



module.exports = {
  AgriCandidate,
  AgriEventSlot,
  agriCandReview,
  IntrestedCandidate,
  SlotBooking,
  BookedSlot,
  Reference,
  Emailverify,
  OTPverify
};
