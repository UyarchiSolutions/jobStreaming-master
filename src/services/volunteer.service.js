const httpStatus = require('http-status');
const moment = require('moment');
const { Volunteer, VolunteerOTP } = require('../models/vlounteer.model');
const { EventRegister } = require('../models/climb-event.model');
const { AgriCandidate, IntrestedCandidate, SlotBooking } = require('../models/agri.Event.model');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const axios = require('axios');
const { default: strictTransportSecurity } = require('helmet/dist/middlewares/strict-transport-security');
const createVolunteer = async (req) => {
  let body = req.body;
  let findByEmail = await Volunteer.findOne({ email: body.email });
  let findByMobile = await Volunteer.findOne({ mobileNumber: body.mobileNumber });
  if (findByEmail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Exists');
  }
  if (findByMobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Exists');
  }
  let creations = await Volunteer.create(body);
  return creations;
};

const setPassword = async (req) => {
  const { password, email } = req.body;
  let findByemail = await Volunteer.findOne({ email: email });
  console.log(findByemail)
  if (!findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found');
  }
  const salt = await bcrypt.genSalt(8);
  let pwd = await bcrypt.hash(password, salt);
  findByemail = await Volunteer.findByIdAndUpdate({ _id: findByemail._id }, { password: pwd }, { new: true });
  return findByemail;
};

const change_password = async (req) => {
  let id = req.userId;
  let data = await Volunteer.findById(id);
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid User');
  }
  const { password, confirmpassword, oldpassword } = req.body;
  if (password != confirmpassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'confirmpassword wrong');
  }
  if (!await data.isPasswordMatch(oldpassword)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Old Password Doesn't Match");
  }
  const salt = await bcrypt.genSalt(10);
  let password1 = await bcrypt.hash(password, salt);
  data = await Volunteer.findByIdAndUpdate({ _id: id }, { password: password1 }, { new: true });
  return data;
};

const forget_password = async (req) => {
  console.log(req.body.text)
  let data = await Volunteer.findOne({ mobileNumber: req.body.text })
  if (!data) {
    data = await Volunteer.findOne({ email: req.body.text })
  }

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return { id: data._id }
}

const Login = async (req) => {
  const { password, email } = req.body;
  let findByemail = await Volunteer.findOne({ email: email });
  if (!findByemail) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect Email');
  }
  if (findByemail.password == null) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password Does not set Check your Email or forgot password!');
  }
  if (!(await findByemail.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }
  return findByemail;
};

const getProfile = async (req) => {
  let id = req.userId;
  const findById = await Volunteer.findById(id);
  if (!findById) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'UnAuthorized');
  }
  return findById;
};

