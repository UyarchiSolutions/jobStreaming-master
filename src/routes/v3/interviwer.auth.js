const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { Interviewer, Candidateinterview } = require('../../models/employerDetails.model');
const moment = require('moment');
const Interviewer_auth = async (req, res, next) => {
  const token = req.headers.auth;
  if (!token) {
    return res.send(httpStatus.UNAUTHORIZED, 'user must be LoggedIn....');
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret, { ignoreExpiration: true });
    const userss = await Candidateinterview.findById(payload.details.streamId);
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'User Not Available');
    }
    let nowTime = new Date().getTime();
    let exp = userss.startTime;
    let endTime = moment(exp).add(60, 'minutes');
    if (endTime < nowTime) {
      return res.send(httpStatus.UNAUTHORIZED, 'Token Expired');
    }
    req.userId = payload.userId;
    req.streamId = payload.details.streamId;
    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access Token');
  }
};

module.exports = Interviewer_auth;