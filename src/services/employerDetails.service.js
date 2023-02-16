const httpStatus = require('http-status');
const {
  EmployerDetails,
  EmployerPostDraft,
  Employercomment,
  EmployerMailTemplate,
  EmployerMailNotification,
} = require('../models/employerDetails.model');
const { PlanPayment } = require('../models/planPaymentDetails.model');
const { CandidatePostjob } = require('../models/candidateDetails.model');
const { CandidateRegistration } = require('../models');
const { CreatePlan } = require('../models/createPlan.model');
const { Skill } = require('../models/education.model');
const { EmployerRegistration } = require('../models');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { format } = require('morgan');
const { create } = require('../models/candidateRegistration.model');
const Axios = require('axios');
const { emailService } = require('../services');

//keySkill

const createEmpDetails = async (userId, userBody) => {
  // let app = await EmployerRegistration.findOne({_id:userId, adminStatus:"Approved"})
  let app = await EmployerRegistration.findOne({ _id: userId });
  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer Not Approved');
  }
  // const {validity} = userBody;
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  let data;
  let values;
  if (userBody.jobortemplate == 'job') {
    let expiredDate;
    // console.log(validity);
    const plan = await PlanPayment.findOne({ userId: userId, active: true });
    let pay;
    if (plan) {
      pay = await CreatePlan.findOne({ _id: plan.planId });
    }
    if (pay) {
      expiredDate = moment().add(pay.jobPostVAlidity, 'days').format('YYYY-MM-DD');
    } else {
      expiredDate = moment().add(1, 'days').format('YYYY-MM-DD');
    }
    if (!userBody.interviewDate) {
      values = { ...userBody, ...{ userId: userId, expiredDate: expiredDate, date: date, time: creat1 } };
    } else {
      values = {
        ...userBody,
        ...{
          userId: userId,
          expiredDate: expiredDate,
          date: date,
          time: creat1,
          interviewstartDate: interviewDate.startDate,
          interviewendDate: interviewDate.endDate,
        },
      };
    }
    const freeCount = await EmployerDetails.find({ userId: userId });
    const usser = await EmployerRegistration.findById(userId);
    console.log(freeCount.length, usser.freePlanCount);
    if (freeCount.length >= usser.freePlanCount) {
      const da = await PlanPayment.findOne({ userId: userId, active: true });
      if (!da) {
        throw new ApiError(httpStatus.NOT_FOUND, 'your not pay the plan');
      }
      if (date > da.expDate) {
        await PlanPayment.findByIdAndUpdate({ _id: da._id }, { active: false }, { new: true });
        throw new ApiError(httpStatus.NOT_FOUND, 'plan time expired');
      }
      const createPlan = await CreatePlan.findOne({ _id: da.planId });
      if (da.countjobPost == createPlan.jobPost) {
        await PlanPayment.findByIdAndUpdate({ _id: da._id }, { active: false }, { new: true });
        throw new ApiError(httpStatus.NOT_FOUND, 'jobpost limit over...');
      }
      // }
      let count = (da.countjobPost += 1);
      await PlanPayment.findByIdAndUpdate({ _id: da._id }, { countjobPost: count }, { new: true });
    }

    data = await EmployerDetails.create(values);
  } else {
    values = { ...userBody, ...{ userId: userId, date: date, time: creat1 } };
    data = await EmployerDetails.create(values);
  }
  // if(freeCount == usser.freePlanCount){
  // }
  return data;
};

const createEmpDetailsRepost = async (id, userBody) => {
  const { userId } = userBody;
  let expiredDate;
  const plan = await PlanPayment.findOne({ userId: userId, active: true });
  const pay = await CreatePlan.findOne({ _id: plan.planId });
  if (pay) {
    expiredDate = moment().add(pay.jobPostVAlidity, 'days').format('YYYY-MM-DD');
  } else {
    expiredDate = moment().add(1, 'days').format('YYYY-MM-DD');
  }
  // let expiredDate = moment().add(validity, 'days').format('YYYY-MM-DD');
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  const user = await getById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  let values = { ...userBody, ...{ expiredDate: expiredDate, date: date, adminStatus: 'Pending', time: creat1 } };
  console.log(values);
  const data = await EmployerDetails.findByIdAndUpdate({ _id: id }, values, { new: true });
  let count = (plan.countjobPost += 1);
  await PlanPayment.findByIdAndUpdate({ _id: plan._id }, { countjobPost: count }, { new: true });
  await data.save();
  return data;
};