const MatchCandidate = async (req) => {
  let id = req.userId;
  let Role = req.Role;
  console.log(Role);
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer not found');
  }
  let volunSkills = values.skills;
  keySkillSearch = { active: true };
  if (volunSkills.length > 0) {
    let arr = [];
    volunSkills.forEach((e) => {
      arr.push({ skills: { $elemMatch: { $regex: e, $options: 'i' } } });
    });
    keySkillSearch = { $or: arr };
  } else {
    keySkillSearch;
  }

  let commingDataMatch = { active: true };
  let match_experience = { active: true };
  if (values.Role == 'Tech Volunteer') { // match_experience = 
    let coreExperienceFrom = values.coreExperienceFrom;
    let coreExperienceTo = values.coreExperienceTo;
    let month = (coreExperienceTo * 100) / 1200;
    totalexp = coreExperienceFrom + month;
    match_experience = { experience: { $lt: totalexp } }
    let findCand = await AgriCandidate.aggregate([
      {
        $match: {
          $and: [keySkillSearch, { status: { $in: ['Slot Chosen', 'Approved', 'Waiting For Approval'] } }],
        },
      },
      {
        $addFields: {
          experience: { $add: [{ $divide: [{ $multiply: ["$experience_month", 100] }, 1200] }, "$experience_year"] },
        },
      },
      {
        $match: { $and: [match_experience] },
      },
      {
        $lookup: {
          from: 'slotbookings',
          localField: '_id',
          foreignField: 'candId',
          pipeline: [
            { $match: { streamStatus: 'Pending', Type: 'Tech' } },
            {
              $lookup: {
                from: 'intrestedcandidates',
                localField: 'DateTime',
                foreignField: 'startTime',
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          volunteerId: { $eq: id }
                        }
                      ]
                    }
                  },
                  {
                    $lookup: {
                      from: 'agricandidates',
                      localField: 'candId',
                      foreignField: '_id',
                      as: 'agricand',
                    },
                  },
                  {
                    $unwind: {
                      preserveNullAndEmptyArrays: true,
                      path: '$agricand',
                    },
                  },
                ],
                as: 'already_choosen',
              },
            },
            {
              $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$already_choosen',
              },
            },
            {
              $addFields: {
                already_choosenss: {
                  $cond: {
                    if: { $eq: [true, { $ifNull: ["$already_choosen", true] }] },
                    then: false,
                    else: {
                      $cond: {
                        if: { $eq: ["$already_choosen.status", 'Approved'] },
                        then: true,
                        else: {
                          $cond: {
                            if: { $in: ['$already_choosen.agricand.status', ['Slot Chosen', 'Approved', 'Waiting For Approval']] },
                            then: true,
                            else: false,
                          },
                        },
                      },
                    }
                  }
                }
              },
            },
          ],
          as: 'candidate',
        },
      },
      {
        $unwind: '$candidate',
      },
      {
        $addFields: {
          isIdInArrayss: {
            $in: [id, '$techIntrest'],
          },
        },
      },
      {
        $lookup: {
          from: 'intrestedcandidates',
          localField: '_id',
          foreignField: 'candId',
          as: 'intrestedcand',
        },
      },
      {
        $project: {
          _id: 1,
          skills: 1,
          name: 1,
          location: 1,
          yearOfPassing: 1,
          techIntrest: '$techIntrestss',
          intrest: 1,
          slotDate: '$candidate.date',
          slotTime: '$candidate.time',
          already_choosen: "$candidate.already_choosenss",
          Type: '$candidate.Type',
          slotId: '$candidate._id',
          isIdInArray: '$isIdInArrayss',
          Tech: { $size: '$techIntrest' },
          HR: { $size: '$intrest' },
          experience: 1,
          already_: "$candidate",
          experience_year: 1,
          experience_month: 1
        },
      },
      {
        $match: { Tech: { $lt: 5 } },
      },
    ]);

    return findCand;
  } else {
    let coreExperienceFrom = values.hrExperienceFrom;
    let coreExperienceTo = values.hrExperienceTo;
    let month = (coreExperienceTo * 100) / 1200;
    totalexp = coreExperienceFrom + month;
    match_experience = { experience: { $lt: totalexp } }
    let findCand = await AgriCandidate.aggregate([
      {
        $lookup: {
          from: 'slotbookings',
          localField: '_id',
          foreignField: 'candId',
          pipeline: [
            { $match: { streamStatus: 'Pending', Type: 'HR' } },
            {
              $lookup: {
                from: 'intrestedcandidates',
                localField: 'DateTime',
                foreignField: 'startTime',
                pipeline: [
                  {
                    $match: {
                      $and: [
                        {
                          volunteerId: { $eq: id }
                        }
                      ]
                    }
                  },
                  {
                    $lookup: {
                      from: 'agricandidates',
                      localField: 'candId',
                      foreignField: '_id',
                      as: 'agricandidates',
                    },
                  },
                  {
                    $unwind: {
                      preserveNullAndEmptyArrays: true,
                      path: '$agricandidates',
                    },
                  },
                ],
                as: 'already_choosen',
              },
            },
            {
              $unwind: {
                preserveNullAndEmptyArrays: true,
                path: '$already_choosen',
              },
            },
            {
              $addFields: {
                already_choosenss: {
                  $cond: {
                    if: { $eq: [true, { $ifNull: ["$already_choosen", true] }] },
                    then: false,
                    else: {
                      $cond: {
                        if: { $ne: ["$already_choosen.hrStatus", 'Pending'] },
                        then: true,
                        else: {
                          $cond: {
                            if: { $in: ['$already_choosen.agricandidates.status', ['Slot Chosen', 'Approved', 'Waiting For Approval']] },
                            then: true,
                            else: false,
                          },
                        },
                      },
                    }
                  }
                }
              },
            },

          ],
          as: 'candidate',
        },
      },
      {
        $unwind: '$candidate',
      },
      {
        $addFields: {
          isIdInArrayss: {
            $in: [id, '$intrest'],
          },
        },
      },
      {
        $addFields: {
          experience: { $add: [{ $divide: [{ $multiply: ["$experience_month", 100] }, 1200] }, "$experience_year"] }
        },
      },
      {
        $match: { $and: [match_experience, { status: { $in: ['Slot Chosen', 'Approved', 'Waiting For Approval'] } }] },
      },
      {
        $lookup: {
          from: 'intrestedcandidates',
          localField: '_id',
          foreignField: 'candId',
          as: 'intrestedcand',
        },
      },
      {
        $project: {
          _id: 1,
          skills: 1,
          name: 1,
          location: 1,
          yearOfPassing: 1,
          techIntrest: 1,
          intrest: '$techIntrestss',
          slotDate: '$candidate.date',
          slotTime: '$candidate.time',
          Type: '$candidate.Type',
          slotId: '$candidate._id',
          isIdInArray: '$isIdInArrayss',
          Tech: { $size: '$techIntrest' },
          already_choosen: "$candidate.already_choosenss",
          already_: "$candidate",
          HR: { $size: '$intrest' },
          experience: 1,
          experience_year: 1,
          experience_month: 1
        },
      },
      {
        $match: { $and: [{ HR: { $lt: 5 } }] },
      },
    ]);
    return findCand;
  }
};

