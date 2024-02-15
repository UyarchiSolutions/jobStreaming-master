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

const { Democloudrecord } = require('../models/liveStreaming/demo.realestate.model');

const { EventRegister } = require('../models/climb-event.model');
const moment = require('moment');
const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const { agriCandidateSlotBookedMail } = require('./email.service');
const { update_email_send_otp } = require('./candidateRegistration.service');

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
  // console.log(isoDateTime)
  let datas = { ...date, ...{ dateTime: momentObject } };
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
  const { Role, candId, values, volunteerId, lang } = req.body;
  let creations;
  if (Role == 'Tech Volunteer') {
    let datas = {
      Role: Role,
      candId: candId,
      volunteerId: volunteerId,
      coding: values.coding ? values.coding : '',
      comments: values.comments ? values.comments : '',
      communication: values.communication ? values.communication : '',
      individualCode: values.individualCode ? values.individualCode : '',
      logic: values.logic ? values.logic : '',
      projectUnderStanding: values.projectUnderStanding ? values.projectUnderStanding : '',
      rating: values.ratings ? values.ratings : '',
      underStating: values.underStating ? values.underStating : '',
      skillsrated: values.skillsrated ? values.skillsrated : [],
    };
    creations = await agriCandReview.create(datas);
  } else {

    let data = {
      Role: Role,
      candId: candId,
      volunteerId: volunteerId,
      rating: values.ratings ? values.ratings : '',
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
  rating = await agriCandReview.find({ Role: Role, candId: candId, }).count();
  if (Role == 'Tech Volunteer') {
    let slot = await SlotBooking.findOne({ Type: 'Tech', candId: candId });
    if (slot && rating == 2) {
      slot.rating = 'Rated';
      slot.save();
    }
  }
  else {
    let slot = await SlotBooking.findOne({ Type: 'HR', candId: candId });
    if (slot && rating == 2) {
      slot.rating = 'Rated';
      slot.save();
    }
  }
  rating = await agriCandReview.find({ candId: candId, }).count();
  if (rating == 4) {
    let findCand = await AgriCandidate.findById(candId);
    findCand.status = 'Rating Complete';
    findCand.save();
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

  let statusMatch = { active: true }
  let search = { active: true }

  if (req.query.status != 'all') {
    statusMatch = { status: { $eq: req.query.status } }
  }
  if (req.query.search != null && req.query.search != '' && req.query.search != 'null') {
    search = { $or: [{ name: { $regex: req.query.search, $options: "i" } }, { mobile: { $regex: req.query.search, $options: "i" } }] }

  }

  if (req.query.status == null || req.query.status == '') {
    statusMatch = { active: true }

  }


  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);



  const AgriCandidates = await AgriCandidate.aggregate([
    {
      $match: { $and: [{ active: { $eq: true } }, statusMatch, search] },
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
        pipeline: [{ $sort: { createdAt: -1 } }, { $match: { Type: 'HR' } }, { $limit: 1 }],
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
        status: 1,
        clear: 1,
        techId: { $ifNull: ['$TechID._id', null] },
        hrId: { $ifNull: ['$HRID._id', null] },
        hrClear: 1,
        interest_HR: 1,
        interest_TECH: 1,
        approved_HR: 1,
        approved_TECH: 1,
        HR_DateTime: { $ifNull: ['$HRID.DateTime', null] },
        Tech_DateTime: { $ifNull: ['$TechID.DateTime', null] },
        HR_endTime: { $ifNull: ['$HRID.endTime', null] },
        TECH_endTime: { $ifNull: ['$TechID.endTime', null] },
      },
    },
    {
      $skip: 20 * parseInt(page),
    },
    {
      $limit: 20,
    },
  ]);


  const next = await AgriCandidate.aggregate([
    {
      $match: { $and: [{ active: { $eq: true } }, statusMatch, search] },
    },
    {
      $skip: 20 * (parseInt(page) + 1),
    },
    {
      $limit: 20,
    },
  ]);

  return { value: AgriCandidates, next: next.length != 0 };

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
        hrStatus: 1,
      },
    },
  ]);
  let Counts;
  if (role == 'HR') {
    Counts = await IntrestedCandidate.aggregate([
      {
        $match: {
          candId: id,
          Role: Role,
          hrStatus: 'Approved',
        },
      },
    ]);
  } else {
    Counts = await IntrestedCandidate.aggregate([
      {
        $match: {
          candId: id,
          Role: Role,
          status: 'Approved',
        },
      },
    ]);
  }

  return { value, Counts };
};

