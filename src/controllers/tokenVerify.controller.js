const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tokenTypes } = require('../config/tokens');
const jwt = require('jsonwebtoken');
const tokenService = require('../services/token.service');
const config = require('../config/config');
const { CandidateRegistration } = require('../models');
const { AgriCandidate, } = require('../models/agri.Event.model');

const authorization = async (req, res, next) => {
  const token = req.headers.auth;
  // console.log(token,879)
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const userss = await AgriCandidate.findById({ _id: payload.sub });
    if (!userss) {
      return res.send(httpStatus.UNAUTHORIZED, 'User Not Available');
    }
    if (userss.active == false) {
      return res.send(httpStatus.UNAUTHORIZED, 'User Not Available');
    }
    // console.log(userss)
    // console.log(userss)

    req.userId = userss._id;;
    return next();
  } catch {
    return res.send(httpStatus.UNAUTHORIZED, 'Invalid Access Token');
  }
};

module.exports = authorization;