const CandidateIntrestUpdate = async (req) => {
  let volunteerId = req.userId;
  let candId = req.params.id;
  let slotId = req.params.slotId;
  let cand = await AgriCandidate.findById(candId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, " Couldn't find candidate");
  }
  let slots = await SlotBooking.findById(slotId);
  if (!slots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slots Not Found');
  }
  let values = await Volunteer.findById(volunteerId);
  if (values.Role == 'HR Volunteer') {
    if (cand.interest_HR >= 5) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Slot Booking Full");
    }
    console.log(cand.interest_HR, cand.interest_HR + 1)
    // cand.interest_HR = cand.interest_HR + 1;
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { intrest: volunteerId }, interest_HR: cand.interest_HR + 1 }, { new: true });
    console.log(cand.interest_HR, cand)
    if (cand.interest_TECH >= 2 && cand.interest_HR >= 2) {
      cand.status = 'Waiting For Approval';
    }
    cand.save();
  } else {
    if (cand.interest_TECH >= 5) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Slot Booking Full");
    }
    console.log(cand.interest_TECH, cand.interest_TECH + 1)
    // cand.interest_TECH = cand.interest_TECH + 1;
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { techIntrest: volunteerId, }, interest_TECH: cand.interest_TECH + 1 }, { new: true });
    console.log(cand.interest_TECH, cand)

    if (cand.interest_TECH >= 2 && cand.interest_HR >= 2) {
      cand.status = 'Waiting For Approval';
    }
    cand.save();
  }

  await IntrestedCandidate.create({
    candId: candId,
    volunteerId: volunteerId,
    status: 'Intrested',
    Role: values.Role,
    slotId: slotId,
    slotDate: slots.date,
    slotTime: slots.time,
    startTime: slots.DateTime,
    endTime: slots.endTime,
  });
  return cand;
};