const getCandidateById = async (req) => {
  let id = req.params.id;
  let values = await AgriCandidate.findById(id);
  if (!values) {
    let find = await SlotBooking.findById(id);
    id = find.candId;
  }
  values = await AgriCandidate.aggregate([
    { $match: { $and: [{ _id: id }] } },
    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: { Type: 'Tech' } }],
        as: 'Tech',
      },
    },
    { $unwind: "$Tech" },
    {
      $addFields: { techDate: '$Tech.DateTime' },
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: { Type: 'HR' } }],
        as: 'HR',
      },
    },
    { $unwind: "$HR" },
    {
      $addFields: { hrDate: '$HR.DateTime' },
    },

    { $unset: "HR" },
    { $unset: "Tech" },

  ])

  return values[0];
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
  let findCand = await AgriCandidate.findById(body.candId);
  console.log(findCand);
  let findExistSlot = await BookedSlot.findOne({ candId: body.candId });
  if (findExistSlot) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your Interview Time Got Over ');
  }
  let emailData = {
    mail: findCand.mail,
    name: findCand.name,
    date: body.slot[0].date,
    slot: body.slot[0].time,
  };
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
    await AgriCandidate.findByIdAndUpdate({ _id: e.candId }, { slotbooked: true, status: "Slot Chosen" }, { new: true });
    return creations;
  });
  await agriCandidateSlotBookedMail(emailData);
  return { message: 'Slot Booking created successfully' };
};

const AdminApprove = async (req) => {
  const { slotId, volunteerId, intrestId, Role } = req.body;
  let getIntrested = await IntrestedCandidate.findById(intrestId);
  if (!getIntrested) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Intrested Data Not Found, Some One Deleted From Database 😠');
  }

  let cand = await AgriCandidate.findById(getIntrested.candId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate  not Fount 😠');
  }
  let getSlots = await SlotBooking.findById(slotId);
  if (!getSlots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Data Not Found, Some One Deleted From Database 😠');
  }
  console.log(req.body);
  if (getIntrested.Role != 'Tech Volunteer') {
    let findMatches = await IntrestedCandidate.find({
      slotId: slotId,
      candId: getIntrested.candId,
      hrStatus: 'Approved',
      Role: 'HR Volunteer',
    }).count();
    if (findMatches >= 2) {
      throw new ApiError(httpStatus.BAD_REQUEST, ' Maximum Approval Limit exceeded ');
    }

    cand.approved_HR = cand.approved_HR + 1;
    // cand.save();
    getIntrested = await IntrestedCandidate.findByIdAndUpdate({ _id: intrestId }, { hrStatus: 'Approved' }, { new: true });
    getSlots = await SlotBooking.findByIdAndUpdate({ _id: slotId }, { volunteerId: volunteerId }, { new: true });
  } else {
    let findMatches = await IntrestedCandidate.find({
      slotId: slotId,
      candId: getIntrested.candId,
      status: 'Approved',
      Role: 'Tech Volunteer',
    }).count();
    console.log(findMatches);
    if (findMatches >= 2) {
      throw new ApiError(httpStatus.BAD_REQUEST, ' Maximum Approval Limit exceeded ');
    }
    cand.approved_TECH = cand.approved_TECH + 1;
    getIntrested = await IntrestedCandidate.findByIdAndUpdate({ _id: intrestId }, { status: 'Approved' }, { new: true });
    getSlots = await SlotBooking.findByIdAndUpdate({ _id: slotId }, { volunteerId: volunteerId }, { new: true });
  }

  if (cand.approved_HR == 2 && cand.approved_TECH == 2) {
    cand.status = 'Approved';

  }
  else {
    cand.status = 'Waiting For Approval';
  }

  cand.save();

  return getIntrested;
};

const Undo = async (req) => {
  const id = req.params.id;
  console.log(id, 'params');
  let getIntrested = await IntrestedCandidate.findById(id);
  if (!getIntrested) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Data');
  }
  getIntrested = await IntrestedCandidate.findByIdAndUpdate({ _id: id }, { status: 'Pending', hrStatus: "Pending" }, { new: true });
  let cand = await AgriCandidate.findById(getIntrested.candId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate not found');
  }
  if (getIntrested.Role == 'Tech Volunteer') {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: getIntrested.candId }, { approved_TECH: cand.approved_TECH - 1 }, { new: true });
    if (cand.approved_HR == 2 && cand.approved_TECH == 2) {
      cand.status = 'Approved';
    }
    else {
      cand.status = 'Waiting For Approval';
    }
  }
  else {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: getIntrested.candId }, { approved_HR: cand.approved_HR - 1 }, { new: true });
    if (cand.approved_HR == 2 && cand.approved_TECH == 2) {
      cand.status = 'Approved';
    }
    else {
      cand.status = 'Waiting For Approval';
    }
  }
  cand.save();


  return getIntrested;
};

