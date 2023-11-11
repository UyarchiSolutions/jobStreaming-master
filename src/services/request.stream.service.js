const httpStatus = require('http-status');
const { Streamrequest } = require('../models/request.stream.models');
const { PurchasePlan } = require('../models/plans.mode');
const { UsageAppID } = require('../models/AgoraAppId.model');
const { KeySkill } = require('../models/candidateDetails.model');
const CandidateRegistration = require('../models/candidateRegistration.model');
const ApiError = require('../utils/ApiError');
const agoraToken = require('./AgoraAppId.service');

// create Request Stream for Candidate

const createRequestStream = async (req) => {
  let userId = req.userId;
  const { planId, date, time } = req.body;
  let findPlan = await PurchasePlan.findById(planId);
  if (!findPlan) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Plan Not Found');
  }
  let findCandDetails = await KeySkill.findOne({ userId: userId }).sort({ createdAt: -1 });
  console.log(findCandDetails, 'cand Details');
  if (!findCandDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Canndidate Details Not Found');
  }
  let startTime = new Date(new Date(date + ' ' + time)).getTime();
  let numberOfParticipants = findPlan.numberOfParticipants * findPlan.Duration;
  let no_of_host = findPlan.no_of_host ? findPlan.no_of_host : 0 * findPlan.Duration ? findPlan.Duration : 0;
  let totalMinutes = numberOfParticipants + no_of_host + findPlan.Duration ? findPlan.Duration : 0;
  let agoraID = await agoraToken.token_assign(totalMinutes, '', 'Job');
  let datess = new Date().setTime(new Date(startTime).getTime() + findPlan.Duration * 60 * 1000);

  console.log(datess, 'sajkdhfg');
  // console.log(agoraID, "Agora")
  let value;
  if (agoraID.element != null && agoraID.element != '' && agoraID.element != undefined) {
    value = await Streamrequest.create({
      ...req.body,
      ...{
        // timeline: [{ status: 'Created', Time: new Date().getTime(), timelieId: req.timeline }],
        suppierId: req.userId,
        postCount: findPlan.PostCount,
        startTime: startTime,
        Duration: findPlan.Duration,
        noOfParticipants: findPlan.numberOfParticipants,
        chat: findPlan.chat_Option,
        max_post_per_stream: parseInt(findPlan.PostCount),
        sepTwo: 'Completed',
        planId: req.body.planId,
        endTime: datess,
        streamEnd_Time: datess,
        streamPlanId: findPlan.planId,
        agoraID: agoraID.element._id,
        totalMinues: totalMinutes,
        chat_need: findPlan.chat_Option,
        completedStream: findPlan.completedStream,
        // streamExpire: expiretime,
        Service_Charges: findPlan.Service_Charges == null ? 0 : findPlan.Service_Charges ? findPlan.Service_Charges : 0,
        Interest_View_Count: findPlan.Interest_View_Count,
        No_of_Limitations:
          findPlan.No_of_Limitations == null ? 0 : findPlan.No_of_Limitations ? findPlan.No_of_Limitations : 0,
        adminApprove: 'Approved',
        candidateDetailsId: findCandDetails._id,
        userDetails: findCandDetails,
      },
    });
    await UsageAppID.findByIdAndUpdate({ _id: agoraID.vals._id }, { streamID: value._id }, { new: true });
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'App id Not found');
  }

  return value;
};

const get_CandidateRequestStream = async (req) => {
  let userId = req.userId;
  let findCandidate = await CandidateRegistration.findById(userId);
  if (!findCandidate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Candidate not found');
  }

  let values = await Streamrequest.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $match: {
        suppierId: userId,
      },
    },
  ]);
  return values;
};

module.exports = {
  createRequestStream,
  get_CandidateRequestStream,
};
