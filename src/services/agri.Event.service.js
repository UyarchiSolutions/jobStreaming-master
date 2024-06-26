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

const { Volunteer } = require('../models/vlounteer.model');

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
  var dateString = `${date.date} ${date.slot}`;
  var dateParts = dateString.split(/[\s:-]+/);
  var year = parseInt(dateParts[2], 10);
  var month = parseInt(dateParts[1], 10) - 1;
  var day = parseInt(dateParts[0], 10);
  var hour = parseInt(dateParts[3], 10);
  var minute = parseInt(dateParts[4], 10);

  var datetime = new Date(year, month, day, hour, minute);
  var timestamp = datetime.getTime();

  // console.log(isoDateTime)
  let datas = { ...date, ...{ dateTime: timestamp } };
  const slots = await AgriEventSlot.create(datas);
  return slots;
};

const getslots = async (req, res) => {
  let page = req.query.page == '' || req.query.page == null || req.query.page == null ? 0 : parseInt(req.query.page);
  const slots = await AgriEventSlot.aggregate([
    { $sort: { dateTime: -1 } },
    {
      $skip: 20 * parseInt(page),
    },
    {
      $limit: 20,
    },
  ]);
  const next = await AgriEventSlot.aggregate([
    { $sort: { dateTime: -1 } },
    {
      $skip: 20 * parseInt(page + 1),
    },
    {
      $limit: 20,
    },
  ]);
  return { slots, next: next.length != 0 };
}