const CandidateIntrestUpdate_admin = async (req) => {
  let volunteerId = req.params.volunteer;
  let candId = req.params.id;
  let cand = await AgriCandidate.findById(candId);
  if (!cand) {
    throw new ApiError(httpStatus.BAD_REQUEST, " Couldn't find candidate");
  }
  let values = await Volunteer.findById(volunteerId);
  let userrole = values.Role == 'Tech Volunteer' ? 'Tech' : 'HR'
  let slots = await SlotBooking.findOne({ Type: userrole, candId: candId });
  if (!slots) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slots Not Found');
  }

  let already = await IntrestedCandidate.findOne({ startTime: slots.DateTime, volunteerId: volunteerId });
  if (already) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already Intrested');
  }

  if (values.Role == 'HR Volunteer') {
    if (cand.interest_HR >= 5) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Slot Booking Full");
    }
    // console.log(cand.interest_HR, cand.interest_HR + 1)
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { intrest: volunteerId }, interest_HR: cand.interest_HR + 1 }, { new: true });
    if (cand.interest_TECH >= 2 && cand.interest_HR >= 2) {
      cand.status = 'Waiting For Approval';
    }
    cand.save();
  } else {
    if (cand.interest_TECH >= 5) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Slot Booking Full");
    }
    console.log(cand.interest_TECH, cand.interest_TECH + 1)
    // cand.interest_TECH = cand.interest_TECH + 1;
    cand = await AgriCandidate.findByIdAndUpdate({ _id: candId }, { $push: { techIntrest: volunteerId, }, interest_TECH: cand.interest_TECH + 1 }, { new: true });
    console.log(cand.interest_TECH, cand)

    if (cand.interest_TECH >= 2 && cand.interest_HR >= 2) {
      cand.status = 'Waiting For Approval';
    }
    cand.save();
  }

  await IntrestedCandidate.create({
    candId: candId,
    volunteerId: volunteerId,
    status: 'Intrested',
    Role: values.Role,
    slotId: slots._id,
    slotDate: slots.date,
    slotTime: slots.time,
    startTime: slots.DateTime,
    endTime: slots.endTime,
  });
  return cand;
};


const uploadProfileImage = async (req) => {
  let id = req.params.id;
  let findVol = await Volunteer.findById(id);
  if (!findVol) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer does not exist');
  }

  if (req.files) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });


    return new Promise((resolve, reject) => {
      if (req.files.resume != null) {
        console.log('resume')
        let params = {
          Bucket: 'jobresume',
          Key: req.files.resume[0].originalname,
          Body: req.files.resume[0].buffer,
          ACL: 'public-read',
          ContentType: req.files.resume[0].mimetype,
        };
        s3.upload(params, async (err, res) => {
          if (err) {
            reject(err);
          } else {
            let updateImgLoca = await Volunteer.findByIdAndUpdate({ _id: id }, { resume: res.Location }, { new: true });
            if (req.files.image == null) {
              resolve(updateImgLoca);
            }
          }
        });
      }
      if (req.files.image != null) {
        let params = {
          Bucket: 'jobresume',
          Key: req.files.image[0].originalname,
          Body: req.files.image[0].buffer,
          ACL: 'public-read',
          ContentType: req.files.image[0].mimetype,
        };
        s3.upload(params, async (err, res) => {
          if (err) {
            reject(err);
          } else {
            let updateImgLoca = await Volunteer.findByIdAndUpdate({ _id: id }, { profileImage: res.Location }, { new: true });
            resolve(updateImgLoca);
          }
        });

      }
      if (req.files.image == null && req.files.resume == null) {
        resolve({ message: 'No File There' })
      }
    });
  }


};

const getVolunteersDetails = async (req) => {
  let id = req.userId;
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Found');
  }
  return values;
};

