const httpStatus = require('http-status');
const {
  Qualification,
  SslcCourse,
  HscCourse,
  PgCourse,
  UgCourse,
  Medium,
  DrCourse,
  Specialization,
  Pgspecialization,
  Drspecialization,
  Department,
  City,
  Rolecategory,
  Industries,
  Role,
  AllCourse,
  AllSpecialization,
} = require('../models/education.model');
const { OTPModel } = require('../models');
const { Token } = require('../models');
const sendmail = require('../config/textlocal');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { emailService } = require('../services');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const Axios = require('axios');
const moment = require('moment');
const { default: axios } = require('axios');

const createQualification = async () => {
  let data = await Qualification.find();
  return data;
};

const get_sslc_course = async (id) => {
  let data = await SslcCourse.find({ QualificationId: id });
  return data;
};

const get_hsc_course = async (id) => {
  let data = await HscCourse.find({ QualificationId: id });
  return data;
};

const get_pg_course = async (id) => {
  let data = await PgCourse.find({ QualificationId: id });
  return data;
};

const get_ug_course = async (id) => {
  let data = await UgCourse.find({ QualificationId: id });
  return data;
};

const get_medium = async () => {
  let data = await Medium.find();
  return data;
};

const get_drcourse = async (id) => {
  let data = await DrCourse.find({ QualificationId: id });
  return data;
};

const get_specialization = async (id) => {
  let data = await Specialization.find({ courseId: id });
  return data;
};

const get_pgspecialization = async (id) => {
  let data = await Pgspecialization.find({ courseId: id });
  return data;
};

const get_drspecialization = async (id) => {
  let data = await Drspecialization.find({ courseId: id });
  return data;
};

const get_Department = async () => {
  let data = await Department.find();
  return data;
};

const get_city = async (key) => {
  let data = await City.find({ name: { $regex: key, $options: 'i' } }).limit(50);
  return data;
};

const get_Rolecategory = async (id) => {
  let dep = await Department.findOne({ Department: id });
  if (!dep) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Department not found');
  }
  let data = await Rolecategory.find({ DepartmentId: dep._id });
  return data;
};

const get_Industry = async () => {
  let data = await Industries.find();
  return data;
};

const get_Role = async (id) => {
  let data = await Role.find({ RoleId: id });
  return data;
};

const get_allcourse = async () => {
  let data = await AllCourse.aggregate([{ $sort: { createdAt: -1 } }]);
  return data;
};

const get_all_specialization = async (body) => {
  const { arr } = body;
  let data = await AllSpecialization.find({ courseId: { $eq: arr } });
  return data;
};

const get_Qualification = async (body) => {
  const { arr } = body;
  let data = await Qualification.aggregate([
    { $match: { $and: [{ _id: { $in: arr } }] } },
    {
      $lookup: {
        from: 'allcourses',
        localField: '_id',
        foreignField: 'QualificationId',
        as: 'allCourses',
      },
    },
  ]);
  return data[0];
};

const get_Department_all = async (limit) => {
  if (limit == 'null') {
    limit = 37;
  }
  let data = await Department.find().limit(parseInt(limit));
  return data;
};

const get_Role_all = async (limit) => {
  if (limit == 'null') {
    limit = 1326;
  }
  let data = await Role.find().limit(parseInt(limit));
  return data;
};

const get_alleducation_all = async (limit) => {
  if (limit == 'null') {
    limit = 51;
  }
  let data = await AllCourse.find().limit(parseInt(limit));
  return data;
};

const get_Industries_all = async (limit) => {
  if (limit == 'null') {
    limit = 172;
  }
  let data = await Industries.find().limit(parseInt(limit));
  return data;
};

const get_Industries_all_search = async (key) => {
  let data = await Industries.find({ Industry: { $regex: key, $options: 'i' } }).limit(7);
  return data;
};

const getAllCoursesByQualificationId = async (id) => {
  let values = await AllCourse.find({ QualificationId: id });
  return values;
};

const getAllSpecByCourse = async (id) => {
  let values = await AllSpecialization.find({ courseId: id });
  return values;
};

module.exports = {
  createQualification,
  get_sslc_course,
  get_hsc_course,
  get_pg_course,
  get_ug_course,
  get_medium,
  get_drcourse,
  get_specialization,
  get_pgspecialization,
  get_drspecialization,
  get_Department,
  get_city,
  get_Rolecategory,
  get_Industry,
  get_Role,
  get_allcourse,
  get_all_specialization,
  get_Qualification,
  get_Role_all,
  get_Department_all,
  get_Industries_all,
  get_alleducation_all,
  get_Industries_all_search,
  getAllCoursesByQualificationId,
  getAllSpecByCourse,
};
