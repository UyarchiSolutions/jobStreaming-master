const httpStatus = require('http-status');
const { EmployerDetails, EmployerPostDraft, Employercomment, EmployerMailTemplate} = require('../models/employerDetails.model');
const { PlanPayment } = require('../models/planPaymentDetails.model');
const { CandidatePostjob} = require('../models/candidateDetails.model');
const { CandidateRegistration } = require('../models');
const { CreatePlan } = require('../models/createPlan.model');
const { EmployerRegistration } = require('../models');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { format } = require('morgan');
const { create } = require('../models/candidateRegistration.model');

//keySkill

const createEmpDetails = async (userId, userBody) => {
  let app = await EmployerRegistration.findOne({_id:userId, adminStatus:"Approved"})
  if(!app){
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer Not Approved');
  }
  const {validity, interviewDate} = userBody;
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  let expiredDate
  // console.log(validity);
  const plan = await PlanPayment.findOne({userId:userId, active:true})
  const pay = await  CreatePlan.findOne({_id:plan.planId})
  if(pay){
   expiredDate = moment().add(pay.jobPostVAlidity, 'days').format('YYYY-MM-DD');
  }else{
    expiredDate = moment().add(1, 'days').format('YYYY-MM-DD');
  }
  let values = { ...userBody, ...{ userId: userId, expiredDate: expiredDate, date: date, time:creat1, interviewstartDate:interviewDate.startDate, interviewendDate:interviewDate.endDate, } };
  const freeCount = await EmployerDetails.find({userId:userId})
  const usser = await EmployerRegistration.findById(userId)
  console.log(freeCount.length, usser.freePlanCount)
  if(freeCount.length  >= usser.freePlanCount){
  const da = await PlanPayment.findOne({userId:userId, active:true})
  if(!da){
    throw new ApiError(httpStatus.NOT_FOUND, 'your not pay the plan');
  }
  if(date > da.expDate){
    await PlanPayment.findByIdAndUpdate({_id:da._id}, {active:false}, {new:true})
    throw new ApiError(httpStatus.NOT_FOUND, 'plan time expired');
  }
     const createPlan = await CreatePlan.findOne({_id:da.planId})
     if(da.countjobPost == createPlan.jobPost){
      await PlanPayment.findByIdAndUpdate({_id:da._id}, {active:false}, {new:true})
      throw new ApiError(httpStatus.NOT_FOUND, 'jobpost limit over...');
     }
    // }
    let count = da.countjobPost += 1
    await PlanPayment.findByIdAndUpdate({_id:da._id}, {countjobPost:count}, {new:true})
  }

  let data = await EmployerDetails.create(values);
  // if(freeCount == usser.freePlanCount){
  // }
  return data;
};

const createEmpDetailsRepost = async (id, userBody) => {
  const { userId } = userBody;
  let expiredDate
  const plan = await PlanPayment.findOne({userId:userId, active:true})
  const pay = await  CreatePlan.findOne({_id:plan.planId})
  if(pay){
   expiredDate = moment().add(pay.jobPostVAlidity, 'days').format('YYYY-MM-DD');
  }else{
    expiredDate = moment().add(1, 'days').format('YYYY-MM-DD');
  }
  // let expiredDate = moment().add(validity, 'days').format('YYYY-MM-DD');
  let date = moment().format('YYYY-MM-DD');
  let creat1 = moment().format('HHmmss');
  const user = await getById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'employerDetails not found');
  }
  let values = { ...userBody, ...{ expiredDate: expiredDate, date: date, adminStatus: 'Pending', time:creat1} };
  console.log(values)
  const data = await EmployerDetails.findByIdAndUpdate({ _id: id }, values, { new: true });
  let count = plan.countjobPost += 1
  await PlanPayment.findByIdAndUpdate({_id:plan._id}, {countjobPost:count}, {new:true})
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
      $project: {
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


const countPostjobError = async (userId) =>{
  let date = moment().format('YYYY-MM-DD');
  let app = await EmployerRegistration.findOne({_id:userId, adminStatus:"Approved"})
  if(!app){
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer Not Approved');
  }
  const freeCount = await EmployerDetails.find({userId:userId})
  const usser = await EmployerRegistration.findById(userId)
  const daaa = await PlanPayment.findOne({userId:userId, active:true})
  if(freeCount.length == usser.freePlanCount && !daaa){ 
    throw new ApiError(httpStatus.NOT_FOUND, 'your free post over..');
  }
   if(freeCount.length >= usser.freePlanCount){
   const da = await PlanPayment.findOne({userId:userId, active:true})
   if(!da){
    throw new ApiError(httpStatus.NOT_FOUND, 'your not pay the plan');
   }
   const createPlan = await CreatePlan.findOne({_id:da.planId})
   if(da.countjobPost == createPlan.jobPost){
    throw new ApiError(httpStatus.NOT_FOUND, 'jobpost limit over...');
   }
   if(date > da.expDate){
    await PlanPayment.findByIdAndUpdate({_id:da._id}, {active:false}, {new:true})
    throw new ApiError(httpStatus.NOT_FOUND, 'plan time expired');
  }
}
  return {message:"button enable"}
}


const EmployerspostDraft = async (userId, userBody) => {
  let app = await EmployerRegistration.findOne({_id:userId, adminStatus:"Approved"})
  if(!app){
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
  let values ;
  console.log(userBody.interviewDate, "huhi")
  if(!userBody.interviewDate){
    console.log("fer")
     values = { ...userBody, ...{ userId: userId, date: date, time:creat1} };
  }else{
     values = { ...userBody, ...{ userId: userId, date: date, time:creat1, interviewstartDate:interviewDate.startDate, interviewendDate:interviewDate.endDate} };
  }
  let data1 = await EmployerPostDraft.create(values);
  return data1
}
 

const draftData_employerside = async (userId) => {
  const data = await EmployerPostDraft.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
  ])
  return data
}

