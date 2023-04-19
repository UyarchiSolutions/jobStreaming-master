const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const jobAlert = require('../models/jobAlert.model');
const { EmployerDetails } = require('../models/employerDetails.model');
// create job Alert

const createjobAlert = async (body, userId) => {
  let findData = await jobAlert.findOne({ userId: userId }).sort({ createdAt: -1 });
  if (findData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already available alert in this user');
  }
  let values = { ...body, ...{ userId: userId } };
  const data = await jobAlert.create(values);
  return data;
};

const getjobAlertbyUser = async (userId) => {
  const data = await jobAlert.findOne({ userId: userId }).sort({ createdAt: -1 });
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Job ALert Not Available for this user');
  }
  return data;
};

const updateJobAlert = async (id, body) => {
  let data = await jobAlert.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Job ALert Not Available for this user');
  }
  data = await jobAlert.findByIdAndUpdate({ _id: id }, body, { new: true });
  return data;
};

const getJobAlert_Response = async (userId) => {
  let values;
  let userAlert = await jobAlert.findOne({ userId: userId }).sort({ createdAt: -1 });
  if (!userAlert) {
    values = { message: 'this user Not Set job Alert' };
  } else {
    const {
      keyWords,
      cities,
      currentIndestry,
      currentDepartment,
      jobRole,
      experienceYearSet,
      experienceMonthSet,
      salaryFrom,
      salaryTo,
      createdAt,
    } = userAlert;

    // keyWord Match
    let keywordMatch;
    let arr = [];
    keyWords.forEach((e) => {
      arr.push({ keySkill: { $elemMatch: { $regex: e, $options: 'i' } } });
    });
    keywordMatch = { $or: arr };

    // cities Matches
    let cityMatch;
    let cityArr = [];
    cities.forEach((e) => {
      cityArr.push({ cities: { $elemMatch: { $regex: e, $options: 'i' } } });
    });
    cityMatch = { $or: cityArr };

    let date = moment(createdAt).add(5, 'minutes').toDate();

    values = await EmployerDetails.aggregate([
      {
        $match: {
          $and: [
            keywordMatch,
            { experienceFrom: { $gte: experienceYearSet } },
            { experienceTo: { $lte: experienceMonthSet } },
            cityMatch,
            { salaryRangeFrom: { $gte: salaryFrom } },
            { salaryRangeTo: { $lte: salaryTo } },
            { department: { $eq: currentDepartment } },
            { industry: { $regex: currentIndestry, $options: 'i' } },
            { roleCategory: { $regex: jobRole, $options: 'i' } },
            { createdAt: { $gte: date } },
          ],
        },
      },
      {
        $lookup: {
          from: 'employerregistrations',
          localField: 'userId',
          foreignField: '_id',
          as: 'employer',
        },
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$employer',
        },
      },
      {
        $lookup: {
          from: 'candidatepostjobs',
          localField: '_id',
          foreignField: 'jobId',
          pipeline: [{ $match: { userId: userId } }],
          as: 'job',
        },
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$job',
        },
      },
    ]);
  }

  return { values: values, data: userAlert };
};

module.exports = {
  createjobAlert,
  getjobAlertbyUser,
  updateJobAlert,
  getJobAlert_Response,
};
