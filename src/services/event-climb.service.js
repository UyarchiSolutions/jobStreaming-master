const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { EventRegister, Eventslot, EventslotTest } = require('../models/climb-event.model');
const AWS = require('aws-sdk');

const createEventCLimb = async (req) => {
  let body = req.body;
  let findByemail = await EventRegister.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegister.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
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
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL } };
        let findEnvent = await Eventslot.findOne({ slot: datas.slot, date: datas.date });
        if (findEnvent) {
          if (findEnvent.no_of_count >= findEnvent.booked_count) {
            findEnvent.booked_count = findEnvent.booked_count + 1;
            findEnvent.save();
            let creations = await EventRegister.create(datas);
            resolve(creations);
          } else {
            reject({ slot: 'Slot Engached' });
          }
        }
      });
    });
  }
};

const createTestCandidates = async (req) => {
  let body = req.body;
  let findByemail = await EventRegister.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegister.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
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
      s3.upload(params, async (err, data) => {
        if (err) {
          reject(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL, Type: 'Assesment' } };
        let creations = await EventRegister.create(datas);
        resolve(creations);
      });
    });
  }
};

const slotDetails = async () => {
  let slots = await Eventslot.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
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

const insertSlots = async (date) => {
  let slot = await Eventslot.create(date);
  return slot;
};

const insertSlotsTest = async (body) => {
  let date = body.body;
  const dateTimeString = `${date.date} ${date.slot}`;
  const momentObject = moment(dateTimeString, 'YYYY-MM-DD hh:mm A');
  const isoDateTime = momentObject.toISOString();
  let datas = { ...date, ...{ dateTime: isoDateTime } };
  let slot = await EventslotTest.create(datas);
  return slot;
};

const slotDetailsTest = async () => {
  let slots = await EventslotTest.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
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

const getAllRegistered_Candidate = async (query) => {
  let { key } = query;
  let matchCand = { active: true };
  if (key && key != null && key != 'null' && key != '') {
    matchCand = {
      $or: [{ mail: { $regex: key, $options: 'i' } }, { mobileNumber: { $regex: key, $options: 'i' } }],
    };
  }
  let values = await EventRegister.aggregate([
    {
      $match: matchCand,
    },
  ]);
  return values;
};

const getSlotDetails_WithCandidate = async () => {
  let values = await Eventslot.aggregate([
    {
      $lookup: {
        from: 'climbeventregisters',
        let: { eventDate: '$date', eventTime: '$slot' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$date', '$$eventDate'] }, { $eq: ['$slot', '$$eventTime'] }],
              },
            },
          },
        ],
        as: 'candidates',
      },
    },
    {
      $project: {
        _id: 1,
        booked_count: 1,
        date: 1,
        slot: 1,
        no_of_count: 1,
        createdAt: 1,
        candidates: { $size: '$candidates' },
        candList: '$candidates',
      },
    },
  ]);
  return values;
};

const getCandidateBySlot = async (req) => {
  const { date, time } = req.params;

  let values = await EventRegister.aggregate([
    {
      $match: {
        date: date,
        slot: time,
      },
    },
  ]);
  return values;
};

const CandidateLogin = async (req) => {
  const { mobileNumber } = req.body;
  let values = await EventRegister.findOne({ mobileNumber: mobileNumber });

  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*This number is not registered');
  }
  if (values.profileUpdated == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Your profile is already updated');
  }
  return values;
};

const getDetailsByCandidate = async (req) => {
  const userId = req.userId;
  let values = await EventRegister.findById(userId);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate user not found');
  }
  return values;
};

const updateProfileCandidate = async (req) => {
  const userId = req.userId;
  let values = await EventRegister.findById(userId);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  if (values.profileUpdated == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile Already Updated');
  }
  let bodyVal = req.body;
  values = await EventRegister.findByIdAndUpdate(
    { _id: values._id },
    { profiles: bodyVal, profileUpdated: true },
    { new: true }
  );
  return values;
};

const verify_cand = async (req) => {
  const { mob_email } = req.body;
  let findbyMobile = await EventRegister.findOne({ mobileNumber: mob_email });
  let findbyemail = await EventRegister.findOne({ mail: mob_email });

  if (findbyemail) {
    if (findbyemail.testEntry) {
      throw new ApiError(httpStatus.BAD_REQUEST, '*Your Profile Already Updated');
    } else {
      return findbyemail;
    }
  } else if (findbyMobile) {
    if (findbyMobile.testEntry) {
      throw new ApiError(httpStatus.BAD_REQUEST, '*Your Profile Already Updated');
    } else {
      return findbyMobile;
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Mobile Number Or E-mail Not Registered');
  }
};

const updateTestWarmy = async (req) => {
  let values = await EventRegister.findById(req.params.id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidates not found');
  }

  if (values.testEntry == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already You Profile Updated');
  }
  const bodyData = req.body;
  let findEnvent = await EventslotTest.findOne({ slot: bodyData.time, date: bodyData.date });
  if (findEnvent) {
    if (findEnvent.no_of_count >= findEnvent.booked_count) {
      findEnvent.booked_count = findEnvent.booked_count + 1;
      findEnvent.save();
      values = await EventRegister.findByIdAndUpdate(
        { _id: values._id },
        { testEntry: true, testProfile: bodyData, testNewUser: 'Yes' },
        { new: true }
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Engached');
  }
  return values;
};

const getTestUsers = async (req) => {
  const { key, action } = req.query;
  let matchCand = { active: true };

  if (key && key != null && key != 'null' && key != '') {
    matchCand = {
      $or: [{ mail: { $regex: key, $options: 'i' } }, { mobileNumber: { $regex: key, $options: 'i' } }],
    };
  }

  let values = await EventRegister.aggregate([
    {
      $match: {
        testEntry: true,
      },
    },
    { $match: matchCand },
  ]);
  return values;
};

const updateStatus = async (req) => {
  const body = req.body;
  const id = req.params.id;
  let values = await EventRegister.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not Found');
  }
  values = await EventRegister.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

module.exports = {
  createEventCLimb,
  slotDetails,
  insertSlots,
  getAllRegistered_Candidate,
  getSlotDetails_WithCandidate,
  getCandidateBySlot,
  CandidateLogin,
  getDetailsByCandidate,
  updateProfileCandidate,
  verify_cand,
  updateTestWarmy,
  insertSlotsTest,
  slotDetailsTest,
  createTestCandidates,
  getTestUsers,
  updateStatus,
};
