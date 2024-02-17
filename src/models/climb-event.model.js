const mongoose = require('mongoose');
const { v4 } = require('uuid');

const ClicmbEventRegisterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Type: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    name: {
      type: String,
    },
    mail: {
      type: String,
      unique: true,
    },
    gender: {
      type: String,
    },
    mobileNumber: {
      type: String,
      unique: true,
    },
    currentLocation: {
      type: String,
    },
    education: {
      type: String,
    },
    year_of_passedout: {
      type: String,
    },
    resumeName: {
      type: String,
    },
    uploadResume: {
      type: String,
    },
    date: {
      type: String,
    },
    slot: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    terms: {
      type: Boolean,
    },
    profiles: {
      type: Object,
      default: {},
    },
    profileUpdated: {
      type: Boolean,
      default: false,
    },
    sortcount: {
      type: Number,
    },
    testEntry: {
      type: Boolean,
      default: false,
    },
    testProfile: {
      type: Object,
    },
    testNewUser: {
      type: String,
    },
    testDate: {
      type: Date,
    },
    intrest: {
      type: Array,
      default: [],
    },
    NewTestEntry: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const EventRegister = mongoose.model('climbeventregister', ClicmbEventRegisterSchema);

const event_slot = new mongoose.Schema(
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
    sortcount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Eventslot = mongoose.model('eventslot', event_slot);

const event_slot_Test = new mongoose.Schema(
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
    sortcount: {
      type: Number,
    },
    dateTime: {
      type: Date,
    },
    Type: String,
  },
  { timestamps: true }
);
const EventslotTest = mongoose.model('eventslottest', event_slot_Test);

const event_slot_TestNew = new mongoose.Schema(
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
    sortcount: {
      type: Number,
    },
    dateTime: {
      type: Date,
    },
    Type: String,
  },
  { timestamps: true }
);

const EventslotTestNew = mongoose.model('eventslottestnew', event_slot_TestNew);

const event_slot_Intern = new mongoose.Schema(
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
    sortcount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const EventslotIntern = mongoose.model('eventslotintern', event_slot_Intern);

const ClicmbEventRegisterInternSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Type: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    name: {
      type: String,
    },
    mail: {
      type: String,
      unique: true,
    },
    gender: {
      type: String,
    },
    mobileNumber: {
      type: String,
      unique: true,
    },
    institution: String,
    courseName: String,
    courseTiming: String,
    do_you_work: String,
    pincode: String,
    year_of_passedout: {
      type: String,
    },
    resumeName: {
      type: String,
    },
    uploadResume: {
      type: String,
    },
    date: {
      type: String,
    },
    slot: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    terms: {
      type: Boolean,
    },
    profiles: {
      type: Object,
      default: {},
    },
    profileUpdated: {
      type: Boolean,
      default: false,
    },
    sortcount: {
      type: Number,
    },
    testEntry: {
      type: Boolean,
      default: false,
    },
    testProfile: {
      type: Object,
    },
    testNewUser: {
      type: String,
    },
    testDate: {
      type: Date,
    },
    intrest: {
      type: Array,
      default: [],
    },
    slotId: {
      type: String,
    },
    user_type: {
      type: String,
    }
  },
  { timestamps: true }
);

const EventRegisterIntern = mongoose.model('climbeventregisterintern', ClicmbEventRegisterInternSchema);

module.exports = { EventRegister, Eventslot, EventslotTest, EventslotTestNew, EventslotIntern, EventRegisterIntern };