const getByIdUser = async (id) => {
  let dates = moment().format('YYYY-MM-DD');
  const data = await EmployerDetails.aggregate([
    {
      $sort: { date: -1, time: -1 },
    },
    {
      $match: {
        $and: [{ userId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'jobId',
        pipeline: [
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        as: 'candidatepostjobs',
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
      $lookup: {
        from: 'rolecategories',
        localField: 'roleCategory',
        foreignField: '_id',
        as: 'rolecategories',
      },
    },
    {
      $unwind: {
        path: '$rolecategories',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'jobroles',
        localField: 'role',
        foreignField: '_id',
        as: 'jobroles',
      },
    },
    {
      $unwind: {
        path: '$jobroles',
        preserveNullAndEmptyArrays: true,
      },
    },
    
    {
      $project: {
        appliedcount: '$candidatepostjobs.count',
        keySkill: 1,
        dates: dates,
        date: 1,
        active: 1,
        jobTittle: 1,
        designation: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        experienceFrom: 1,
        experienceTo: 1,
        interviewType: 1,
        candidateDescription: 1,
        workplaceType: 1,
        industry: 1,
        interviewerName: 1,
        preferredindustry: 1,
        functionalArea: 1,
        role: 1,
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        interviewDate: 1,
        interviewTime: 1,
        location: 1,
        interviewerName: 1,
        interviewerContactNumber: 1,
        validity: 1,
        educationalQualification: 1,
        userId: 1,
        expiredDate: 1,
        createdAt: 1,
        adminStatus: 1,
        recruiterName:1,
        recruiterEmail:1,
        recruiterNumber:1, 
        roleName:'$jobroles.Job_role',
        categoryName:'$rolecategories.Role_Category',
        departmentName:'$departments.Department',
        adminStatuss: {
          $cond: {
            if: { $gt: [dates, '$expiredDate'] },
            then: 'Expired',
            else: '$adminStatus',
          },
        },

        //  companyName:"$employerregistrations.companyName",
        //  email:"$employerregistrations.email",
        //  mobileNumber:"$employerregistrations.mobileNumber",
        //  companyType:"$employerregistrations.companyType",
        //  name:"$employerregistrations.name",
        //  regitserStatus:"$employerregistrations.adminStatus",
      },
    },
  ]);
  return data;
};

const getById = async (id) => {
  const data = await EmployerDetails.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  return data;
};

const update_active_deactive = async (id, body) => {
  const data = await EmployerDetails.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  const value = await EmployerDetails.findByIdAndUpdate({ _id: id }, { active: body.active }, { new: true });
  return value;
};

const data_Id = async (id) => {
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: id } }],
      },
    },
  ]);
  return data;
};

const getById_Get = async (id) => {
  let dates = moment().format('YYYY-MM-DD');
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
    {
      $project: {
        keySkill: 1,
        date: 1,
        dates: dates,
        active: 1,
        jobTittle: 1,
        designation: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        experienceFrom: 1,
        experienceTo: 1,
        interviewType: 1,
        candidateDescription: 1,
        workplaceType: 1,
        industry: 1,
        interviewerName: 1,
        preferredindustry: 1,
        functionalArea: 1,
        role: 1,
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        interviewDate: 1,
        interviewTime: 1,
        location: 1,
        interviewerName: 1,
        interviewerContactNumber: 1,
        validity: 1,
        educationalQualification: 1,
        userId: 1,
        expiredDate: 1,
        createdAt: 1,
        adminStatus: 1,
        adminStatuss: {
          $cond: {
            if: { $gt: [dates, '$expiredDate'] },
            then: 'Expired',
            else: '$adminStatus',
          },
        },

        //  companyName:"$employerregistrations.companyName",
        //  email:"$employerregistrations.email",
        //  mobileNumber:"$employerregistrations.mobileNumber",
        //  companyType:"$employerregistrations.companyType",
        //  name:"$employerregistrations.name",
        //  regitserStatus:"$employerregistrations.adminStatus",
      },
    },
  ]);
  return data;
};

const updateById = async (id, updateBody) => {
  const user = await getById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  const data = await EmployerDetails.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  await data.save();
  return data;
};

const deleteById = async (id) => {
  const user = await EmployerDetails.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  await user.remove();
  return user;
};

const countPostjobError = async (userId) => {
  let date = moment().format('YYYY-MM-DD');
  // let app = await EmployerRegistration.findOne({_id:userId, adminStatus:"Approved"})
  let app = await EmployerRegistration.findOne({ _id: userId });
  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer Not Approved');
  }
  const freeCount = await EmployerDetails.find({ userId: userId });
  const usser = await EmployerRegistration.findById(userId);
  const daaa = await PlanPayment.findOne({ userId: userId, active: true });
  if (freeCount.length == usser.freePlanCount && !daaa) {
    throw new ApiError(httpStatus.NOT_FOUND, 'your free post over..');
  }
  if (freeCount.length >= usser.freePlanCount) {
    const da = await PlanPayment.findOne({ userId: userId, active: true });
    if (!da) {
      throw new ApiError(httpStatus.NOT_FOUND, 'your not pay the plan');
    }
    const createPlan = await CreatePlan.findOne({ _id: da.planId });
    if (da.countjobPost == createPlan.jobPost) {
      throw new ApiError(httpStatus.NOT_FOUND, 'jobpost limit over...');
    }
    if (date > da.expDate) {
      await PlanPayment.findByIdAndUpdate({ _id: da._id }, { active: false }, { new: true });
      throw new ApiError(httpStatus.NOT_FOUND, 'plan time expired');
    }
  }
  return { message: 'button enable' };
};

const EmployerspostDraft = async (userId, userBody) => {
  let app = await EmployerRegistration.findOne({ _id: userId, adminStatus: 'Approved' });
  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer Not Approved');
  }
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  // let expiredDate
  // // console.log(validity);
  // const plan = await PlanPayment.findOne({userId:userId, active:true})
  // const pay = await  CreatePlan.findOne({_id:plan.planId})
  // if(pay){
  //   expiredDate = moment().add(pay.jobPostVAlidity, 'days').format('YYYY-MM-DD');
  // }else{
  //   expiredDate = moment().add(1, 'days').format('YYYY-MM-DD');
  // }
  let values;
  console.log(userBody.interviewDate, 'huhi');
  if (!userBody.interviewDate) {
    console.log('fer');
    values = { ...userBody, ...{ userId: userId, date: date, time: creat1 } };
  } else {
    values = {
      ...userBody,
      ...{
        userId: userId,
        date: date,
        time: creat1,
        interviewstartDate: interviewDate.startDate,
        interviewendDate: interviewDate.endDate,
      },
    };
  }
  let data1 = await EmployerPostDraft.create(values);
  return data1;
};

