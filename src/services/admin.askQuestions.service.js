const httpStatus = require('http-status');
const { Faqe, Enquiry, Report } = require('../models/admin.askQusetions.model');
const { EmployerDetails } = require('../models/employerDetails.model');
const { findByIdAndUpdate } = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
var ejs = require('ejs');

const createFaqe = async (body) => {
  return Faqe.create(body);
};

const getAllFaqe = async (range, page) => {
  const data = await Faqe.aggregate([
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(range) * parseInt(page) },
    { $limit: parseInt(range) },
  ]);
  const count = await Faqe.aggregate([
    {
      $match: { active: true },
    },
  ]);
  return { data: data, count: count.length };
};

const get_Faqe_id = async (id) => {
  console.log(id);
  const data = Faqe.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data;
};

const get_Faqe_update = async (id, body) => {
  const data = Faqe.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  let value = await Faqe.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

const get_Faqe_delete = async (id) => {
  const data = Faqe.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  await data.remove();
  return data;
};

const exiting_faqe_data = async () => {
  const data = await Faqe.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: { heading: '$heading' },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        heading: '$_id.heading',
        count: 1,
      },
    },
  ]);
  return data;
};

// enquiry create
const create_enquiry_candidate = async (userId, body) => {
  const values = { ...body, ...{ userId: userId } };
  return Enquiry.create(values);
};

// dummy
const create_enquiry_dummy = async (body) => {
  let currentDate = moment().format('YYYY-MM-DD');
  const Buy = await Enquiry.find({ date: currentDate });
  let center = '';
  if (Buy.length < 9) {
    center = '0000';
  }
  if (Buy.length < 99 && Buy.length >= 9) {
    center = '000';
  }
  if (Buy.length < 999 && Buy.length >= 99) {
    center = '00';
  }
  if (Buy.length < 9999 && Buy.length >= 999) {
    center = '0';
  }
  let iddd = '';
  let totalcount = Buy.length + 1;

  iddd = 'EQ' + center + totalcount;
  let re = Enquiry.create(body);
  re.eq_id = iddd;
  re.date = currentDate;
  re.save();
  return re;
};

const get_all_enquiry = async (range, page) => {
  const data = await Enquiry.aggregate([
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(range) * parseInt(page) },
    { $limit: parseInt(range) },
  ]);
  const count = await Enquiry.aggregate([
    {
      $match: { active: true },
    },
  ]);
  return { data: data, count: count.length };
};

const get_id_enquiry = async (id) => {
  const data = await Enquiry.findById(id);
  return data;
};

