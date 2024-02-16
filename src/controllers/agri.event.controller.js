const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const AgriEventService = require('../services/agri.Event.service');
const { candiRegReceveMail, eventMailSend } = require('../services/email.service');

const createAgriEvent = catchAsync(async (req, res) => {
  const data = await AgriEventService.createAgriEvent(req);
  await candiRegReceveMail(data);
  res.send(data);
});

const createSlots = catchAsync(async (req, res) => {
  const data = await AgriEventService.createSlots(req);
  res.send(data);
});

const slotDetailsAgri = catchAsync(async (req, res) => {
  const data1 = await AgriEventService.slotDetailsAgriTch(req);
  const data2 = await AgriEventService.slotDetailsAgriHR(req);
  res.send({ Tech: data1, HR: data2 });
});

const updateCandidate = catchAsync(async (req, res) => {
  const data = await AgriEventService.updateCandidate(req);
  res.send(data);
});

const getUserById = catchAsync(async (req, res) => {
  const data = await AgriEventService.getUserById(req);
  res.send(data);
});

const createCandidateReview = catchAsync(async (req, res) => {
  const data = await AgriEventService.createCandidateReview(req);
  res.send(data);
});

const ExcelDatas = catchAsync(async (req, res) => {
  const data = await AgriEventService.ExcelDatas(req);
  res.send(data);
});

const EmailSend = catchAsync(async (req, res) => {
  await eventMailSend(req.body.email);
  res.send({ message: 'Mail sent successfully' });
});

const getAgriCandidates = catchAsync(async (req, res) => {
  const data = await AgriEventService.getAgriCandidates(req);
  res.send(data);
});

const getCandidateById = catchAsync(async (req, res) => {
  const data = await AgriEventService.getCandidateById(req);
  res.send(data);
});

const getCandBy = catchAsync(async (req, res) => {
  const data = await AgriEventService.getCandBy(req);
  res.send(data);
});

const createSlotBooking = catchAsync(async (req, res) => {
  const data = await AgriEventService.createSlotBooking(req);
  res.send(data);
});

const getIntrestedByCand_Role = catchAsync(async (req, res) => {
  const data = await AgriEventService.getIntrestedByCand_Role(req);
  res.send(data);
});

const AdminApprove = catchAsync(async (req, res) => {
  const data = await AgriEventService.AdminApprove(req);
  res.send(data);
});

const Undo = catchAsync(async (req, res) => {
  const data = await AgriEventService.Undo(req);
  res.send(data);
});

const clearCandidates = catchAsync(async (req, res) => {
  const data = await AgriEventService.clearCandidates(req);
  res.send(data);
});

const ResumeUploadAgriCand = catchAsync(async (req, res) => {
  const data = await AgriEventService.ResumeUploadAgriCand(req);
  res.send(data);
});

const getCandidatesReport = catchAsync(async (req, res) => {
  const data = await AgriEventService.getCandidatesReport(req);
  res.send(data);
});

const getStreamDetailsByCand = catchAsync(async (req, res) => {
  const data = await AgriEventService.getStreamDetailsByCand(req);
  res.send(data);
})

const active_Inactive_candidate = catchAsync(async (req, res) => {
  const data = await AgriEventService.active_Inactive_candidate(req);
  res.send(data)
})


const get_hr_review = catchAsync(async (req, res) => {
  const data = await AgriEventService.get_hr_review(req);
  res.send(data)
})

const get_tech_review= catchAsync(async (req, res) => {
  const data = await AgriEventService.get_tech_review(req);
  res.send(data)
})

module.exports = {
  createAgriEvent,
  createSlots,
  slotDetailsAgri,
  updateCandidate,
  getUserById,
  createCandidateReview,
  ExcelDatas,
  EmailSend,
  getAgriCandidates,
  getCandidateById,
  getCandBy,
  createSlotBooking,
  getIntrestedByCand_Role,
  AdminApprove,
  Undo,
  clearCandidates,
  ResumeUploadAgriCand,
  getCandidatesReport,
  getStreamDetailsByCand,
  active_Inactive_candidate,
  get_hr_review,
  get_tech_review
};