const draftData_employerside = async (userId) => {
  const data = await EmployerPostDraft.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
  ]);
  return data;
};

const draftData_employerside_ById = async (id) => {
  const data = await EmployerPostDraft.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data;
};

const draftData_delete = async (id) => {
  const data = await EmployerPostDraft.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  await data.remove();
};

// postjob_candidate_Applied_datas
const getAllApplied_postjobs_Candidates = async (userId) => {
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'jobId',
        pipeline: [
          {
            $lookup: {
              from: 'candidateregistrations',
              localField: 'userId',
              foreignField: '_id',
              pipeline: [
                {
                  $lookup: {
                    from: 'candidatedetails',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                      {
                        $lookup: {
                          from: 'qualifications',
                          localField: 'sslcQualification',
                          foreignField: '_id',
                          as: 'sslcqualifications',
                        },
                      },
                      {
                        $unwind: {
                          path: '$sslcqualifications',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'qualifications',
                          localField: 'hsQualification',
                          foreignField: '_id',
                          as: 'hscqualifications',
                        },
                      },
                      {
                        $unwind: {
                          path: '$hscqualifications',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'qualifications',
                          localField: 'drQualification',
                          foreignField: '_id',
                          as: 'qualifications',
                        },
                      },
                      {
                        $unwind: {
                          path: '$qualifications',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'drcourses',
                          localField: 'drCourse',
                          foreignField: '_id',
                          as: 'drcourses',
                        },
                      },
                      {
                        $unwind: {
                          path: '$drcourses',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'drspecializations',
                          localField: 'drSpecialization',
                          foreignField: '_id',
                          as: 'drspecializations',
                        },
                      },
                      {
                        $unwind: {
                          path: '$drspecializations',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'qualifications',
                          localField: 'pgQualification',
                          foreignField: '_id',
                          as: 'pgqualifications',
                        },
                      },
                      {
                        $unwind: {
                          path: '$pgqualifications',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'pgcourses',
                          localField: 'pgCourse',
                          foreignField: '_id',
                          as: 'pgcourses',
                        },
                      },
                      {
                        $unwind: {
                          path: '$pgcourses',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'pgspecializations',
                          localField: 'pgSpecialization',
                          foreignField: '_id',
                          as: 'pgspecializations',
                        },
                      },
                      {
                        $unwind: {
                          path: '$pgspecializations',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'qualifications',
                          localField: 'ugQualification',
                          foreignField: '_id',
                          as: 'ugqualifications',
                        },
                      },
                      {
                        $unwind: {
                          path: '$ugqualifications',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'ugcourses',
                          localField: 'ugCourse',
                          foreignField: '_id',
                          as: 'ugcourses',
                        },
                      },
                      {
                        $unwind: {
                          path: '$ugcourses',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'specializations',
                          localField: 'ugSpecialization',
                          foreignField: '_id',
                          as: 'specializations',
                        },
                      },
                      {
                        $unwind: {
                          path: '$specializations',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'industries',
                          localField: 'industry',
                          foreignField: '_id',
                          as: 'industries',
                        },
                      },
                      {
                        $unwind: {
                          path: '$industries',
                          preserveNullAndEmptyArrays: true,
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
                        $lookup: {
                          from: 'rolecategories',
                          localField: 'roleCategory',
                          foreignField: '_id',
                          as: 'rolecategories',
                        },
                      },
                      {
                        $unwind: {
                          path: '$rolecategories',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                      {
                        $lookup: {
                          from: 'jobroles',
                          localField: 'role',
                          foreignField: '_id',
                          as: 'jobroles',
                        },
                      },
                      {
                        $unwind: {
                          path: '$jobroles',
                          preserveNullAndEmptyArrays: true,
                        },
                      },
                    ],
                    as: 'candidatedetails',
                  },
                },
                {
                  $unwind: {
                    path: '$candidatedetails',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $project: {
                    resume: 1,
                    email: 1,
                    workStatus: 1,
                    mobileNumber: 1,
                    name: 1,
                    lat: 1,
                    long: 1,
                    resume: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // candidateDetails: '$candidatedetails',
                    keyskill: '$candidatedetails.keyskill',
                    currentSkill: '$candidatedetails.currentSkill',
                    preferredSkill: '$candidatedetails.preferredSkill',
                    active: '$candidatedetails.active',
                    image: '$candidatedetails.image',
                    dob: '$candidatedetails.dob',
                    experienceYear: '$candidatedetails.experienceYear',
                    experienceMonth: '$candidatedetails.experienceMonth',
                    expectedctc: '$candidatedetails.expectedctc',
                    currentctc: '$candidatedetails.currentctc',
                    locationCurrent: '$candidatedetails.locationCurrent',
                    locationNative: '$candidatedetails.locationNative',
                    noticeperiod: '$candidatedetails.noticeperiod',
                    gender: '$candidatedetails.gender',
                    maritalStatus: '$candidatedetails.maritalStatus',
                    ugMarks: '$candidatedetails.ugMarks',
                    ugGradingSystem: '$candidatedetails.ugGradingSystem',
                    ugCourseType: '$candidatedetails.ugCourseType',
                    ugCourseDurationTo: '$candidatedetails.ugCourseDurationTo',
                    ugCourseDurationFrom: '$candidatedetails.ugCourseDurationFrom',
                    relocate: '$candidatedetails.relocate',
                    languages: '$candidatedetails.languages',
                    ugUniversity: '$candidatedetails.ugUniversity',
                    drQualification: '$candidatedetails.qualifications.qualification',
                    drcourses: '$candidatedetails.drcourses.Course',
                    drSpecialization: '$candidatedetails.drspecializations.Specialization',
                    pgQualification: '$candidatedetails.pgqualifications.qualification',
                    pgCourse: '$candidatedetails.pgcourses.Course',
                    pgSpecialization: '$candidatedetails.pgspecializations.Specialization',
                    ugQualification: '$candidatedetails.ugqualifications.qualification',
                    ugCourse: '$candidatedetails.ugcourses.Course',
                    ugSpecialization: '$candidatedetails.specializations.Specialization',
                    role: '$candidatedetails.jobroles.Job_role',
                    roleCategory: '$candidatedetails.rolecategories.Role_Category',
                    department: '$candidatedetails.departments.Department',
                    industry: '$candidatedetails.industries.Industry',
                    sslctotalmarks: '$candidatedetails.sslctotalmarks',
                    sslcPassedYear: '$candidatedetails.sslcPassedYear',
                    sslcMedium: '$candidatedetails.sslcMedium',
                    sslcBoard: '$candidatedetails.sslcBoard',
                    sslcQualification: '$candidatedetails.sslcqualifications.qualification',
                    pgUniversity: '$candidatedetails.pgUniversity',
                    pgMarks: '$candidatedetails.pgUniversity',
                    pgGradingSystem: '$candidatedetails.pgUniversity',
                    pgCourseType: '$candidatedetails.pgUniversity',
                    pgCourseDurationTo: '$candidatedetails.pgUniversity',
                    pgCourseDurationFrom: '$candidatedetails.pgUniversity',
                    hstotalmarks: '$candidatedetails.hstotalmarks',
                    hsPassedYear: '$candidatedetails.hsPassedYear',
                    hsMedium: '$candidatedetails.hsMedium',
                    hsBoard: '$candidatedetails.hsBoard',
                    drMarks: '$candidatedetails.drMarks',
                    drGradingSystem: '$candidatedetails.drGradingSystem',
                    drCourseType: '$candidatedetails.drCourseType',
                    drCourseDurationTo: '$candidatedetails.drCourseDurationTo',
                    drCourseDurationFrom: '$candidatedetails.drCourseDurationFrom',
                    hsQualification: '$candidatedetails.hscqualifications.qualification',
                    keyskillSet: '$candidatedetails.keyskillSet',
                    drUniversity: '$candidatedetails.drUniversity',
                    experienceMonthSet: '$candidatedetails.experienceMonthSet',
                    locationSet: '$candidatedetails.locationSet',
                    experienceYearSet: '$candidatedetails.experienceYearSet',
                    designationSet: '$candidatedetails.designationSet',
                    currentIndustry: '$candidatedetails.currentIndustry',
                    currentDepartment: '$candidatedetails.currentDepartment',
                    role_Category: '$candidatedetails.role_Category',
                    salaryFrom: '$candidatedetails.salaryFrom',
                    SalaryTo: '$candidatedetails.SalaryTo',
                  },
                },
              ],
              as: 'candidateregistrations',
            },
          },
          {
            $unwind: {
              path: '$candidateregistrations',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        candidateId: '$candidatepostjobs.candidateregistrations._id',
        employerCommand: '$candidatepostjobs.employerCommand',
        postjobId: '$candidatepostjobs._id',
        status: '$candidatepostjobs.approvedStatus',
        candidateData: '$candidatepostjobs.candidateregistrations',
      },
    },
  ]);
  return data;
};

const statusChange_employer = async (id, updateBody) => {
  const data = await CandidatePostjob.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const Data = await CandidatePostjob.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
  return Data;
};

const getByIdAll_CandidateDetails = async (id) => {
  const data = await CandidateRegistration.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'candidatedetails',
        localField: '_id',
        foreignField: 'userId',
        as: 'candidatedetails',
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        mobileNumber: 1,
        resume: 1,
        keyskill: '$candidatedetails.keyskill',
        currentSkill: '$candidatedetails.currentSkill',
        preferredSkill: '$candidatedetails.preferredSkill',
        experienceMonth: '$candidatedetails.experienceMonth',
        experienceYear: '$candidatedetails.experienceYear',
        salaryRangeFrom: '$candidatedetails.salaryRangeFrom',
        salaryRangeTo: '$candidatedetails.salaryRangeTo',
        locationCurrent: '$candidatedetails.locationCurrent',
        education: '$candidatedetails.education',
        specification: '$candidatedetails.specification',
        university: '$candidatedetails.university',
        courseType: '$candidatedetails.courseType',
        passingYear: '$candidatedetails.passingYear',
        gradingSystem: '$candidatedetails.gradingSystem',
        availability: '$candidatedetails.availability',
        gender: '$candidatedetails.gender',
        maritalStatus: '$candidatedetails.maritalStatus',
        mark: '$candidatedetails.mark',
        image: '$candidatedetails.image',
      },
    },
  ]);
  return data;
};