const get_Enquiry_update = async (id, body) => {
  const data = Enquiry.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  let value = await Enquiry.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

const nodemailer = require('nodemailer');
// const parser = new DOMParser();
const transporter = nodemailer.createTransport({
  host: 'mail.uyarchi.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply-tj@uyarchi.com',
    pass: 'Thunivu@100',
  },
});
const reply_enquiry = async (body) => {
  const { enquiryId, subject, answer } = body;
  const data = await Enquiry.findById(enquiryId);
  console.log(data);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const data1 = await ejs.renderFile(__dirname + '/enquirytemplate.ejs', {
    subject: subject,
    question: data.enquiry,
    // answer: parser.parseFromString(answer, 'text/html'),
    answer:answer,
    email: data.emailId,
  });

  const mainOptions = {
    from: 'noreply-tj@uyarchi.com',
    to: data.emailId,
    // to:"vignesh1041996@gmail.com",
    subject: 'templates',
    html: data1,
  };

  transporter.sendMail(mainOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
  let value = await Enquiry.findByIdAndUpdate({ _id: enquiryId }, { answer: answer }, { new: true });

  return value;
};

// report create
const create_report = async (userId, body) => {
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HH:mm:ss');
  let value = { ...body, ...{ userId: userId, date: date, time: creat1 } };
  return Report.create(value);
};

const all_report = async (range, page) => {
  const data = await Report.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: {
              path: '$employerregistrations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              let: { userId: '$qualification' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { qualification: '$qualification' } },
                },
                {
                  $project: {
                    _id: null,
                    qualification: '$_id.qualification',
                  },
                },
              ],
              as: 'qualifications',
            },
          },
          {
            $lookup: {
              from: 'allcourses',
              let: { userId: '$course' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { Course: '$Course' } },
                },
                {
                  $project: {
                    _id: null,
                    Course: '$_id.Course',
                  },
                },
              ],
              as: 'allcourses',
            },
          },
          {
            $lookup: {
              from: 'allspecializations',
              let: { userId: '$specialization' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { Specialization: '$Specialization' } },
                },
                {
                  $project: {
                    _id: null,
                    Specialization: '$_id.Specialization',
                  },
                },
              ],
              as: 'allspecializations',
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'department',
              foreignField: '_id',
              as: 'departments',
            },
          },
          {
            $unwind: {
              path: '$departments',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              keySkill: 1,
              preferedIndustry: 1,
              active: 1,
              jobTittle: 1,
              jobDescription: 1,
              salaryRangeFrom: 1,
              salaryRangeTo: 1,
              experienceFrom: 1,
              experienceTo: 1,
              interviewType: 1,
              candidateDescription: 1,
              workplaceType: 1,
              urltoApply: 1,
              industry: 1,
              jobLocation: 1,
              employmentType: 1,
              openings: 1,
              recruiterName: 1,
              date: 1,
              time: 1,
              interviewstartDate: 1,
              interviewendDate: 1,
              startTime: 1,
              endTime: 1,
              recruiterEmail: 1,
              recruiterNumber: 1,
              logo: '$employerregistrations.logo',
              companyName: '$employerregistrations.name',
              email: '$employerregistrations.email',
              mobileNumber: '$employerregistrations.mobileNumber',
              contactName: '$employerregistrations.contactName',
              companyType: '$employerregistrations.companyType',
              aboutCompany: '$employerregistrations.aboutCompany',
              location: '$employerregistrations.location',
              choosefile: '$employerregistrations.choosefile',
              department: '$departments.Department',
              Specialization: '$allspecializations.Specialization',
              Course: '$allcourses.Course',
              qualification: '$qualifications.qualification',
            },
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: {
        path: '$employerdetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: {
        path: '$candidateregistrations',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        employerdetails: '$employerdetails',
        date: 1,
        time: 1,
        report: 1,
        candidateName: '$candidateregistrations.name',
        location: '$candidateregistrations.location',
      },
    },
    { $skip: parseInt(range) * parseInt(page) },
    { $limit: parseInt(range) },
  ]);
  const count = await Report.aggregate([
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: {
              path: '$employerregistrations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              let: { userId: '$qualification' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { qualification: '$qualification' } },
                },
                {
                  $project: {
                    _id: null,
                    qualification: '$_id.qualification',
                  },
                },
              ],
              as: 'qualifications',
            },
          },
          {
            $lookup: {
              from: 'allcourses',
              let: { userId: '$course' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { Course: '$Course' } },
                },
                {
                  $project: {
                    _id: null,
                    Course: '$_id.Course',
                  },
                },
              ],
              as: 'allcourses',
            },
          },
          {
            $lookup: {
              from: 'allspecializations',
              let: { userId: '$specialization' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { Specialization: '$Specialization' } },
                },
                {
                  $project: {
                    _id: null,
                    Specialization: '$_id.Specialization',
                  },
                },
              ],
              as: 'allspecializations',
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'department',
              foreignField: '_id',
              as: 'departments',
            },
          },
          {
            $unwind: {
              path: '$departments',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              keySkill: 1,
              preferedIndustry: 1,
              active: 1,
              adminActive: 1,
              jobTittle: 1,
              jobDescription: 1,
              salaryRangeFrom: 1,
              salaryRangeTo: 1,
              experienceFrom: 1,
              experienceTo: 1,
              interviewType: 1,
              candidateDescription: 1,
              workplaceType: 1,
              urltoApply: 1,
              industry: 1,
              jobLocation: 1,
              employmentType: 1,
              openings: 1,
              recruiterName: 1,
              date: 1,
              time: 1,
              interviewstartDate: 1,
              interviewendDate: 1,
              startTime: 1,
              endTime: 1,
              recruiterEmail: 1,
              recruiterNumber: 1,
              logo: '$employerregistrations.logo',
              companyName: '$employerregistrations.name',
              email: '$employerregistrations.email',
              mobileNumber: '$employerregistrations.mobileNumber',
              contactName: '$employerregistrations.contactName',
              companyType: '$employerregistrations.companyType',
              aboutCompany: '$employerregistrations.aboutCompany',
              location: '$employerregistrations.location',
              choosefile: '$employerregistrations.choosefile',
              department: '$departments.Department',
              Specialization: '$allspecializations.Specialization',
              Course: '$allcourses.Course',
              qualification: '$qualifications.qualification',
            },
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: {
        path: '$employerdetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'departments',
      },
    },
    {
      $unwind: {
        path: '$candidateregistrations',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        employerdetails: '$employerdetails',
        date: 1,
        time: 1,
        report: 1,
        candidateName: '$candidateregistrations.name',
        location: '$candidateregistrations.candidateregistrations',
      },
    },
  ]);
  return { data: data, count: count.length };
};

