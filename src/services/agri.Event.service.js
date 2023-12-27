const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { AgriCandidate, AgriEventSlot, SlotBooking, IntrestedCandidate } = require('../models/agri.Event.model');
const { EventRegister } = require('../models/climb-event.model');
const moment = require('moment');
const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const { pipeline } = require('nodemailer/lib/xoauth2');

const createAgriEvent = async (req) => {
  let findByMobile = await AgriCandidate.findOne({ mobile: req.body.mobile });
  if (findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Exists');
  }
  let findByEmial = await AgriCandidate.findOne({ mail: req.body.mail });
  if (findByEmial) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'E-mail Number Already Exists');
  }
  let creations = await AgriCandidate.create(req.body);
  return creations;
};

const createSlots = async (req, res) => {
  let date = req.body;
  const dateTimeString = `${date.date} ${date.slot}`;
  const momentObject = moment(dateTimeString, 'YYYY-MM-DD hh:mm A');
  const isoDateTime = momentObject.toISOString();
  let datas = { ...date };
  const slots = await AgriEventSlot.create(datas);
  return slots;
};

const slotDetailsAgriHR = async () => {
  let slots = await AgriEventSlot.aggregate([
    { $match: { Type: 'HR' } },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const slotDetailsAgriTch = async () => {
  let slots = await AgriEventSlot.aggregate([
    { $match: { Type: 'TECH' } },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const updateCandidate = async (req) => {
  let id = req.params.id;
  let body = req.body;
  let findUser = await AgriCandidate.findById(id);
  if (!findUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate not found');
  }
  let creations = { ...body, ...{ booked: true } };
  findUser = await AgriCandidate.findByIdAndUpdate({ _id: id }, creations, { new: true });
};

const getUserById = async (req) => {
  let id = req.params.id;
  let findUser = await AgriCandidate.findById(id);
  if (!findUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate not found');
  }
  return findUser;
};

const createCandidateReview = async (req) => {
  const body = req.body;
  let creations = await AgriCandidate.create(body);
  return creations;
};

const imageUploadAgriCand = async (req) => {
  let id = req.params.id;
  let findCand = await AgriCandidate.findById(id);
  if (!findCand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not Found');
  }
  if (req.file) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'jobresume',
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (err, res) => {
        if (err) {
          reject(err);
        } else {
        }
      });
    });
  }
};

const ExcelDatas = async (req) => {
  if (req.file) {
    const workbook = XLSX.read(req.file.buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const emailColumnIndex = rows[0].findIndex((cell) => cell.includes('Email'));
    const extractedData = [];
    const emailsDats = [];
    const contacts = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const contactNumberRegex = /\b\d{10}\b/;
    const headerRow = rows[0];
    const nameIndex = headerRow.indexOf('Name');
    const emailIndex = headerRow.indexOf('Email');
    const contactNumberIndex = headerRow.indexOf('Contact No');

    rows.slice(1).forEach((row) => {
      const name = row[nameIndex];
      const email = row[emailIndex];
      const contactNumber = row[contactNumberIndex];
      if (email && emailRegex.test(email) && contactNumber && contactNumberRegex.test(contactNumber)) {
        extractedData.push({ name, email, contactNumber });
        emailsDats.push(email);
        contacts.push(contactNumber);
      }
    });
    const queryMail = { mail: { $in: emailsDats } };
    const queryContact = { mobileNumber: { $in: contacts } };

    let MatchedDatas = await EventRegister.aggregate([
      {
        $match: { $or: [queryMail, queryContact] },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          email: '$mail',
          mobileNumber: 1,
          currentLocation: 1,
          education: 1,
          year_of_passedout: 1,
          uploadResume: 1,
        },
      },
    ]);
    const matchedEmails = new Set(MatchedDatas.map((item) => item.email));
    const unmatchedObjects = extractedData.filter((item) => !matchedEmails.has(item.email));
    return { UnMatchedDatas: unmatchedObjects, MatchedDatas: MatchedDatas };
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Upload file');
  }
};

const getAgriCandidates = async (req) => {
  const AgriCandidates = await AgriCandidate.aggregate([
    {
      $match: { active: true },
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: { Role: 'HR Volunteer' } }],
        as: 'HRcandidates',
      },
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: { Role: { $ne: 'HR Volunteer' } } }],
        as: 'Techcandidates',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        mail: 1,
        createdAt: 1,
        HRIntrest: { $size: '$HRcandidates' },
        TechIntrest: { $size: '$Techcandidates' },
        status: { $ifNull: ['$status', 'Pending'] },
      },
    },
  ]);
  return AgriCandidates;
};