const getCandidatesForInterview = async (req) => {
  let id = req.userId;
  let role = req.Role == 'HR Volunteer' ? 'HR' : 'Tech';

  console.log(role);
  let statusMatch = { active: true };
  let ClearMatch = { active: true };

  if (role == 'HR') {
    statusMatch = {
      hrStatus: 'Approved',
    };
    ClearMatch = {
      hrclear: true,
    };
  } else {
    statusMatch = {
      status: 'Approved',
    };
    clear = {
      techclear: true,
    };
  }
  let values = await Volunteer.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User Not Found');
  }
  let candidates = await IntrestedCandidate.aggregate([
    {
      $match: { $and: [{ volunteerId: id }, statusMatch] },
    },
    {
      $lookup: {
        from: 'agricandidates',
        localField: 'candId',
        pipeline: [
          {
            $lookup: {
              from: 'slotbookings',
              localField: '_id',
              foreignField: 'candId',
              pipeline: [{ $match: { $and: [{ Type: { $eq: role } }] } }],
              as: 'slotbookings',
            },
          },
          { $unwind: '$slotbookings' },
          {
            $addFields: {
              DateTime: '$slotbookings.DateTime',
              channel: '$slotbookings._id',
              streamStatus: '$slotbookings.streamStatus',
              streamId: '$slotbookings._id',
            },
          },
        ],
        foreignField: '_id',
        as: 'Cand',
      },
    },
    {
      $unwind: '$Cand',
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: 'slotId',
        foreignField: '_id',
        as: 'slotbookings',
      },
    },
    {
      $unwind: '$slotbookings',
    },
    {
      $addFields: {
        DateTime: '$Cand.DateTime',
        channel: '$Cand.channel',
        streamStatus_can: '$Cand.streamStatus',
        streamId: '$Cand.streamId',
        hrclear: '$Cand.hrClear',
        techclear: '$Cand.clear',
        candidate_join: "$slotbookings.candidate_join"
      },
    },
    {
      $match: ClearMatch,
    },
  ]);

  pending = await IntrestedCandidate.find().populate({
    path: '',
    model: 'SlotBooking',
    match: { candidate_join: true }
  }).exec();
  pending = await IntrestedCandidate.aggregate([
    { $match: { $and: [{ volunteerId: id }, { streamStatus: "Joined" }, { rating: { $eq: "Rating Pending" } }] } },
    {
      $lookup: {
        from: 'slotbookings',
        localField: 'slotId',
        foreignField: '_id',
        pipeline: [
          { $match: { candidate_join: true } }
        ],
        as: 'slotId',
      },
    },
    { $unwind: "$slotId" },
    { $limit: 1 }
  ])
  let pending_id;
  let pending_now = false;
  if (pending.length != 0) {
    pending_now = pending[0].slotId.candidate_join;
    if (pending_now)
      pending_id = pending[0]._id;
  }
  return { candidates, pending: pending_now, pending_id: pending_id };
};

const updateVolunteer = async (req) => {
  console.log(req.userId)
  let findById = await Volunteer.findById(req.userId);
  if (!findById) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Volunteer not found');
  }
  findById = await Volunteer.findByIdAndUpdate({ _id: req.userId }, req.body, { new: true });
  return findById;
};

// const send_otp = async (req) => {
//   console.log(req.query.id)
//   let stream = await DemoPost.findById(req.query.id);
//   if (!stream) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Link');
//   }
//   let res = await send_otp_now(stream);
//   return res;
// };

const send_otp_now = async (stream) => {
  let OTPCODE = Math.floor(100000 + Math.random() * 900000);
  let Datenow = new Date().getTime();
  let otpsend = await VolunteerOTP.findOne({
    VolunteerId: stream._id,
    otpExpiedTime: { $gte: Datenow },
    verify: false,
    expired: false,
  });
  if (!otpsend) {
    const token = await Volunteer.findById(stream._id);
    await VolunteerOTP.updateMany(
      { VolunteerId: stream._id, verify: false },
      { $set: { verify: true, expired: true } },
      { new: true }
    );
    let exp = moment().add(5, 'minutes');
    let otp = await VolunteerOTP.create({
      OTP: OTPCODE,
      verify: false,
      mobile: token.mobileNumber,
      VolunteerId: stream._id,
      DateIso: moment(),
      expired: false,
      otpExpiedTime: exp,
    });
    let message = `${OTPCODE} is the Onetime password(OTP) for mobile number verification . This is usable once and valid for 5 minutes from the request- Climb(An Ookam company product)`;
    let reva = await axios.get(
      `http://panel.smsmessenger.in/api/mt/SendSMS?user=ookam&password=ookam&senderid=OOKAMM&channel=Trans&DCS=0&flashsms=0&number=${token.mobileNumber}&text=${message}&route=6&peid=1701168700339760716&DLTTemplateId=1707170322899337958`
    );
    console.log(reva.data);
    otpsend = { otpExpiedTime: otp.otpExpiedTime };
  } else {
    otpsend = { otpExpiedTime: otpsend.otpExpiedTime };
  }
  return otpsend;
};

