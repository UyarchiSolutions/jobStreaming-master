const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { ClimbCandidate } = require('../models/climb.cand.model');
const AWS = require('aws-sdk');

const createClimbCand = async (req) => {
  let findByMobile = await ClimbCandidate.findOne({ mobile: req.body.mobile });
  if (findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Exists');
  }
  let findByEmial = await ClimbCandidate.findOne({ mail: req.body.mail });
  if (findByEmial) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'E-mail Number Already Exists');
  }
  let creations = await ClimbCandidate.create(req.body);
  return creations;
};

const ResumeUploadCand = async (req) => {
  let id = req.params.id;
  let findCand = await ClimbCandidate.findById(id);
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
          findCand = await ClimbCandidate.findByIdAndUpdate({ _id: id }, { resume: res.Location }, { new: true });
          resolve(findCand);
        }
      });
    });
  }
};

const updateClimbCand = async (req) => {
  let id = req.params.id;
  let cand = await ClimbCandidate.findById(id);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  cand = await ClimbCandidate.findByIdAndUpdate({ _id: id }, req.body, { new: true });
  return cand;
};

module.exports = {
  createClimbCand,
  ResumeUploadCand,
  updateClimbCand,
};
