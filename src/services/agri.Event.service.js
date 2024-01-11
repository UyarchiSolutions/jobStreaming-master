const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const {
  AgriCandidate,
  AgriEventSlot,
  SlotBooking,
  IntrestedCandidate,
  agriCandReview,
  BookedSlot,
} = require('../models/agri.Event.model');
const { EventRegister } = require('../models/climb-event.model');
const moment = require('moment');
const AWS = require('aws-sdk');
const XLSX = require('xlsx');

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
  const { Role, candId, rating, values, volunteerId, lang } = req.body;
  let creations;
  if (Role == 'Tech Volunteer') {
    let skillAvg = 0;
    let attAvg = 0;
    if (rating && rating.length > 0) {
      let total = 0;
      rating.forEach((e) => {
        total += e.rating ? parseInt(e.rating) : 0;
      });
      skillAvg = total / rating.length;
    }
    let attTotal = 0;
    attTotal += values.coding ? parseInt(values.coding) : 0;
    attTotal += values.communication ? parseInt(values.communication) : 0;
    attTotal += values.individualCode ? parseInt(values.individualCode) : 0;
    attTotal += values.logic ? parseInt(values.logic) : 0;
    attTotal += values.projectUnderStanding ? parseInt(values.projectUnderStanding) : 0;
    attTotal += values.underStating ? parseInt(values.underStating) : 0;
    attAvg = attTotal / 6;
    let datas = {
      skillAVG: skillAvg,
      attrAVG: attAvg,
      coding: values.coding ? values.coding : 0,
      communication: values.communication ? values.communication : 0,
      logic: values.logic ? values.logic : 0,
      projectUnderStanding: values.projectUnderStanding ? values.projectUnderStanding : 0,
      underStating: values.underStating ? values.underStating : 0,
      Role: Role,
      candId: candId,
      volunteerId: volunteerId,
      rating: rating ? rating : [],
    };
    creations = await agriCandReview.create(datas);
  } else {
    let langAVG = 0;
    let attrAVG = 0;
    if (lang && lang.length > 0) {
      let total = 0;
      let attTotal = 0;

      lang.forEach((e) => {
        total += e.rating ? parseInt(e.rating) : 0;
      });
      langAVG = total / lang.length;
      attTotal += values.attitude ? parseInt(values.attitude) : 0;
      attTotal += values.performance ? parseInt(values.performance) : 0;
      attrAVG = attTotal / 2;
      let data = {
        langAVG: langAVG,
        attrAVG: attrAVG,
        Role: Role,
        candId: candId,
        volunteerId: volunteerId,
        lang: lang,
        expCTC: values.expCTC ? values.expCTC : '',
        curCTC: values.curCTC ? values.curCTC : '',
        noticePeriod: values.noticePeriod ? values.noticePeriod : '',
        performance: values.performance ? values.performance : '',
        attitude: values.attitude ? values.attitude : '',
        desc: values.desc ? values.desc : '',
      };
      creations = await agriCandReview.create(data);
    }
  }

  return creations;
};

const ResumeUploadAgriCand = async (req) => {
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
      s3.upload(params, async (err, res) => {
        if (err) {
          reject(err);
        } else {
          let resumeUploaded = await AgriCandidate.findByIdAndUpdate(
            { _id: id },
            { resumeUrl: res.Location },
            { new: true }
          );
        }
        resolve(resumeUploaded);
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
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: { Type: 'Tech' } }, { $sort: { createdAt: -1 } }, { $limit: 1 }],
        as: 'TechID',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$TechID',
      },
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }, { $match: { Type: 'HR' } }],
        as: 'HRID',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$HRID',
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
        clear: 1,
        techId:{ $ifNull: ['$TechID._id', null] } ,
        hrId: { $ifNull: ['$HRID._id', null] },
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
    Role = 'Tech Volunteer';
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
  let Counts = await IntrestedCandidate.aggregate([
    {
      $match: {
        candId: id,
        Role: Role,
        status: 'Approved',
      },
    },
  ]);

  return { value, Counts };
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
    if (findByEmail.slotbooked == true) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Your Slot Booking has Completed');
    }
    return findByEmail;
  } else if (findBymobile != null) {
    if (findBymobile.slotbooked == true) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Your Slot Booking has Completed');
    }
    return findBymobile;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Mobile OR Email Address');
  }
};

const createSlotBooking = async (req) => {
  const body = req.body;
  let findExistSlot = await BookedSlot.findOne({ candId: body.candId });
  if (findExistSlot) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your Interview Time Got Over ');
  }
  let slotCreate = await BookedSlot.create({ slots: body.slot, candId: body.candId });
  await body.slot.forEach(async (e) => {
    let iso = new Date(moment(e.date + ' ' + e.time, 'DD-MM-YYYY hh:mm A').toISOString()).getTime();
    let end = moment(iso).add(30, 'minutes');
    let creations = await SlotBooking.create({
      candId: e.candId,
      date: e.date,
      time: e.time,
      Type: e.Type,
      DateTime: iso,
      endTime: end,
      slotId: slotCreate._id,
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
  let findMatches = await IntrestedCandidate.find({
    slotId: slotId,
    candId: getIntrested.candId,
    status: 'Approved',
  }).count();
  console.log(findMatches);
  if (findMatches >= 2) {
    throw new ApiError(httpStatus.BAD_REQUEST, ' Maximum Approval Limit exceeded ');
  }
  getIntrested = await IntrestedCandidate.findByIdAndUpdate({ _id: intrestId }, { status: 'Approved' }, { new: true });
  getSlots = await SlotBooking.findByIdAndUpdate({ _id: slotId }, { volunteerId: volunteerId }, { new: true });
  return getIntrested;
};

const Undo = async (req) => {
  const id = req.params.id;
  console.log(id, 'params');
  let getIntrested = await IntrestedCandidate.findById(id);
  if (!getIntrested) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Data');
  }
  getIntrested = await IntrestedCandidate.findByIdAndUpdate({ _id: id }, { status: 'Intrested' }, { new: true });
  return getIntrested;
};

const clearCandidates = async (req) => {
  let id = req.params.id;
  let values = await AgriCandidate.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  values = await AgriCandidate.findByIdAndUpdate({ _id: id }, { clear: true }, { new: true });
  return values;
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
  Undo,
  clearCandidates,
  ResumeUploadAgriCand,
};
