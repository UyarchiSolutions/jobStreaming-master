const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const { AgriCandidate, AgriEventSlot } = require('../models/agri.Event.model');
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
  let datas = { ...date, ...{ dateTime: isoDateTime } };
  const slots = await AgriEventSlot.create(datas);
  return slots;
};

const slotDetailsAgri = async () => {
  let slots = await AgriEventSlot.aggregate([
    { $match: { active: true } },
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
    const matchedEmails = new Set(MatchedDatas.map((item) => item.mobileNumber));
    const unmatchedObjects = extractedData.filter((item) => !matchedEmails.has(item.contactNumber));
    return { UnMatchedDatas: unmatchedObjects, MatchedDatas: MatchedDatas };
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Upload file');
  }
};

module.exports = {
  createAgriEvent,
  createSlots,
  slotDetailsAgri,
  updateCandidate,
  getUserById,
  createCandidateReview,
  ExcelDatas,
};
