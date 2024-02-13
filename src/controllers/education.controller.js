const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const educationService = require('../services/education.service');

const createQualification = catchAsync(async (req, res) => {
  const user = await educationService.createQualification();
  res.send(user);
});

const get_sslc_course = catchAsync(async (req, res) => {
  const user = await educationService.get_sslc_course(req.params.id);
  res.send(user);
});

const get_hsc_course = catchAsync(async (req, res) => {
  const user = await educationService.get_hsc_course(req.params.id);
  res.send(user);
});

const get_pg_course = catchAsync(async (req, res) => {
  const user = await educationService.get_pg_course(req.params.id);
  res.send(user);
});

const get_ug_course = catchAsync(async (req, res) => {
  const user = await educationService.get_ug_course(req.params.id);
  res.send(user);
});

const get_medium = catchAsync(async (req, res) => {
  const user = await educationService.get_medium();
  res.send(user);
});

const get_drcourse = catchAsync(async (req, res) => {
  const user = await educationService.get_drcourse(req.params.id);
  res.send(user);
});

const get_specialization = catchAsync(async (req, res) => {
  const user = await educationService.get_specialization(req.params.id);
  res.send(user);
});

const get_pgspecialization = catchAsync(async (req, res) => {
  const user = await educationService.get_pgspecialization(req.params.id);
  res.send(user);
});

const get_drspecialization = catchAsync(async (req, res) => {
  const user = await educationService.get_drspecialization(req.params.id);
  res.send(user);
});

const get_Department = catchAsync(async (req, res) => {
  const user = await educationService.get_Department();
  res.send(user);
});

const get_city = catchAsync(async (req, res) => {
  const user = await educationService.get_city(req.params.key);
  res.send(user);
});

const get_Rolecategory = catchAsync(async (req, res) => {
  const user = await educationService.get_Rolecategory(req.params.id);
  res.send(user);
});

const get_Industry = catchAsync(async (req, res) => {
  const user = await educationService.get_Industry();
  res.send(user);
});

const get_Role = catchAsync(async (req, res) => {
  const user = await educationService.get_Role(req.params.id);
  res.send(user);
});

const get_allcourse = catchAsync(async (req, res) => {
  const user = await educationService.get_allcourse();
  res.send(user);
});

const get_all_specialization = catchAsync(async (req, res) => {
  const user = await educationService.get_all_specialization(req.body);
  res.send(user);
});

const get_Qualification = catchAsync(async (req, res) => {
  const user = await educationService.get_Qualification(req.body);
  res.send(user);
});

const get_Role_all = catchAsync(async (req, res) => {
  const user = await educationService.get_Role_all(req.params.limit);
  res.send(user);
});

const get_Department_all = catchAsync(async (req, res) => {
  const user = await educationService.get_Department_all(req.params.limit);
  res.send(user);
});

const get_Industries_all = catchAsync(async (req, res) => {
  const user = await educationService.get_Industries_all(req.params.limit);
  res.send(user);
});

const get_alleducation_all = catchAsync(async (req, res) => {
  const user = await educationService.get_alleducation_all(req.params.limit);
  res.send(user);
});

const get_Industries_all_search = catchAsync(async (req, res) => {
  const user = await educationService.get_Industries_all_search(req.params.key);
  res.send(user);
});

const getAllCoursesByQualificationId = catchAsync(async (req, res) => {
  const user = await educationService.getAllCoursesByQualificationId(req.params.id);
  res.send(user);
});

const getAllSpecByCourse = catchAsync(async (req, res) => {
  const user = await educationService.getAllSpecByCourse(req.params.id);
  res.send(user);
});

const get_all_department = catchAsync(async (req, res) => {
  const user = await educationService.get_all_department(req);
  res.send(user);
});

const get_all_role_category = catchAsync(async (req, res) => {
  const user = await educationService.get_all_role_category(req);
  res.send(user);
});




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
  get_alleducation_all,
  get_Industries_all,
  get_Industries_all_search,
  getAllCoursesByQualificationId,
  getAllSpecByCourse,
  get_all_department,
  get_all_role_category
};