const sendOTP = async (req, res) => {
  let volunteer = await Volunteer.findById(req.query.id);
  if (!volunteer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP NOT Send');
  }
  let otpsend = await send_otp_now(volunteer);
  return otpsend;
};

const VerifyOTP = async (req) => {
  let { id, OTP } = req.body;
  let Datenow = new Date().getTime();
  let verify = await VolunteerOTP.findOne({
    VolunteerId: id,
    OTP: OTP,
    verify: false,
    expired: false,
    otpExpiedTime: { $gt: Datenow },
  });
  if (!verify) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid OTP');
  } else {
    verify.verify = true;
    verify.expired = true;
    verify.save();
    let values = await Volunteer.findById(verify.VolunteerId);
    return values;
  }
};

const getIntrestedCandidates = async (req) => {
  let userId = req.userId;
  let role = req.Role == 'HR Volunteer' ? 'HR' : 'Tech';
  let matchIntrestedCand = { active: true };
  let typeMatch = { active: true };
  let statusMatch = "$IntrestedCandidate.status";
  let statusValue = 'Intrested';
  if (role == 'HR') {
    matchIntrestedCand = { intrest: { $in: [userId] } };
    typeMatch = { Type: { $eq: "HR" } };
    statusMatch = "$IntrestedCandidate.hrStatus";
    statusValue = 'Pending';
  } else {
    matchIntrestedCand = { techIntrest: { $in: [userId] } };
    typeMatch = { Type: { $eq: "Tech" } }
  }
  let values = await AgriCandidate.aggregate([
    {
      $match: matchIntrestedCand,
    },
    {
      $lookup: {
        from: 'intrestedcandidates',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: { volunteerId: userId } }],
        as: 'IntrestedCandidate',
      },
    },
    {
      $unwind: {
        preserveNullAndEmptyArrays: true,
        path: '$IntrestedCandidate',
      },
    },
    {
      $lookup: {
        from: 'slotbookings',
        localField: '_id',
        foreignField: 'candId',
        pipeline: [{ $match: typeMatch }],
        as: 'slotbookings',
      },
    },
    {
      $unwind: '$slotbookings',
    },

    { $addFields: { DateTime: "$slotbookings.DateTime" } },
    { $unset: "slotbookings" },
    {
      $addFields: {
        stream_approval: {
          $cond: {
            if: { $ne: [statusMatch, statusValue] },
            then: false,
            else: {
              $cond: {
                if: { $in: ['$status', ['Slot Chosen', 'Approved', 'Waiting For Approval']] },
                then: false,
                else: true,
              },
            },
          },
        }
      },
    },
  ]);
  return values;
};

const UndoIntrestedCandidate = async (req) => {
  let candId = req.params.id;
  let volId = req.userId;
  let role = req.Role;
  let findCand = await AgriCandidate.findById(candId);
  if (!findCand) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Sorry  Deleted Choosen From AgriCandidate table');
  }
  if (role == 'HR Volunteer') {

    findCand.interest_HR = findCand.interest_HR - 1
    let findind = findCand.intrest.findIndex((e) => {
      return e == volId;
    });
    findCand.intrest.splice(findind, 1);
  } else {
    findCand.interest_TECH = findCand.interest_TECH - 1
    let findind = findCand.techIntrest.findIndex((e) => {
      return e == volId;
    });
    findCand.techIntrest.splice(findind, 1);
  }
  findCand.save();
  await IntrestedCandidate.deleteOne({ candId: candId, volunteerId: volId });
  return findCand;
};

module.exports = {
  createVolunteer,
  setPassword,
  Login,
  getProfile,
  MatchCandidate,
  CandidateIntrestUpdate,
  uploadProfileImage,
  getVolunteersDetails,
  getCandidatesForInterview,
  updateVolunteer,
  sendOTP,
  VerifyOTP,
  getIntrestedCandidates,
  UndoIntrestedCandidate,
  change_password,
  forget_password,
  CandidateIntrestUpdate_admin
};