const slotDetailsAgriHR = async () => {
  let nowdate = new Date().getTime();
  let slots = await AgriEventSlot.aggregate([
    { $match: { Type: 'HR', dateTime: { $gt: nowdate } } },
    { $sort: { dateTime: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
        dateTime: { $push: { dateTime: '$dateTime', _id: "$_id" } },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
        dateTime: 1
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const slotDetailsAgriTch = async () => {

  let nowdate = new Date().getTime();
  let slots = await AgriEventSlot.aggregate([
    { $match: { Type: 'Tech', dateTime: { $gt: nowdate } } },
    { $sort: { dateTime: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
        dateTime: { $push: { dateTime: '$dateTime', _id: "$_id" } },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
        dateTime: 1
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
const link_send = async (req) => {
  let id = req.params.id;
  let findUser = await AgriCandidate.findById(id);
  if (!findUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate not found');
  }
  findUser.status = 'Link Shared';
  findUser.save();
  return findUser;
}

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
      rating: values.rating ? values.rating : '',
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

  let find_intest = await IntrestedCandidate.findOne({ candId: candId, volunteerId: volunteerId, });
  if (find_intest) {
    find_intest.rating = 'Rated';
    find_intest.save();
  }
  return creations;
};

const ResumeUploadAgriCand = async (req) => {
  let id = req.params.id;
  console.log(id, 87976)
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
          resolve(resumeUploaded);
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

  let statusMatch = { active: true }
  let search = { active: true }
  let timeout = { active: true }
  let nowTime = new Date().getTime();
  let end = moment(nowTime).add(1, 'days');
  end = new Date(end).getTime();
  if (req.query.status != 'all' && req.query.status != 'Emergency' && req.query.status != 'Timeout') {
    statusMatch = { status: { $eq: req.query.status } }
  }
  if (req.query.status == 'Emergency') {
    statusMatch = {
      status: { $in: ['Slot Chosen', 'Waiting For Approval', 'Approved', 'Cleared'] }

    }
    timeout = {
      $or: [{ tech_time_onday: { $eq: true } }, { hr_time_onday: { $eq: true } }]
    }
  }
  if (req.query.status == 'Timeout') {
    statusMatch = { status: { $in: ['Slot Chosen', 'Waiting For Approval', 'Approved', 'Cleared'] } }

    timeout = {
      $or: [{ tech_time_timeout: { $eq: true } }, { hr_time_timeout: { $eq: true } }]
    }
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
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [
          { $match: { $and: [{ Type: { $eq: 'Tech' } }, { streamStatus: { $ne: "Completed" } }, { streamStatus: { $ne: "On-Going" } }] } },
          {
            $addFields: {
              onday: { $and: [{ $lt: ["$DateTime", end] }, { $gt: ["$DateTime", nowTime] }] },
              timeout: { $lt: ["$DateTime", nowTime] },
            }
          },
          { $limit: 1 },
        ],
        as: 'tech_time',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$tech_time',
      },
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [
          { $match: { $and: [{ Type: { $eq: 'HR' } }, { streamStatus: { $ne: "Completed" } }, { streamStatus: { $ne: "On-Going" } }] } },
          {
            $addFields: {
              onday: { $and: [{ $lt: ["$DateTime", end] }, { $gt: ["$DateTime", nowTime] }] },
              timeout: { $lt: ["$DateTime", nowTime] },

            }
          },
          { $limit: 1 },
          // { $group: { _id: { active: "$active" } } }
        ],
        as: 'hr_time',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$hr_time',
      },
    },
    {
      $addFields: {
        tech_time_onday: { $ifNull: ["$tech_time.onday", false] },
        tech_time_timeout: { $ifNull: ["$tech_time.timeout", false] },
        tech_time_streamStatus: { $ifNull: ["$tech_time.streamStatus", "Completed"] },
        hr_time_onday: { $ifNull: ["$hr_time.onday", false] },
        hr_time_timeout: { $ifNull: ["$hr_time.timeout", false] },
        hr_time_streamStatus: { $ifNull: ["$hr_time.streamStatus", "Completed"] },
      },
    },
    { $match: timeout },
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
        tech_time_onday: 1,
        tech_time_timeout: 1,
        tech_time_streamStatus: 1,
        hr_time_onday: 1,
        hr_time_timeout: 1,
        hr_time_streamStatus: 1,
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
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [
          { $match: { $and: [{ Type: { $eq: 'Tech' } }, { streamStatus: { $ne: "Completed" } }, { streamStatus: { $ne: "On-Going" } }] } },
          {
            $addFields: {
              onday: { $and: [{ $lt: ["$DateTime", end] }, { $gt: ["$DateTime", nowTime] }] },
              timeout: { $lt: ["$DateTime", nowTime] },
            }
          },
          { $limit: 1 },
        ],
        as: 'tech_time',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$tech_time',
      },
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [
          { $match: { $and: [{ Type: { $eq: 'HR' } }, { streamStatus: { $ne: "Completed" } }, { streamStatus: { $ne: "On-Going" } }] } },
          {
            $addFields: {
              onday: { $and: [{ $lt: ["$DateTime", end] }, { $gt: ["$DateTime", nowTime] }] },
              timeout: { $lt: ["$DateTime", nowTime] },

            }
          },
          { $limit: 1 },
          // { $group: { _id: { active: "$active" } } }
        ],
        as: 'hr_time',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$hr_time',
      },
    },
    {
      $addFields: {
        tech_time_onday: { $ifNull: ["$tech_time.onday", false] },
        tech_time_timeout: { $ifNull: ["$tech_time.timeout", false] },
        tech_time_streamStatus: { $ifNull: ["$tech_time.streamStatus", "Completed"] },
        hr_time_onday: { $ifNull: ["$hr_time.onday", false] },
        hr_time_timeout: { $ifNull: ["$hr_time.timeout", false] },
        hr_time_streamStatus: { $ifNull: ["$hr_time.streamStatus", "Completed"] },
      },
    },
    { $match: timeout },
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
  let upcomming_status = { active: true }
  let upcomming_pending = { active: true }
  if (role === 'HR') {
    Role = 'HR Volunteer';
    upcomming_status = { hrStatus: { $eq: 'Approved' } }
    upcomming_pending = { hrStatus: { $eq: 'Pending' } }
  } else {
    upcomming_status = { status: { $eq: 'Approved' } }
    upcomming_pending = { status: { $eq: 'Pending' } }
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
      $lookup: {
        from: 'intrestedcandidates',
        localField: 'volunteerId',
        foreignField: 'volunteerId',
        pipeline: [
          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_status] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'approved_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$approved_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: 'volunteerId',
        foreignField: 'volunteerId',
        pipeline: [
          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_pending] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'pending_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$pending_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: 'volunteerId',
        foreignField: 'volunteerId',
        pipeline: [

          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_status, { streamDate: { $eq: today } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'same_approved_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$same_approved_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: 'volunteerId',
        foreignField: 'volunteerId',
        pipeline: [

          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_pending, { streamDate: { $eq: today } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'same_pending_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$same_pending_upcoming"

      }
    },

    {
      $addFields: {
        approved_upcoming: { $ifNull: ["$approved_upcoming.count", 0] },
        pending_upcoming: { $ifNull: ["$pending_upcoming.count", 0] },
        same_approved_upcoming: { $ifNull: ["$same_approved_upcoming.count", 0] },
        same_pending_upcoming: { $ifNull: ["$same_pending_upcoming.count", 0] },
      }
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
        approved_upcoming: 1,
        pending_upcoming: 1,
        same_approved_upcoming: 1,
        same_pending_upcoming: 1
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

const get_interested_hrs = async (req) => {

  let upcomming_status = { status: { $eq: 'Approved' } }
  let upcomming_pending = { status: { $eq: 'Pending' } }
  let Role = 'HR Volunteer';

  let time = new Date().getTime();
  let today = moment().format('DD-MM-YYYY');



  let id = req.query.id;
  let candidate = await AgriCandidate.findById(id);
  if (!candidate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Upload file');
  }

  let match_experience = { Role: { $eq: "HR Volunteer" } }


  let coreExperienceFrom = candidate.experience_year;
  let coreExperienceTo = candidate.experience_month;
  let month = (coreExperienceTo * 100) / 1200;
  totalexp = coreExperienceFrom + month;
  if (req.query.match == 'match') {
    match_experience = { experience: { $gt: totalexp } }
  }
  else {
    match_experience = { experience: { $lt: totalexp } }
  }
  let slots = await SlotBooking.findOne({ candId: candidate._id, Type: "HR" });
  if (!slots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Not Found');
  }
  let start = slots.DateTime;



  let volunteer = await Volunteer.aggregate([
    {
      $match: {
        $and: [
          { Role: { $eq: "HR Volunteer" } },
          { password: { $ne: null } }
        ]
      }
    },

    {
      $addFields: {
        experience: { $add: [{ $divide: [{ $multiply: ["$hrExperienceTo", 100] }, 1200] }, "$hrExperienceFrom"] }
      },
    },

    {
      $match: { $and: [match_experience] },
    },

    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [{
          $match: {
            $and: [{ Role: 'HR Volunteer' }, { candId: { $eq: id } }]
          }
        }],
        as: 'intrestedcandidates',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$intrestedcandidates"
      }
    },
    {
      $addFields: {
        alreadyIntrested: { $ifNull: ["$intrestedcandidates.active", false] },
        alreadyIntrested_status: { $ifNull: ["$intrestedcandidates.status", null] },
      },
    },
    { $match: { $and: [{ alreadyIntrested: { $eq: false } }] } },
    { $unset: "intrestedcandidates" },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [
          {
            $match: {
              $and: [{ Role: 'HR Volunteer' }, { candId: { $ne: id } }, { startTime: { $eq: start } }]
            },
          },
          {
            $lookup: {
              from: 'agricandidates',
              localField: 'candId',
              foreignField: '_id',
              as: 'agricandidates',
            },
          },
          { $unwind: "$agricandidates" },
          {
            $addFields: {
              matchvalue: {
                $cond: {
                  if: { $eq: ["$status", 'Approved'] },
                  then: true,
                  else: {
                    $cond: {
                      if: { $in: ['$agricandidates.status', ['Slot Chosen', 'Approved', 'Waiting For Approval']] },
                      then: true,
                      else: false,
                    },
                  },
                },
              }
            }
          },
          { $unset: "agricandidates" }
        ],
        as: 'intrestedcandidatessss',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$intrestedcandidatessss"
      }
    },
    { $addFields: { committed: { $ifNull: ["$intrestedcandidatessss.matchvalue", false] } } },
    { $match: { $and: [{ committed: { $eq: false } }] } },



    // upcomming
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [
          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_status] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'approved_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$approved_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [
          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_pending] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'pending_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$pending_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [

          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_status, { streamDate: { $eq: today } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'same_approved_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$same_approved_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [

          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_pending, { streamDate: { $eq: today } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'same_pending_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$same_pending_upcoming"

      }
    },

    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [{ $match: { endTime: { $lt: time } } }],
        as: 'Completedslots',
      },
    },

    {
      $addFields: {
        approved_upcoming: { $ifNull: ["$approved_upcoming.count", 0] },
        pending_upcoming: { $ifNull: ["$pending_upcoming.count", 0] },
        same_approved_upcoming: { $ifNull: ["$same_approved_upcoming.count", 0] },
        same_pending_upcoming: { $ifNull: ["$same_pending_upcoming.count", 0] },
        pastRecord: { $size: '$Completedslots' },
      }
    },

  ])

  return volunteer;
}





const get_interested_tech = async (req) => {



  let upcomming_status = { status: { $eq: 'Approved' } }
  let upcomming_pending = { status: { $eq: 'Pending' } }
  let Role = 'Tech Volunteer';

  let time = new Date().getTime();
  let today = moment().format('DD-MM-YYYY');


  let id = req.query.id;
  let candidate = await AgriCandidate.findById(id);
  if (!candidate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Upload file');
  }

  let match_experience = { Role: { $eq: "Tech Volunteer" } }
  let keySkillSearch = { Role: { $eq: "Tech Volunteer" } }


  let coreExperienceFrom = candidate.experience_year;
  let coreExperienceTo = candidate.experience_month;
  let month = (coreExperienceTo * 100) / 1200;
  totalexp = coreExperienceFrom + month;
  if (req.query.match == 'match') {
    match_experience = { experience: { $gt: totalexp } }
  }
  else {
    match_experience = { experience: { $lt: totalexp } }
  }

  let volunSkills = candidate.skills;
  if (volunSkills.length > 0) {
    let arr = [];
    volunSkills.forEach((e) => {
      arr.push({ skills: { $elemMatch: { $regex: e, $options: 'i' } } });
    });
    keySkillSearch = { $or: arr };
  }

  let slots = await SlotBooking.findOne({ candId: candidate._id, Type: "Tech" });
  if (!slots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Not Found');
  }
  let start = slots.DateTime;


  let volunteer = await Volunteer.aggregate([
    {
      $match: {
        $and: [
          { Role: { $eq: "Tech Volunteer" } },
          { password: { $ne: null } },
          keySkillSearch
        ]
      }
    },
    {
      $addFields: {
        experience: { $add: [{ $divide: [{ $multiply: ["$coreExperienceTo", 100] }, 1200] }, "$coreExperienceFrom"] }
      },
    },
    {
      $match: { $and: [match_experience] },
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [{
          $match: {
            $and: [{ Role: 'Tech Volunteer' }, { candId: { $eq: id } }]
          }
        }],
        as: 'intrestedcandidates',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$intrestedcandidates"
      }
    },
    {
      $addFields: {
        alreadyIntrested: { $ifNull: ["$intrestedcandidates.active", false] },
        alreadyIntrested_status: { $ifNull: ["$intrestedcandidates.status", null] },
      },
    },
    { $match: { $and: [{ alreadyIntrested: { $eq: false } }] } },
    { $unset: "intrestedcandidates" },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [
          {
            $match: {
              $and: [{ Role: 'Tech Volunteer' }, { candId: { $ne: id } }, { startTime: { $eq: start } }]
            },
          },
          {
            $lookup: {
              from: 'agricandidates',
              localField: 'candId',
              foreignField: '_id',
              as: 'agricandidates',
            },
          },
          { $unwind: "$agricandidates" },
          {
            $addFields: {
              matchvalue: {
                $cond: {
                  if: { $eq: ["$status", 'Approved'] },
                  then: true,
                  else: {
                    $cond: {
                      if: { $in: ['$agricandidates.status', ['Slot Chosen', 'Approved', 'Waiting For Approval']] },
                      then: true,
                      else: false,
                    },
                  },
                },
              }
            }
          },
          { $unset: "agricandidates" }
        ],
        as: 'intrestedcandidatessss',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$intrestedcandidatessss"
      }
    },
    { $addFields: { committed: { $ifNull: ["$intrestedcandidatessss.matchvalue", false] } } },
    { $match: { $and: [{ committed: { $eq: false } }] } },



    // upcomming
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [
          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_status] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'approved_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$approved_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [
          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_pending] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'pending_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$pending_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [

          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_status, { streamDate: { $eq: today } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'same_approved_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$same_approved_upcoming"

      }
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [

          { $addFields: { datess: { $toDate: "$startTime" } } },
          {
            $addFields: {
              "streamDate": {
                "$dateToString": {
                  "format": "%d-%m-%Y",
                  "date": "$datess"
                }
              }
            }
          },
          { $match: { $and: [{ Role: { $eq: Role } }, { endTime: { $gt: time } }, upcomming_pending, { streamDate: { $eq: today } }] } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        as: 'same_pending_upcoming',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$same_pending_upcoming"

      }
    },

    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'volunteerId',
        pipeline: [{ $match: { endTime: { $lt: time } } }],
        as: 'Completedslots',
      },
    },

    {
      $addFields: {
        approved_upcoming: { $ifNull: ["$approved_upcoming.count", 0] },
        pending_upcoming: { $ifNull: ["$pending_upcoming.count", 0] },
        same_approved_upcoming: { $ifNull: ["$same_approved_upcoming.count", 0] },
        same_pending_upcoming: { $ifNull: ["$same_pending_upcoming.count", 0] },
        pastRecord: { $size: '$Completedslots' },
      }
    },

  ])

  return volunteer;


}

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
  let findByEmail = await AgriCandidate.find({ $or: [{ mail: mob_email }, { mobile: mob_email }] });
  if (findByEmail.length == 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Not exist');
  }
  if (findByEmail.slotbooked == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your Slot Booking has Completed');
  }
  return findByEmail[0];

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
    date: body.slot[0].date,
    slot_date: body.slot[1].date,
    slot_time: body.slot[1].time,
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


