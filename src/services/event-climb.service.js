const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { EventRegister, Eventslot } = require('../models/climb-event.model');
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

const slotDetails = async () => {
  let slots = await Eventslot.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
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
  console.log(100 >= 100);

  return slots;
};

const insertSlots = async (date) => {
  let slot = await Eventslot.create(date);
  return slot;
};

const getAllRegistered_Candidate = async () => {
  let values = await EventRegister.find();
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

module.exports = {
  createEventCLimb,
  slotDetails,
  insertSlots,
  getAllRegistered_Candidate,
  getSlotDetails_WithCandidate,
  getCandidateBySlot,
};