// comment

const employer_comment = async (userId, Body) => {
  let values = { ...Body, ...{ userId: userId } };
  return await Employercomment.create(values);
};

//edit comment

const comment_edit = async (id, body) => {
  const data = await Employercomment.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const Data = await Employercomment.findByIdAndUpdate({ _id: id }, body, { new: true });
  return Data;
};

// mail template

const mail_template_create = async (userId, body) => {
  const data = await EmployerRegistration.findById(userId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return await EmployerMailTemplate.create({ ...body, ...{ userId: userId } });
};

const mail_template_data = async (userId) => {
  const data = await EmployerMailTemplate.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
  ]);
  return data;
};

const mail_template_data_Id = async (id) => {
  const data = await EmployerMailTemplate.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data;
};

const mail_template_data_Update = async (id, body) => {
  const data = await EmployerMailTemplate.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const value = await EmployerMailTemplate.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

const mail_template_data_delete = async (id, body) => {
  const data = await EmployerMailTemplate.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  await data.remove();
};

// notofication send candidate
var ejs = require('ejs');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'mail.uyarchi.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply-tj@uyarchi.com',
    pass: 'Thunivu@100',
  },
});
const send_mail_and_notification = async (userId, body) => {
  const data = await EmployerRegistration.findById(userId);
  // console.log(userId)
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const employer = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: body.mailId } }],
      },
    },
    {
      $lookup: {
        from: 'industries',
        localField: 'industry',
        foreignField: '_id',
        as: 'industries',
      },
    },
    {
      $unwind: {
        path: '$industries',
        preserveNullAndEmptyArrays: true,
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
      $lookup: {
        from: 'rolecategories',
        localField: 'roleCategory',
        foreignField: '_id',
        as: 'rolecategories',
      },
    },
    {
      $unwind: {
        path: '$rolecategories',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'jobroles',
        localField: 'role',
        foreignField: '_id',
        as: 'jobroles',
      },
    },
    {
      $unwind: {
        path: '$jobroles',
        preserveNullAndEmptyArrays: true,
      },
    },
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
      $project: {
        keySkill: 1,
        preferedIndustry: 1,
        preferredSkill: 1,
        adminStatus: 1,
        active: 1,
        jobTittle: 1,
        contactNumber: 1,
        jobDescription: 1,
        educationalQualification: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        experienceFrom: 1,
        experienceTo: 1,
        interviewType: 1,
        candidateDescription: 1,
        salaryDescription: 1,
        urltoApply: 1,
        workplaceType: 1,
        industry: 1,
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        role: '$jobroles.Job_role',
        roleCategory: '$rolecategories.Role_Category',
        department: '$departments.Department',
        industry: '$industries.Industry',
        interviewstartDate: 1,
        interviewendDate: 1,
        startTime: 1,
        endTime: 1,
        recruiterName: 1,
        date: 1,
        time: 1,
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrations.contactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        aboutCompany: '$employerregistrations.aboutCompany',
        location: '$employerregistrations.location',
        choosefile: '$employerregistrations.choosefile',
      },
    },
  ]);
  console.log(employer[0].keySkill);
  const { candidates, subject, signature, email } = body;
  candidates.forEach(async (e) => {
    await EmployerMailNotification.create({ ...body, ...{ userId: userId, candidateId: e } });
    const candidate = await CandidateRegistration.findById(e);
    // console.log(candidate)
    if (body.mail == 'mail') {
      const data1 = await ejs.renderFile(__dirname + '/template.ejs', {
        name: candidate.name,
        subject: subject,
        signature: signature,
        keySkill: employer[0].keySkill,
        preferedIndustry: employer[0].preferedIndustry,
        preferredSkill: employer[0].preferredSkill,
        adminStatus: employer[0].adminStatus,
        active: employer[0].active,
        jobTittle: employer[0].jobTittle,
        contactNumber: employer[0].contactNumber,
        jobDescription: employer[0].jobDescription,
        educationalQualification: employer[0].educationalQualification,
        salaryRangeFrom: employer[0].salaryRangeFrom,
        salaryRangeTo: employer[0].salaryRangeTo,
        experienceFrom: employer[0].experienceFrom,
        experienceTo: employer[0].experienceTo,
        interviewType: employer[0].interviewType,
        candidateDescription: employer[0].candidateDescription,
        salaryDescription: employer[0].salaryDescription,
        urltoApply: employer[0].urltoApply,
        workplaceType: employer[0].workplaceType,
        industry: employer[0].industry,
        jobLocation: employer[0].jobLocation,
        employmentType: employer[0].employmentType,
        openings: employer[0].openings,
        role: employer[0].role,
        roleCategory: employer[0].roleCategory,
        department: employer[0].department,
        industry: employer[0].industry,
        interviewstartDate: employer[0].interviewstartDate,
        interviewendDate: employer[0].interviewendDate,
        startTime: employer[0].startTime,
        endTime: employer[0].endTime,
        recruiterName: employer[0].recruiterName,
        date: employer[0].date,
        time: employer[0].time,
        companyType: employer[0].companyType,
        mobileNumber: employer[0].mobileNumber,
        contactName: employer[0].contactName,
        email: employer[0].email,
        companyname: employer[0].name,
        aboutCompany: employer[0].aboutCompany,
        location: employer[0].location,
        choosefile: employer[0].choosefile,
      });
      const mainOptions = {
        from: body.email,
        to: candidate.email,
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
    }
  });

  return { messages: 'Send Notification Mail Successfully...' };
};