const slotBooking_new = async (req) => {
  const body = req.body;
  let userId = req.userId;
  let findCand = await AgriCandidate.findById(userId);
  let techslot = await AgriEventSlot.findById(body.techslot);
  if (findCand.slotBook) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Already Booked');
  }

  if (!techslot) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tech Slot Not Found');
  }

  let hrslot = await AgriEventSlot.findById(body.hrslot);

  if (!hrslot) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'HR Slot Not Found');
  }

  let emailData = {
    mail: findCand.mail,
    name: findCand.name,
    date: hrslot.date,
    slot: hrslot.slot,
    slot_date: techslot.date,
    slot_time: techslot.slot,
  };
  let _hr_end = moment(hrslot.dateTime).add(30, 'minutes');
  let _tech_end = moment(techslot.dateTime).add(30, 'minutes');
  await SlotBooking.create({ candId: findCand._id, date: hrslot.date, time: hrslot.slot, Type: "HR", DateTime: hrslot.dateTime, endTime: _hr_end, slotId: hrslot._id, });
  await SlotBooking.create({ candId: findCand._id, date: techslot.date, time: techslot.slot, Type: "Tech", DateTime: techslot.dateTime, endTime: _tech_end, slotId: techslot._id, });

  await AgriCandidate.findByIdAndUpdate({ _id: findCand._id }, { slotbooked: true, slotBook: true, status: "Slot Chosen" }, { new: true });
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
    if (cand.interest_HR < 2 || cand.interest_TECH < 2) {
      cand.status = 'Slot Chosen';
    }
    else {
      cand.status = 'Waiting For Approval';
    }
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
      if (cand.interest_HR < 2) {
        cand.status = 'Slot Chosen';
      }
      else {
        cand.status = 'Waiting For Approval';
      }
    }
  }
  else {
    cand = await AgriCandidate.findByIdAndUpdate({ _id: getIntrested.candId }, { approved_HR: cand.approved_HR - 1 }, { new: true });
    if (cand.approved_HR == 2 && cand.approved_TECH == 2) {
      cand.status = 'Approved';
    }
    else {
      if (cand.interest_TECH < 2) {
        cand.status = 'Slot Chosen';
      }
      else {
        cand.status = 'Waiting For Approval';
      }
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
        pipeline: [{ $match: { Role: { $ne: "Tech Volunteer" } } }, { $group: { _id: null, TechRating: { $sum: "$rating" }, count: { $sum: 1 } } }],
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
        pipeline: [{ $match: { Role: "Tech Volunteer" } }, { $group: { _id: null, TechRating: { $sum: "$rating" }, count: { $sum: 1 } } }],
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
      $addFields: {
        TechRatting: { $divide: ["$techrating.TechRating", "$techrating.count"] },
        tech_review_Count: { $ifNull: ["$techrating.count", 0] },
        HrRatting: { $divide: ["$hrrating.TechRating", "$hrrating.count"] },
        hr_review_Count: { $ifNull: ["$hrrating.count", 0] },
      }
    },
    {
      $addFields: {
        TechRatting: { $ifNull: ["$TechRatting", 0] },
        HrRatting: { $ifNull: ["$HrRatting", 0] }
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
        HrRatting: 1,
        TechRatting: 1,
        tech_review_Count: 1,
        hr_review_Count: 1
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
  let now_time = new Date().getTime();
  let Cand = await AgriCandidate.findById(id);
  let values = await SlotBooking.aggregate([
    { $match: { candId: id } },
    {
      $lookup: {
        from: 'democloundrecords',
        localField: '_id',
        foreignField: 'chennel',
        pipeline: [{ $match: { $and: [{ videoLink_mp4: { $ne: null } }, { videoLink_mp4: { $ne: "Pending" } }] } }],
        as: 'StreamRecord',
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
      $addFields: {
        streamStatus: {
          $cond: {
            if: { $ne: ["$streamStatus", 'On-Going'] },
            then: "$streamStatus",
            else: {
              $cond: {
                if: { $lt: ["$endTime", now_time] },
                then: "Completed",
                else: "$streamStatus",
              },
            }
          }
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
        StreamRecord: "$StreamRecord",
        Name: "$volunteer.name",
        linkstatus: 1,
        retingCount: 1,
        candidate_join: 1,
        teaserURL: 1,
        teaseruploadBy: 1,
        teaseruploadDate: 1,
        teaserUpload: 1,
        trailerURL: 1,
        traileruploadDate: 1,
        trailerUpload: 1,
        traileruploadBy: 1,
        editedURL: 1,
        editedUpload: 1,
        editeduploadBy: 1,
        editeduploadDate: 1,
      }
    }
  ]);
  return { slot: values, Cand };
};


const get_hr_review = async (req) => {
  let candId = req.query.id;
  let review = await IntrestedCandidate.aggregate([
    { $match: { $and: [{ Role: { $eq: "HR Volunteer" } }, { hrStatus: { $eq: "Approved" } }, { candId: { $eq: candId } }] } },
    {
      $lookup: {
        from: 'agricandreviews',
        localField: 'volunteerId',
        foreignField: 'volunteerId',
        pipeline: [{ $match: { $and: [{ Role: { $eq: 'HR Volunteer' } }, { candId: { $eq: candId } }] } }],
        as: 'HRreview',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$HRreview"
      }
    },

    {
      $lookup: {
        from: 'volunteers',
        localField: 'volunteerId',
        foreignField: '_id',
        as: 'volunteers',
      },
    },
    { $unwind: "$volunteers" },
    {
      $addFields: { name: '$volunteers.name' },
    },
    { $unset: "volunteers" }

  ])

  return review;

}

const get_tech_review = async (req) => {
  let candId = req.query.id;
  let review = await IntrestedCandidate.aggregate([
    { $match: { $and: [{ Role: { $eq: "Tech Volunteer" } }, { status: { $eq: "Approved" } }, { candId: { $eq: candId } }] } },
    {
      $lookup: {
        from: 'agricandreviews',
        localField: 'volunteerId',
        foreignField: 'volunteerId',
        pipeline: [{ $match: { $and: [{ Role: { $eq: 'Tech Volunteer' } }, { candId: { $eq: candId } }] } }],
        as: 'Techreview',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: "$Techreview"
      }
    },
    {
      $lookup: {
        from: 'volunteers',
        localField: 'volunteerId',
        foreignField: '_id',
        as: 'volunteers',
      },
    },
    { $unwind: "$volunteers" },
    {
      $addFields: { name: '$volunteers.name' },
    },
    { $unset: "volunteers" }
  ])

  return review;

}

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
  get_hr_review,
  get_tech_review,
  link_send,
  getslots,
  get_interested_hrs,
  get_interested_tech,
  slotBooking_new
};
