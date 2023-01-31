const httpStatus = require('http-status');
const { EmployerDetails, EmployerPostDraft, Employercomment, EmployerMailTemplate, EmployerMailNotification} = require('../models/employerDetails.model');
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
const Axios = require('axios');

//keySkill

const createEmpDetails = async (userId, userBody) => {
  let app = await EmployerRegistration.findOne({_id:userId, adminStatus:"Approved"})
  if(!app){
    throw new ApiError(httpStatus.NOT_FOUND, 'Employer Not Approved');
  }
  const {validity} = userBody;
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
  let values
  if(!userBody.interviewDate){
    values = { ...userBody, ...{ userId: userId, expiredDate: expiredDate, date: date, time:creat1 } };
  }else{
     values = { ...userBody, ...{ userId: userId, expiredDate: expiredDate, date: date, time:creat1, interviewstartDate:interviewDate.startDate, interviewendDate:interviewDate.endDate, } };
  }
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
  return await Employercomment.create(values)
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

// notofication send candidate

const send_mail_and_notification = async (userId, body) => {
  const data = await EmployerRegistration.findById(userId)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const {candidates} = body
  candidates.forEach(async (e) => {
    await EmployerMailNotification.create({...body, ...{userId:userId, candidateId:e}});
 });
  return {messages:'Send Notification Mail Successfully...'}
}

const getAll_Mail_notification_employerside = async (userId) => {
  const data = await EmployerMailNotification.aggregate([
    {
      $match: {
        $and: [{ userId: { $eq: userId} }],
      },
    },
    {
      $lookup: {
        from: 'candidateregistrations',
        localField: 'candidateId',
        foreignField: '_id',
        pipeline:[
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
              locationCurrent:'$candidatedetails.locationCurrent',
              education:'$candidatedetails.education',
              experienceYear:'$candidatedetails.experienceYear',
              experienceMonth:'$candidatedetails.experienceMonth'
            }
          }
        ],
        as:'candidateregistrations'
        }
    },   
    {
      $lookup: {
        from: 'employermailtemplates',
        localField: 'userId',
        foreignField: 'userId',
        pipeline:[
          {
            $lookup: {
              from: 'employercomments',
              localField: 'userId',
              foreignField: 'userId',
              as:'employercomments'
              }
            },
        ],
        as:'employermailtemplates'
        }
      }, 
      {
        $project:{
          jobtitle:'$employermailtemplates.jobTitle',
          comment:'$employermailtemplates.employercomments.comment',
          commentId:'$employermailtemplates.employercomments._id',
          status:1,
          candidateDetail:'$candidateregistrations'
        }
      }
  ])
  return data
}

// getAll_Mail_notification_candidateside

const getAll_Mail_notification_candidateside = async (userId) => {
  const data = await EmployerMailNotification.aggregate([
    {
      $match: {
        $and: [{ candidateId: { $eq: userId} }],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline:[
          {
            $lookup: {
              from: 'employermailtemplates',
              localField: '_id',
              foreignField: 'userId',
              as:'employermailtemplates'
              }
            },
            {
              $project:{
                companyName:1,
                city:'$employermailtemplates.jobLocation',
                jobTitle:'$employermailtemplates.jobTitle',
                experienceFrom:'$employermailtemplates.experienceFrom',
                experienceTo:'$employermailtemplates.experienceTo',
                ctc:'$employermailtemplates.ctc',
                date:'$employermailtemplates.date',
              }
            }
        ],
        as:'employerregistrations'
        }
      },
      {
        $project:{
          status:1,
          employerregistrations:'$employerregistrations'
        }
      }
  ])
  return data

}

// notification status change 

const candidate_mailnotification_Change = async (id, body) => {
  const data = await EmployerMailNotification.findById(id)
  if(!data){
    throw new ApiError(httpStatus.NOT_FOUND, 'Data Not Found');
  }
  const value = await EmployerMailNotification.findByIdAndUpdate({ _id: id }, body, { new: true });
  return value
}


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
        $and: [{ userId: { $eq: userId} }],
      },
    },
    {
      $lookup: {
        from: 'planpayments',
        localField: '_id',
        foreignField: 'planId',
        pipeline:[
               {
                $group: {
                  _id: null,
                  total: {$sum: 1},
                }
               }
        ],
        as:'planpayments'
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$planpayments',
        },
      },
      {
        $project:{
          numberOfUsers:'$planpayments.total'
        }
      }
   ])
   return data ;
}

const all_plans_users_details = async (id) => {
  const data = await PlanPayment.aggregate([
    {
      $match: {
        $and: [{ planId: { $eq: id} }],
      },
    },
    {
      $lookup: {
        from: 'employerregistrations',
        localField: 'userId',
        foreignField: '_id',
        pipeline:[
          {
            $lookup: {
              from: 'employerdetails',
              localField: '_id',
              foreignField: 'userId',
              as:'employerdetails'
              }
            },
        ],
        as:'employerregistrations'
        }
      },
      {
        $unwind: {
          preserveNullAndEmptyArrays: true,
          path: '$employerregistrations',
        },
      },
      {
        $project:{
          cvCountUser:1,
          cvCount:1,
          countjobPost:1,
          active:1,
          cashType:1,
          payAmount:1,
          paymentStatus:1,
          date:1,
          time:1,
          expDate:1,
          companyname:'$employerregistrations.name',
          email:'$employerregistrations.email',
          companyType:'$employerregistrations.companyType',
          contactName:'$employerregistrations.contactName',
          mobileNumber:'$employerregistrations.mobileNumber',
          location:'$employerregistrations.location',
          employerdetails:'$employerregistrations.employerdetails'
        }
      }
  ])
  return data
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
  send_mail_and_notification,
  getAll_Mail_notification_employerside,
  getAll_Mail_notification_candidateside,
  candidate_mailnotification_Change,
  neighbour_api,
  All_Plans,
  all_plans_users_details,
};
