const httpStatus = require('http-status');
const { Streamrequest } = require('../models/request.stream.models');
const { PurchasePlan } = require('../models/plans.mode');
const ApiError = require('../utils/ApiError');
const agoraToken = require('./AgoraAppId.service');

// create Request Stream

const createRequestStream = async (req) => {
  let userId = req.userId;
  const { planId, date, time } = req.body;
  let findPlan = await PurchasePlan.findById(planId);
  if (!findPlan) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Plan Not Found');
  }
  let startTime = new Date(new Date(date + ' ' + time)).getTime();
  let numberOfParticipants = findPlan.numberOfParticipants * findPlan.Duration;
  let no_of_host = findPlan.no_of_host ? findPlan.no_of_host : 0 * findPlan.Duration ? findPlan.Duration : 0;
  let totalMinutes = numberOfParticipants + no_of_host + findPlan.Duration ? findPlan.Duration : 0;
//   let agoraID = await agoraToken.token_assign(totalMinutes, '', 'Job');
//   let datess = new Date().setTime(new Date(startTime).getTime() + findPlan.Duration ? findPlan.Duration : 0 * 60 * 1000);

  console.log(findPlan.Duration, 'sajkdhfg');
  return findPlan;
};

module.exports = {
  createRequestStream,
};