const getIntrestedByCand_Role = async (req) => {
  let role = req.params.role;
  let Role;
  if (role === 'HR') {
    Role = 'HR Volunteer';
  } else {
    Role = 'TECH Volunteer';
  }
  let id = req.params.id;
  let time = new Date().getTime();
  let today = moment().format('DD-MM-YYYY');
  console.log(today);
  let value = await IntrestedCandidate.aggregate([
    {
      $match: {
        candId: id,
        Role: Role,
      },
    },
    {
      $addFields: { slotIdnew: '$slotId' },
    },
    {
      $lookup: {
        from: 'volunteers',
        localField: 'volunteerId',
        foreignField: '_id',
        as: 'volunteer',
      },
    },
    {
      $unwind: '$volunteer',
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: 'volunteerId',
        pipeline: [{ $match: { endTime: { $lt: time } } }],
        foreignField: 'volunteerId',
        as: 'Completedslots',
      },
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: 'volunteerId',
        pipeline: [{ $match: { DateTime: { $gt: time } } }],
        foreignField: 'volunteerId',
        as: 'upComming',
      },
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        pipeline: [{ $match: { status: 'Intrested' } }, { $group: { _id: null, total: { $sum: 1 } } }],
        foreignField: '_id',
        as: 'Pending',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$Pending',
      },
    },
    // Today Pending
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        pipeline: [{ $match: { slotDate: today, status: 'Intrested' } }, { $group: { _id: null, total: { $sum: 1 } } }],
        foreignField: '_id',
        as: 'TodayPending',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$TodayPending',
      },
    },
    // Today Upcomming
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        pipeline: [
          { $match: { status: 'Approved', DateTime: { $gt: time } } },
          { $group: { _id: null, total: { $sum: 1 } } },
        ],
        foreignField: '_id',
        as: 'TodayUpcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$TodayUpcoming',
      },
    },
    {
      $project: {
        _id: 1,
        Name: '$volunteer.name',
        slotIdnew: 1,
        status: 1,
        slotId: 1,
        volunteerId: '$volunteer._id',
        pastRecord: { $size: '$Completedslots' },
        upComming: { $size: '$upComming' },
        Pending: { $ifNull: ['$Pending.total', 0] },
        TodayPending: { $ifNull: ['$TodayPending.total', 0] },
        TodayUpcoming: { $ifNull: ['$TodayUpcoming.total', 0] },
      },
    },
  ]);

  return value;
};

const getCandidateById = async (req) => {
  let id = req.params.id;
  let values = await AgriCandidate.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate not found');
  }
  return values;
};

const getCandBy = async (req) => {
  const { mob_email } = req.body;
  let findByEmail = await AgriCandidate.findOne({ mail: mob_email });
  let findBymobile = await AgriCandidate.findOne({ mobile: mob_email });
  if (findByEmail != null) {
    return findByEmail;
  } else if (findBymobile != null) {
    return findBymobile;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Mobile OR Email Address');
  }
};

const createSlotBooking = async (req) => {
  const body = req.body;
  body.forEach(async (e) => {
    let iso = new Date(moment(e.date + ' ' + e.time, 'DD-MM-YYYY hh:mm A').toISOString()).getTime();
    let end = moment(iso).add(30, 'minutes');
    let creations = await SlotBooking.create({
      candId: e.candId,
      date: e.date,
      time: e.time,
      Type: e.Type,
      DateTime: iso,
      endTime: end,
    });
    await AgriCandidate.findByIdAndUpdate({ _id: e.candId }, { slotbooked: true }, { new: true });
    return creations;
  });
  return { message: 'Slot Booking created successfully' };
};

const AdminApprove = async (req) => {
  const { slotId, volunteerId, intrestId } = req.body;
  let getIntrested = await IntrestedCandidate.findById(intrestId);
  if (!getIntrested) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Intrested Data Not Found, Some One Deleted From Database 😠');
  }
  let getSlots = await SlotBooking.findById(slotId);
  if (!getSlots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Data Not Found, Some One Deleted From Database 😠');
  }
  getIntrested = await IntrestedCandidate.findByIdAndUpdate({ _id: intrestId }, { status: 'Approved' }, { new: true });
  getSlots = await SlotBooking.findByIdAndUpdate({ _id: slotId }, { volunteerId: volunteerId }, { new: true });
  return getIntrested;
};

module.exports = {
  createAgriEvent,
  createSlots,
  slotDetailsAgriHR,
  slotDetailsAgriTch,
  updateCandidate,
  getUserById,
  createCandidateReview,
  ExcelDatas,
  getAgriCandidates,
  getCandidateById,
  getCandBy,
  createSlotBooking,
  getIntrestedByCand_Role,
  AdminApprove,
};