const getAll_Mail_notification_employerside = async (userId) => {
  const data = await EmployerMailNotification.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'candidateId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'candidatedetails',
              localField: '_id',
              foreignField: 'userId',
              pipeline: [
                {
                  $lookup: {
                    from: 'qualifications',
                    localField: 'sslcQualification',
                    foreignField: '_id',
                    as: 'sslcqualifications',
                  },
                },
                {
                  $unwind: {
                    path: '$sslcqualifications',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'qualifications',
                    localField: 'hsQualification',
                    foreignField: '_id',
                    as: 'hscqualifications',
                  },
                },
                {
                  $unwind: {
                    path: '$hscqualifications',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'qualifications',
                    localField: 'drQualification',
                    foreignField: '_id',
                    as: 'qualifications',
                  },
                },
                {
                  $unwind: {
                    path: '$qualifications',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'drcourses',
                    localField: 'drCourse',
                    foreignField: '_id',
                    as: 'drcourses',
                  },
                },
                {
                  $unwind: {
                    path: '$drcourses',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'drspecializations',
                    localField: 'drSpecialization',
                    foreignField: '_id',
                    as: 'drspecializations',
                  },
                },
                {
                  $unwind: {
                    path: '$drspecializations',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'qualifications',
                    localField: 'pgQualification',
                    foreignField: '_id',
                    as: 'pgqualifications',
                  },
                },
                {
                  $unwind: {
                    path: '$pgqualifications',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'pgcourses',
                    localField: 'pgCourse',
                    foreignField: '_id',
                    as: 'pgcourses',
                  },
                },
                {
                  $unwind: {
                    path: '$pgcourses',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'pgspecializations',
                    localField: 'pgSpecialization',
                    foreignField: '_id',
                    as: 'pgspecializations',
                  },
                },
                {
                  $unwind: {
                    path: '$pgspecializations',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'qualifications',
                    localField: 'ugQualification',
                    foreignField: '_id',
                    as: 'ugqualifications',
                  },
                },
                {
                  $unwind: {
                    path: '$ugqualifications',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'ugcourses',
                    localField: 'ugCourse',
                    foreignField: '_id',
                    as: 'ugcourses',
                  },
                },
                {
                  $unwind: {
                    path: '$ugcourses',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'specializations',
                    localField: 'ugSpecialization',
                    foreignField: '_id',
                    as: 'specializations',
                  },
                },
                {
                  $unwind: {
                    path: '$specializations',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industries',
                  },
                },
                {
                  $unwind: {
                    path: '$industries',
                    preserveNullAndEmptyArrays: true,
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
                  $lookup: {
                    from: 'rolecategories',
                    localField: 'roleCategory',
                    foreignField: '_id',
                    as: 'rolecategories',
                  },
                },
                {
                  $unwind: {
                    path: '$rolecategories',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $lookup: {
                    from: 'jobroles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'jobroles',
                  },
                },
                {
                  $unwind: {
                    path: '$jobroles',
                    preserveNullAndEmptyArrays: true,
                  },
                },
              ],
              as: 'candidatedetails',
            },
          },
          {
            $unwind: {
              path: '$candidatedetails',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              resume: 1,
              email: 1,
              workStatus: 1,
              mobileNumber: 1,
              name: 1,
              lat: 1,
              long: 1,
              resume: 1,
              createdAt: 1,
              updatedAt: 1,
              // candidateDetails: '$candidatedetails',
              keyskill: '$candidatedetails.keyskill',
              currentSkill: '$candidatedetails.currentSkill',
              preferredSkill: '$candidatedetails.preferredSkill',
              active: '$candidatedetails.active',
              image: '$candidatedetails.image',
              dob: '$candidatedetails.dob',
              experienceYear: '$candidatedetails.experienceYear',
              experienceMonth: '$candidatedetails.experienceMonth',
              expectedctc: '$candidatedetails.expectedctc',
              currentctc: '$candidatedetails.currentctc',
              locationCurrent: '$candidatedetails.locationCurrent',
              locationNative: '$candidatedetails.locationNative',
              noticeperiod: '$candidatedetails.noticeperiod',
              gender: '$candidatedetails.gender',
              maritalStatus: '$candidatedetails.maritalStatus',
              ugMarks: '$candidatedetails.ugMarks',
              ugGradingSystem: '$candidatedetails.ugGradingSystem',
              ugCourseType: '$candidatedetails.ugCourseType',
              ugCourseDurationTo: '$candidatedetails.ugCourseDurationTo',
              ugCourseDurationFrom: '$candidatedetails.ugCourseDurationFrom',
              relocate: '$candidatedetails.relocate',
              languages: '$candidatedetails.languages',
              ugUniversity: '$candidatedetails.ugUniversity',
              drQualification: '$candidatedetails.qualifications.qualification',
              drcourses: '$candidatedetails.drcourses.Course',
              drSpecialization: '$candidatedetails.drspecializations.Specialization',
              pgQualification: '$candidatedetails.pgqualifications.qualification',
              pgCourse: '$candidatedetails.pgcourses.Course',
              pgSpecialization: '$candidatedetails.pgspecializations.Specialization',
              ugQualification: '$candidatedetails.ugqualifications.qualification',
              ugCourse: '$candidatedetails.ugcourses.Course',
              ugSpecialization: '$candidatedetails.specializations.Specialization',
              role: '$candidatedetails.jobroles.Job_role',
              roleCategory: '$candidatedetails.rolecategories.Role_Category',
              department: '$candidatedetails.departments.Department',
              industry: '$candidatedetails.industries.Industry',
              sslctotalmarks: '$candidatedetails.sslctotalmarks',
              sslcPassedYear: '$candidatedetails.sslcPassedYear',
              sslcMedium: '$candidatedetails.sslcMedium',
              sslcBoard: '$candidatedetails.sslcBoard',
              sslcQualification: '$candidatedetails.sslcqualifications.qualification',
              pgUniversity: '$candidatedetails.pgUniversity',
              pgMarks: '$candidatedetails.pgUniversity',
              pgGradingSystem: '$candidatedetails.pgUniversity',
              pgCourseType: '$candidatedetails.pgUniversity',
              pgCourseDurationTo: '$candidatedetails.pgUniversity',
              pgCourseDurationFrom: '$candidatedetails.pgUniversity',
              hstotalmarks: '$candidatedetails.hstotalmarks',
              hsPassedYear: '$candidatedetails.hsPassedYear',
              hsMedium: '$candidatedetails.hsMedium',
              hsBoard: '$candidatedetails.hsBoard',
              drMarks: '$candidatedetails.drMarks',
              drGradingSystem: '$candidatedetails.drGradingSystem',
              drCourseType: '$candidatedetails.drCourseType',
              drCourseDurationTo: '$candidatedetails.drCourseDurationTo',
              drCourseDurationFrom: '$candidatedetails.drCourseDurationFrom',
              hsQualification: '$candidatedetails.hscqualifications.qualification',
              keyskillSet: '$candidatedetails.keyskillSet',
              drUniversity: '$candidatedetails.drUniversity',
              experienceMonthSet: '$candidatedetails.experienceMonthSet',
              locationSet: '$candidatedetails.locationSet',
              experienceYearSet: '$candidatedetails.experienceYearSet',
              designationSet: '$candidatedetails.designationSet',
              currentIndustry: '$candidatedetails.currentIndustry',
              currentDepartment: '$candidatedetails.currentDepartment',
              role_Category: '$candidatedetails.role_Category',
              salaryFrom: '$candidatedetails.salaryFrom',
              SalaryTo: '$candidatedetails.SalaryTo',
              // candidateDetails:'$candidatedetails'
            },
          },
        ],
        as: 'candidateregistrations',
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'mailId',
        foreignField: '_id',
        // pipeline:[
        //   {
        //     $lookup: {
        //       from: 'employercomments',
        //       localField: 'userId',
        //       foreignField: 'userId',
        //       as:'employercomments'
        //       }
        //     },
        //     {
        //       $unwind: {
        //         path: '$employercomments',
        //         preserveNullAndEmptyArrays: true,
        //       },
        //     },
        // ],
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
      $project: {
        jobTittle: '$employerdetails.jobTittle',
        // comment:'$employermailtemplates.employercomments.comment',
        // commentId:'$employermailtemplates.employercomments._id',
        status: 1,
        candidateDetail: '$candidateregistrations',
        subject: 1,
        signature: 1,
        email: 1,
        candidateId: 1,
        mailId: 1,
        date: 1,
      },
    },
  ]);
  return data;
};

