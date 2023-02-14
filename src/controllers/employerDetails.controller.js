const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const employerDetailsService = require('../services/employerDetails.service');


const createEmpDetails = catchAsync(async (req, res) => {
    const userId = req.userId
  const user = await employerDetailsService.createEmpDetails(userId, req.body);
  res.status(httpStatus.CREATED).send({ user });
});


const getByIdUser = catchAsync(async(req,res) => {
    let userId = req.userId
    const user = await employerDetailsService.getByIdUser(userId)
    res.send({user})
})

const updateById = catchAsync(async(req,res) => {
    const user = await employerDetailsService.updateById(req.params.id, req.body)
    res.send({user})
})

const update_active_deactive = catchAsync(async(req,res) => {
  const user = await employerDetailsService.update_active_deactive(req.params.id, req.body)
  res.send(user)
})


const deleteById = catchAsync(async(req,res) => {
    const user = await employerDetailsService.deleteById(req.params.id)
    res.send()
})

const createEmpDetailsRepost = catchAsync(async(req,res) => {
  const user = await employerDetailsService.createEmpDetailsRepost(req.params.id, req.body)
  res.send({user})
})


const getById_Get = catchAsync(async(req,res) => {
  const user = await employerDetailsService.getById_Get(req.params.id)
  res.send({user})
})


const data_Id = catchAsync(async(req,res) => {
  const user = await employerDetailsService.data_Id(req.params.id)
  res.send(user)
})

const countPostjobError = catchAsync(async(req,res) => {
  let userId = req.userId
  const user = await employerDetailsService.countPostjobError(userId)
  res.send(user)
})

const EmployerspostDraft = catchAsync(async(req,res) => {
  let userId = req.userId
  const user = await employerDetailsService.EmployerspostDraft(userId, req.body)
  res.send(user)
})

const draftData_employerside = catchAsync(async(req,res) => {
  let userId = req.userId
  const user = await employerDetailsService.draftData_employerside(userId)
  res.send(user)
})

const draftData_employerside_ById = catchAsync(async(req,res) => {
  const user = await employerDetailsService.draftData_employerside_ById(req.params.id)
  res.send(user)
})

const draftData_delete = catchAsync(async(req,res) => {
  const user = await employerDetailsService.draftData_delete(req.params.id)
  res.send(user)
})

const getAllApplied_postjobs_Candidates = catchAsync(async(req,res) => {
  const user = await employerDetailsService.getAllApplied_postjobs_Candidates(req.params.id)
  res.send(user)
})

const statusChange_employer = catchAsync(async(req,res) => {
  const user = await employerDetailsService.statusChange_employer(req.params.id, req.body)
  res.send(user)
})

const getByIdAll_CandidateDetails = catchAsync(async(req,res) => {
  const user = await employerDetailsService.getByIdAll_CandidateDetails(req.params.id)
  res.send(user)
})

const employer_comment = catchAsync(async(req,res) => {
  let userId = req.userId
  const user = await employerDetailsService.employer_comment(userId, req.body)
  res.send(user)
})

const comment_edit = catchAsync(async(req,res) => {
  const user = await employerDetailsService.comment_edit(req.params.id, req.body)
  res.send(user)
})

const mail_template_create = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerDetailsService.mail_template_create(userId, req.body)
  res.send(user)
})

const mail_template_data = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerDetailsService.mail_template_data(userId)
  res.send(user)
})

const mail_template_data_Id = catchAsync(async(req,res) => {
  const user = await employerDetailsService.mail_template_data_Id(req.params.id)
  res.send(user)
})

const mail_template_data_Update = catchAsync(async(req,res) => {
  const user = await employerDetailsService.mail_template_data_Update(req.params.id, req.body)
  res.send(user)
})

const mail_template_data_delete = catchAsync(async(req,res) => {
  const user = await employerDetailsService.mail_template_data_delete(req.params.id)
  res.send(user)
})

const send_mail_and_notification = catchAsync(async(req,res) => {
   const userId = req.userId
  const user = await employerDetailsService.send_mail_and_notification(userId, req.body)
  res.send(user)
})

const getAll_Mail_notification_employerside = catchAsync(async(req,res) => {
  const userId = req.userId
 const user = await employerDetailsService.getAll_Mail_notification_employerside(userId)
 res.send(user)
})

const getAll_Mail_notification_candidateside = catchAsync(async(req,res) => {
  const userId = req.userId
 const user = await employerDetailsService.getAll_Mail_notification_candidateside(userId)
 res.send(user)
})

const candidate_mailnotification_Change = catchAsync(async(req,res) => {
 const user = await employerDetailsService.candidate_mailnotification_Change(req.params.id, req.body)
 res.send(user)
})


const neighbour_api = catchAsync(async (req, res) => {
  const { lat, long, type, radius } = req.query;
  const data = await employerDetailsService.neighbour_api(lat, long, type, radius);
  res.send(data);
});

const All_Plans = catchAsync(async(req,res) => {
  const userId = req.userId
  const user = await employerDetailsService.All_Plans(userId)
  res.send(user)
 })

 const all_plans_users_details = catchAsync(async(req,res) => {
  const user = await employerDetailsService.all_plans_users_details(req.params.id)
  res.send(user)
 })

 const keySkillData = catchAsync(async(req,res) => {
  const user = await employerDetailsService.keySkillData(req.params.key)
  res.send(user)
 })

 const location = catchAsync(async(req,res) => {
  const user = await employerDetailsService.location(req.params.key)
  res.send(user)
 })

 const get_job_post = catchAsync(async(req,res) => {
  const user = await employerDetailsService.get_job_post(req.params.id)
  res.send(user)
 })

 const get_job_post_candidate = catchAsync(async(req,res) => {
  const user = await employerDetailsService.get_job_post_candidate(req.params.id)
  res.send(user)
 })
module.exports = {
  createEmpDetails,
  getByIdUser,
  updateById,
  deleteById,
  createEmpDetailsRepost,
  getById_Get,
  data_Id,
  countPostjobError,
  EmployerspostDraft,
  draftData_employerside,
  draftData_employerside_ById,
  draftData_delete,
  getAllApplied_postjobs_Candidates,
  statusChange_employer,
  getByIdAll_CandidateDetails,
  employer_comment,
  comment_edit,
  mail_template_create,
  mail_template_data,
  mail_template_data_Id,
  mail_template_data_Update,
  mail_template_data_delete,
  send_mail_and_notification,
  getAll_Mail_notification_employerside,
  getAll_Mail_notification_candidateside,
  candidate_mailnotification_Change,
  neighbour_api,
  All_Plans,
  all_plans_users_details,
  keySkillData,
  location,
  update_active_deactive,
  get_job_post,
  get_job_post_candidate,
};