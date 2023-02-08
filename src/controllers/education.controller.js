const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const educationService = require('../services/education.service');

const createQualification = catchAsync(async (req, res) => {
  const user = await educationService.createQualification(req.body);
  res.status(httpStatus.CREATED).send(user);
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