// getAll_Mail_notification_candidateside

const getAll_Mail_notification_candidateside = async (userId) => {
  const data = await EmployerMailNotification.aggregate([
    {
      $match: {
        $and: [{ candidateId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        // pipeline:[
        // {
        //   $lookup: {
        //     from: 'employermailtemplates',
        //     localField: '_id',
        //     foreignField: 'userId',
        //     as:'employermailtemplates'
        //     }
        //   },
        // {
        //   $project:{
        //     companyName:1,
        //     city:'$employermailtemplates.jobLocation',
        //     jobTitle:'$employermailtemplates.jobTitle',
        //     experienceFrom:'$employermailtemplates.experienceFrom',
        //     experienceTo:'$employermailtemplates.experienceTo',
        //     ctc:'$employermailtemplates.ctc',
        //     date:'$employermailtemplates.date',
        //   }
        // }
        // ],
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
        from: 'employerdetails',
        localField: 'mailId',
        foreignField: '_id',
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
        from: 'candidatepostjobs',
        localField: 'mailId',
        foreignField: 'jobId',
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        subject: 1,
        signature: 1,
        email: 1,
        status: 1,
        jobTittle: '$employerdetails.jobTittle',
        jobLocation: '$employerdetails.jobLocation',
        salaryRangeFrom: '$employerdetails.salaryRangeFrom',
        salaryRangeTo: '$employerdetails.salaryRangeTo',
        experienceFrom: '$employerdetails.experienceFrom',
        experienceTo: '$employerdetails.experienceTo',
        company: '$employerregistrations.name',
        employerdetails: '$employerdetails',
        employerregistrations: '$employerregistrations',
        date: 1,
        appliedStatus: '$candidatepostjobs.approvedStatus',
      },
    },
  ]);
  return data;
};
// get jobpost data
const get_job_post = async (id) => {
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
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
      $project: {
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrations.contactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        keySkill: 1,
        jobTittle: 1,
        recruiterName: 1,
        contactNumber: 1,
        jobDescription: 1,
        educationalQualification: 1,
        salaryRangeFrom: 1,
        salaryRangeTo: 1,
        experienceFrom: 1,
        experienceTo: 1,
        interviewType: 1,
        candidateDescription: 1,
        salaryDescription: 1,
        urltoApply: 1,
        workplaceType: 1,
        industry: 1,
        preferedIndustry: 1,
        jobLocation: 1,
        employmentType: 1,
        openings: 1,
        date: 1,
        time: 1,
      },
    },
  ]);
  return data;
};