const clearCandidates = async (req) => {
  let id = req.params.id;
  let role = req.params.role;
  let values = await AgriCandidate.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  // if (role == 'HR') {
  //   values = await AgriCandidate.findByIdAndUpdate({ _id: id }, { hrClear: true }, { new: true });
  // } else {
  //   values = await AgriCandidate.findByIdAndUpdate({ _id: id }, { clear: true }, { new: true });
  // }
  values = await AgriCandidate.findByIdAndUpdate({ _id: id }, { clear: true, hrClear: true, status: "Cleared" }, { new: true });

  return values;
};

const getCandidatesReport = async (req) => {
  const { cand, location } = req.query;
  let CandiMatch = { _id: { $ne: null } };
  let locationMatch = { _id: { $ne: null } };

  if (cand && cand != '' && cand != null && cand != 'null') {
    CandiMatch = { $or: [{ name: { $regex: cand, $options: "i" } }, { mobile: { $regex: cand, $options: "i" } }] }
  }

  if (location && location != '' && location != null && location != 'null') {
    locationMatch = { location: { $regex: location, $options: "i" } }
  }

  let values = await AgriCandidate.aggregate([
    {
      $match: { $and: [CandiMatch, locationMatch] },
    },
    {
      $lookup: {
        from: "agricandreviews",
        localField: "_id",
        foreignField: "candId",
        pipeline: [{ $match: { Role: { $ne: "Tech Volunteer" } } }, { $group: { _id: null, hrRating: { $sum: "$attrAVG" } } }],
        as: "hrrating"
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$hrrating"

      }
    },
    {
      $lookup: {
        from: "agricandreviews",
        localField: "_id",
        foreignField: "candId",
        pipeline: [{ $match: { Role: "Tech Volunteer" } }, { $group: { _id: null, TechRating: { $sum: "$skillAVG" }, } }],
        as: "techrating"
      }
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$techrating"

      }
    },
    {
      $project: {
        _id: 1,
        Education: 1,
        active: 1,
        skills: 1,
        language: 1,
        booked: 1,
        slotbooked: 1,
        intrest: 1,
        techIntrest: 1,
        status: 1,
        clear: 1,
        hrClear: 1,
        name: 1,
        mail: 1,
        mobile: 1,
        location: 1,
        Instituitionname: 1,
        affiliateduniversity: 1,
        Education: 1,
        course: 1,
        yearOfPassing: 1,
        dob: 1,
        createdAt: 1,
        updatedAt: 1,
        hrRating: { $ifNull: ["$hrrating.hrRating", 0] },
        techRating: { $ifNull: ["$techrating.TechRating", 0] }
      }
    }
  ]);

  return values;
};

const active_Inactive_candidate = async (req) => {
  let id = req.params.id
  let findCand = await AgriCandidate.findById(id);
  if (!findCand) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Candidate Not Found Some Delete From DataBase")
  }
  if (findCand.active) {
    findCand.active = false
  } else {
    findCand.active = true
  }
  findCand.save();
  return findCand
}

const getStreamDetailsByCand = async (req) => {
  let id = req.params.id;
  let values = await SlotBooking.aggregate([
    { $match: { candId: id } },
    {
      $lookup: {
        from: 'democloundrecords',
        localField: '_id',
        foreignField: 'chennel',
        pipeline: [{ $match: { videoLink_mp4: { $ne: null } } }],
        as: 'StreamRecord',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$StreamRecord',
      },
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
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$volunteer',
      },
    },

    {
      $lookup: {
        from: 'agricandreviews',
        localField: 'candId',
        foreignField: 'candId',
        pipeline: [
          { $match: { Role: { $eq: "Tech Volunteer" } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'agricandreviews_tech',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$agricandreviews_tech',
      },
    },

    {
      $lookup: {
        from: 'agricandreviews',
        localField: 'candId',
        foreignField: 'candId',
        pipeline: [
          { $match: { Role: { $eq: "HR Volunteer" } } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'agricandreviews_hr',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$agricandreviews_hr',
      },
    },
    {
      $addFields: {
        retingCount: {
          $cond: {
            if: { $eq: ["$Type", 'HR'] },
            then: { $ifNull: ['$agricandreviews_hr.count', 0] },
            else: { $ifNull: ['$agricandreviews_tech.count', 0] },
          },
        }
      },
    },

    {
      $project: {
        _id: 1,
        start: "$DateTime",
        endTime: 1,
        Type: 1,
        rating: 1,
        streamStatus: 1,
        videoURL: "$StreamRecord.videoLink_mp4",
        Name: "$volunteer.name",
        linkstatus: 1,
        retingCount: 1
      }
    }
  ]);
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
  getCandidatesReport,
  getStreamDetailsByCand,
  active_Inactive_candidate,
};
