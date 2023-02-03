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

const createQualification = async (userBody) => {
  let data = await Qualification.create(userBody);
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
  let data = await Drspecialization.find({courseId: id});
  return data;
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
};