const deactive_admin = async (id) => {
  const data = EmployerDetails.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  let value = await EmployerDetails.findByIdAndUpdate({ _id: id }, { active: false, adminActive: true }, { new: true });
  return value;
};

const get_report = async (id) => {
  const data = await Report.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'jobId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'employerregistrations',
              localField: 'userId',
              foreignField: '_id',
              as: 'employerregistrations',
            },
          },
          {
            $unwind: {
              path: '$employerregistrations',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'qualifications',
              let: { userId: '$qualification' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { qualification: '$qualification' } },
                },
                {
                  $project: {
                    _id: null,
                    qualification: '$_id.qualification',
                  },
                },
              ],
              as: 'qualifications',
            },
          },
          {
            $lookup: {
              from: 'allcourses',
              let: { userId: '$course' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { Course: '$Course' } },
                },
                {
                  $project: {
                    _id: null,
                    Course: '$_id.Course',
                  },
                },
              ],
              as: 'allcourses',
            },
          },
          {
            $lookup: {
              from: 'allspecializations',
              let: { userId: '$specialization' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$userId'], // <-- This doesn't work. Dont want to use `$unwind` before `$match` stage
                    },
                  },
                },
                {
                  $group: { _id: { Specialization: '$Specialization' } },
                },
                {
                  $project: {
                    _id: null,
                    Specialization: '$_id.Specialization',
                  },
                },
              ],
              as: 'allspecializations',
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: 'department',
              foreignField: '_id',
              as: 'departments',
            },
          },
          {
            $unwind: {
              path: '$departments',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              keySkill: 1,
              preferedIndustry: 1,
              active: 1,
              jobTittle: 1,
              jobDescription: 1,
              salaryRangeFrom: 1,
              salaryRangeTo: 1,
              experienceFrom: 1,
              experienceTo: 1,
              interviewType: 1,
              candidateDescription: 1,
              workplaceType: 1,
              urltoApply: 1,
              industry: 1,
              jobLocation: 1,
              employmentType: 1,
              openings: 1,
              recruiterName: 1,
              date: 1,
              time: 1,
              interviewstartDate: 1,
              interviewendDate: 1,
              startTime: 1,
              endTime: 1,
              recruiterEmail: 1,
              recruiterNumber: 1,
              logo: '$employerregistrations.logo',
              companyName: '$employerregistrations.name',
              email: '$employerregistrations.email',
              mobileNumber: '$employerregistrations.mobileNumber',
              contactName: '$employerregistrations.contactName',
              companyType: '$employerregistrations.companyType',
              aboutCompany: '$employerregistrations.aboutCompany',
              location: '$employerregistrations.location',
              choosefile: '$employerregistrations.choosefile',
              department: '$departments.Department',
              Specialization: '$allspecializations.Specialization',
              Course: '$allcourses.Course',
              qualification: '$qualifications.qualification',
            },
          },
        ],
        as: 'employerdetails',
      },
    },
    {
      $unwind: {
        path: '$employerdetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'userId',
        foreignField: '_id',
        as: 'candidateregistrations',
      },
    },
    {
      $unwind: {
        path: '$candidateregistrations',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        employerdetails: '$employerdetails',
        date: 1,
        time: 1,
        report: 1,
        candidateName: '$candidateregistrations.name',
        location: '$candidateregistrations.location',
      },
    },
  ]);
  return data;
};

const getReportById = async (id) => {
  let values = await Report.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Report Not Found');
  }
  return values;
};

module.exports = {
  createFaqe,
  getAllFaqe,
  get_Faqe_id,
  get_Faqe_update,
  get_Faqe_delete,
  exiting_faqe_data,
  create_enquiry_candidate,
  get_all_enquiry,
  get_id_enquiry,
  create_enquiry_dummy,
  get_Enquiry_update,
  reply_enquiry,
  create_report,
  all_report,
  deactive_admin,
  get_report,
  getReportById,
};