const draftData_employerside_ById = async (id) => {
  const data = await EmployerPostDraft.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data
}

const draftData_delete = async (id) => {
  const data = await EmployerPostDraft.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  await data.remove();
}

// postjob_candidate_Applied_datas
const getAllApplied_postjobs_Candidates = async (userId)=> {
  const data = await EmployerDetails.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId } }],
      },
    },
    {
      $lookup: {
        from: 'candidatepostjobs',
        localField: '_id',
        foreignField: 'jobId', 
        pipeline:[
          {
            $lookup: {
              from: 'candidateregistrations',
              localField: 'userId',
              foreignField: '_id', 
              pipeline:[
                {
                  $lookup: {
                    from: 'candidatedetails',
                    localField: '_id',
                    foreignField: 'userId', 
                    as: 'candidatedetails',
                  },
                },
                {
                $project:{
                  name:1,
                  locationCurrent:'$candidatedetails.locationCurrent',
                  specification:'$candidatedetails.specification',
                  education:'$candidatedetails.education',
                  keyskill:'$candidatedetails.keyskill',
                  currentSkill:'$candidatedetails.currentSkill',
                  preferredSkill:'$candidatedetails.preferredSkill',
                  experienceYear:'$candidatedetails.experienceYear',
                  experienceMonth:'$candidatedetails.experienceMonth',
                }
              }
              ],
              as: 'candidateregistrations',
            },
          },
        ],
        as: 'candidatepostjobs',
      },
    },
    {
      $project:{
        candidateId:'$candidatepostjobs.candidateregistrations._id',
        employerCommand:'$candidatepostjobs.employerCommand',
        postjobId:'$candidatepostjobs._id',
        status:'candidatepostjobs.approvedStatus',
        candidateData:'candidatepostjobs.candidateregistrations',
      }
    }
  ])
  return data 
}

const statusChange_employer  = async (id, updateBody) => {
const data = await CandidatePostjob.findById(id)
if(!data){
  throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
}
const Data = await CandidatePostjob.findByIdAndUpdate({ _id: id }, updateBody, { new: true });
return Data
}

const getByIdAll_CandidateDetails = async (id) => {
  const data = await CandidateRegistration.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: id} }],
      },
    },
    {
      $lookup: {
        from: 'candidatedetails',
        localField: '_id',
        foreignField: 'userId',
        as:'candidatedetails'
        }
      },
      {
        $project:{
          name:1,
          email:1,
          mobileNumber:1,
          resume:1,
          keyskill:'$candidatedetails.keyskill',
          currentSkill:'$candidatedetails.currentSkill',
          preferredSkill:'$candidatedetails.preferredSkill',
          experienceMonth:'$candidatedetails.experienceMonth',
          experienceYear:'$candidatedetails.experienceYear',
          salaryRangeFrom:'$candidatedetails.salaryRangeFrom',
          salaryRangeTo:'$candidatedetails.salaryRangeTo',
          locationCurrent:'$candidatedetails.locationCurrent',
          education:'$candidatedetails.education',
          specification:'$candidatedetails.specification',
          university:'$candidatedetails.university',
          courseType:'$candidatedetails.courseType',
          passingYear:'$candidatedetails.passingYear',
          gradingSystem:'$candidatedetails.gradingSystem',
          availability:'$candidatedetails.availability',
          gender:'$candidatedetails.gender',
          maritalStatus:'$candidatedetails.maritalStatus',
          mark:'$candidatedetails.mark',
          image:'$candidatedetails.image',
        }
      }
  ])
  return data
}

// comment

const employer_comment = async (userId, Body) =>{
  let values = {...Body, ...{userId:userId}}
  return await create(values)
}

//edit comment 

const comment_edit = async (id, body)  => {
  const data = await Employercomment.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const Data = await Employercomment.findByIdAndUpdate({ _id: id }, body, { new: true });
  return Data
}

// mail template

const mail_template_create = async (userId, body) => {
    const data = await EmployerRegistration.findById(userId)
    if(!data){
      throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
    }
   return await EmployerMailTemplate.create({...body, ...{userId:userId}})
}

const mail_template_data = async (userId) => {
  const data = await EmployerMailTemplate.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId} }],
      },
    },
  ])
  return data 
}

const mail_template_data_Id = async (id) => {
  const data = await EmployerMailTemplate.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  return data
}

const mail_template_data_Update = async (id, body) => {
  const data = await EmployerMailTemplate.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
   const value = await EmployerMailTemplate.findByIdAndUpdate({ _id: id }, body, { new: true });
   return value
}

const mail_template_data_delete = async (id, body) => {
  const data = await EmployerMailTemplate.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
   await data.remove();
}


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
};
