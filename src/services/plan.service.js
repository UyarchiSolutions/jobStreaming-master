const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const jobAlert = require('../models/jobAlert.model');
const { EmployerPlan, PurchasePlan } = require('../models/plans.mode');
const moment = require('moment');

const GstCalculation = (amount, gstRate) => {
  if (isNaN(amount) || isNaN(gstRate) || amount < 0 || gstRate < 0) {
    return 'Invalid input. Please provide valid numbers.';
  }
  // Calculate the GST amount
  const gstAmount = (parseInt(amount) * gstRate) / 100;

  // Calculate the total amount including GST
  const totalAmount = parseInt(amount) + gstAmount;

  return {
    originalAmount: amount,
    gstRate: gstRate,
    gstAmount: gstAmount,
    totalAmount: totalAmount,
  };
};

const createEmployerPlan = async (body) => {
  let values = await EmployerPlan.create({
    ...body,
    ...{ planType: 'normal', Time: new Date().getTime(), DateIso: moment() },
  });
  return values;
};

const getPlanes = async () => {
  let values = await EmployerPlan.aggregate([
    {
      $match: {
        active: true,
      },
    },
  ]);
  return values;
};

const getPlanesForCandidate = async () => {
  let values = await EmployerPlan.aggregate([
    {
      $match: {
        active: true,
        userType: { $eq: 'Candidate' },
      },
    },
  ]);
  return values;
};

const purchasedPlanes = async (body, userId) => {
  console.log(userId, 'UserID');
  const { planId, totalAmount, gst } = body;
  let values = await EmployerPlan.findById(planId);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Plan not found');
  }
  let data = {
    userType: values.userType,
    planType: values.planType,
    planName: values.planName,
    planmode: values.planMode,
    streamvalidity: values.streamvalidity,
    no_of_host: values.no_of_host,
    numberofStream: values.numberofStream,
    numberOfParticipants: values.numberOfParticipants,
    validityofplan: values.validityofplan,
    regularPrice: values.regularPrice,
    offer_price: values.offer_price,
    chat_Option: values.chat_Option,
    PostCount: values.PostCount,
    RaiseHands: values.RaiseHands,
    raisehandcontrol: values.raisehandcontrol,
    completedStream: values.completedStream,
    Duration: values.Duration,
    DurationType: values.DurationType,
    transaction: values.transaction,
    Candidate_Contact_reveal: values.Candidate_Contact_reveal,
    Pdf: values.Pdf,
    image: values.image,
    description: values.description,
    Teaser: values.Teaser,
    Special_Notification: values.Special_Notification,
    Service_Charges: values.Service_Charges,
    TimeType: values.TimeType,
    DateIso: values.DateIso,
    limited: values.limited,
    planId: planId,
    gst: gst,
    userId: userId,
    totalAmount: totalAmount,
  };
  let creations = await PurchasePlan.create(data);
  return creations;
};

const getPurchasedPlanesByUser = async (userId) => {
  let values = await PurchasePlan.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $match: {
        userId: userId,
      },
    },
  ]);
  return values;
};

const getPurchasedPlan_Admin = async () => {
  let values = await PurchasePlan.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  return values;
};

const updatePurchasedPlanes = async (id, body) => {
  let values = await PurchasePlan.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid purchase plan');
  }
  values = await PurchasePlan.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

const getPurchasedPlanesByUser_request_Stream = async (userId) => {
  console.log(userId);
  let values = await PurchasePlan.aggregate([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $match: {
        userId: userId,
      },
    },
  ]);
  return values;
};

module.exports = {
  createEmployerPlan,
  getPlanes,
  getPlanesForCandidate,
  purchasedPlanes,
  getPurchasedPlanesByUser,
  getPurchasedPlan_Admin,
  updatePurchasedPlanes,
  getPurchasedPlanesByUser_request_Stream,
};
