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
  let data = await Rolecategory.find({ DepartmentId: id });
  return data;
};

const get_Industry = async () => {
  let data = await Industries.find();
  return data;
};

const get_Role = async () => {
  let values = [
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Banquet Manager',
    },
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Catering Executive',
    },
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Catering Manager / Supervisor',
    },
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Event Executive',
    },
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Event Planner/Manager',
    },
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Sponsorship/Partnership Manager',
    },
    {
      RoleId: 'b0ed52c0-f1da-4c83-9335-04be9f4539a5',
      Job_role: 'Events & Banquet - Other',
    },
  ];
  let data = await Role.create(values);
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
  get_Department,
  get_city,
  get_Rolecategory,
  get_Industry,
  get_Role,
};
