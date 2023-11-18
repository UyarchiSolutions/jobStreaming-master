const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const { EventRegister } = require('../models/climb-event.model');
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
    return new Promise((resolve) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          console.error(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL } };
        let creations = await EventRegister.create(datas);
        resolve(creations);
      });
    });
  }
};

const slotDetails = async () => {
  let datas = [
    {
      date: '20-11-2023',
      time: ['10:00 AM', '11:30 AM', '2:30 PM', '4:30 PM'],
    },
    {
      date: '21-11-2023',
      time: ['10:00 AM', '11:30 AM', '2:30 PM', '4:30 PM'],
    },
    {
      date: '22-11-2023',
      time: ['10:00 AM', '11:30 AM', '2:30 PM', '4:30 PM'],
    },
    {
      date: '23-11-2023',
      time: ['10:00 AM', '11:30 AM', '2:30 PM', '4:30 PM'],
    },
  ];
  return datas;
};

module.exports = {
  createEventCLimb,
  slotDetails,
};