// get notification job id
const get_job_post_candidate = async (id, candidateId) => {
  // console.log(candidateId)
  const data = await EmployerMailNotification.aggregate([
    {
      $match: {
        $and: [{ _id: { $eq: id } }],
      },
    },
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
        from: 'candidateregistrations',
        localField: 'candidateId',
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
      $lookup: {
        from: 'candidatepostjobs',
        localField: 'mailId',
        foreignField: 'jobId',
        pipeline: [
          {
            $match: {
              $and: [{ userId: { $eq: candidateId } }],
            },
          },
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $unwind: {
        path: '$candidatepostjobs',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'employerdetails',
        localField: 'mailId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              keySkill: 1,
              jobTittle: 1,
              recruiterName: 1,
              contactNumber: 1,
              jobDescription: 1,
              educationalQualification: 1,
              salaryRangeFrom: 1,
              salaryRangeTo: 1,
              experienceFrom: 1,
              experienceTo: 1,
              interviewType: 1,
              candidateDescription: 1,
              salaryDescription: 1,
              urltoApply: 1,
              workplaceType: 1,
              industry: 1,
              preferedIndustry: 1,
              jobLocation: 1,
              employmentType: 1,
              interviewstartDate: 1,
              interviewendDate: 1,
              startTime: 1,
              endTime: 1,
              openings: 1,
              date: 1,
              time: 1,
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
      $project: {
        subject: 1,
        signature: 1,
        email: 1,
        companyType: '$employerregistrations.companyType',
        mobileNumber: '$employerregistrations.mobileNumber',
        contactName: '$employerregistrations.contactName',
        email: '$employerregistrations.email',
        name: '$employerregistrations.name',
        jobDetails: '$employerdetails',
        candiadteName: '$candidateregistrations.name',
        aboutCompany: '$employerregistrations.aboutCompany',
        appliedStatus: '$candidatepostjobs.approvedStatus',
      },
    },
  ]);
  return data;
};

// notification status change

const candidate_mailnotification_Change = async (id, body) => {
  const data = await EmployerMailNotification.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const value = await EmployerMailNotification.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value;
};

//
const neighbour_api = async (lat, long, type, radius) => {
  // console.log(location,type,radius)
  let response = await Axios.get(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=${radius}&type=${type}&keyword=${type}&key=AIzaSyDoYhbYhtl9HpilAZSy8F_JHmzvwVDoeHI`
  );

  return response.data;
};

// plan details

const All_Plans = async (userId) => {
  const data = await CreatePlan.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'planpayments',
        localField: '_id',
        foreignField: 'planId',
        pipeline: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
        as: 'planpayments',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$planpayments',
      },
    },
    {
      $project: {
        numberOfUsers: '$planpayments.total',
      },
    },
  ]);
  return data;
};

const all_plans_users_details = async (id) => {
  const data = await PlanPayment.aggregate([
    {
      $match: {
        $and: [{ planId: { $eq: id } }],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'employerdetails',
              localField: '_id',
              foreignField: 'userId',
              as: 'employerdetails',
            },
          },
        ],
        as: 'employerregistrations',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$employerregistrations',
      },
    },
    {
      $project: {
        cvCountUser: 1,
        cvCount: 1,
        countjobPost: 1,
        active: 1,
        cashType: 1,
        payAmount: 1,
        paymentStatus: 1,
        date: 1,
        time: 1,
        expDate: 1,
        companyname: '$employerregistrations.name',
        email: '$employerregistrations.email',
        companyType: '$employerregistrations.companyType',
        contactName: '$employerregistrations.contactName',
        mobileNumber: '$employerregistrations.mobileNumber',
        location: '$employerregistrations.location',
        employerdetails: '$employerregistrations.employerdetails',
      },
    },
  ]);
  return data;
};

const keySkillData = async (key) => {
  // const re = new RegExp(key.toLowerCase())
  // // console.log(re)
  // let fn = re.exec.bind(re);
  // let data = ["angular","nodejs","mongodb","python","sql","react","plsql","java","c","c++"]
  // let filtered = data.filter(fn);
  var query = new RegExp("\^" + key, "i");
  const data = await Skill.find({ Skill_Title: { $regex: query } }).sort({ Skill_Title: 1 }).limit(7);
  // .sort({ Skill_Title: 1 })
  // .select('Skill_Title')
  return data;
};

const location = async (key) => {
  const re = new RegExp(key.toLowerCase());
  // console.log(re)
  let fn = re.exec.bind(re);
  let data = [
    'nagapattinam',
    'mayiladuthurai',
    'madurai',
    'krishnagiri',
    'karur',
    'kanniyakumari',
    'erode',
    'dindigul',
    'dharmapuri',
    'ariyalur',
    'chennai',
    'kanchipuram',
    'villupuram',
    'pondicherry',
    'cuddalore',
    'kallakuruchi',
    'nagapattinam',
    'salem',
    'bangalore',
    'coimbatore',
  ];
  let filtered = data.filter(fn);
  return filtered;
};

const create_Recruiter = async (userId, body) => {
  const data = await Recruiters.create({ ...body, ...{ userId: userId } });
  return data;
};

const get_Recruiter = async (userId) => {
  const data = await Recruiters.find({ userId: userId });
  return data;
};

const get_Recruiter_id = async (id) => {
  const data = await Recruiters.findById(id);
  return data;
};

const Recruiter_edit = async (id, body) => {
  // console.log(id, body)
  const data = await Recruiters.findByIdAndUpdate({ _id: id }, body, { new: true });
  return data;
};

const Recruiter_delete = async (id) => {
  // console.log(id, body)
  const data = await Recruiters.deleteOne({ _id: id });
  return data;
};
module.exports = {
  createEmpDetails,
  getByIdUser,
  deleteById,
  updateById,
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
  create_Recruiter,
  get_Recruiter,
  get_Recruiter_id,
  Recruiter_edit,
  Recruiter_delete,
};
