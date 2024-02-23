const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const moment = require('moment');
const {
  EventRegister,
  Eventslot,
  EventslotTest,
  EventslotTestNew,
  EventslotIntern,
  EventRegisterIntern,
} = require('../models/climb-event.model');
const AWS = require('aws-sdk');
const { options } = require('joi');
const { v4: uuidv4 } = require('uuid');

const createEventCLimb = async (req) => {
  let body = req.body;
  let findByemail = await EventRegister.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegister.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
  }
  if (req.file) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'jobresume',
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          reject(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL } };
        let findEnvent = await Eventslot.findOne({ slot: datas.slot, date: datas.date });
        console.log(findEnvent);
        if (findEnvent) {
          if (findEnvent.no_of_count >= findEnvent.booked_count) {
            findEnvent.booked_count = findEnvent.booked_count + 1;
            findEnvent.save();
            let creations = await EventRegister.create(datas);
            resolve(creations);
          } else {
            reject({ slot: 'Slot Engached' });
          }
        }
      });
    });
  }
};

const createEventCLimb_intern = async (req) => {
  let body = req.body;
  let findByemail = await EventRegisterIntern.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegisterIntern.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
  }
  if (req.file) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'jobresume',
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          reject(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL, user_type: "Intern" } };
        let creations = await EventRegisterIntern.create(datas);
        resolve(creations);
      });
    });
  } else {
    let creations = await EventRegisterIntern.create({ ...body, ...{ user_type: "Intern" } });
    return creations
  }
};


const createEventClimb_it = async (req) => {
  let body = req.body;
  let findByemail = await EventRegisterIntern.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegisterIntern.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
  }
  if (req.file) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'jobresume',
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          reject(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL, user_type: "IT" } };
        let creations = await EventRegisterIntern.create(datas);
        resolve(creations);
      });
    });
  } else {
    let creations = await EventRegisterIntern.create({ ...body, ...{ user_type: "IT" } });
    return creations
  }
};

const createEventClimb_hr = async (req) => {
  let body = req.body;
  let findByemail = await EventRegisterIntern.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegisterIntern.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
  }
  if (req.file) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'jobresume',
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          reject(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL, user_type: "HR" } };

        let creations = await EventRegisterIntern.create(datas);
        resolve(creations);
      });
    });
  } else {
    let creations = await EventRegisterIntern.create({ ...body, ...{ user_type: "HR" } });
    return creations
  }
};


const createTestCandidates = async (req) => {
  let body = req.body;
  let findByemail = await EventRegister.findOne({ mail: body.mail });
  if (findByemail) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mail ID Already Exist');
  }
  let findBymobile = await EventRegister.findOne({ mobileNumber: body.mobileNumber });
  if (findBymobile) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Entered Mobile Number Already Exist');
  }

  if (req.file) {
    const s3 = new AWS.S3({
      accessKeyId: 'AKIA3323XNN7Y2RU77UG',
      secretAccessKey: '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',
      region: 'ap-south-1',
    });
    let params = {
      Bucket: 'jobresume',
      Key: req.file.originalname,
      Body: req.file.buffer,
      ACL: 'public-read',
      ContentType: req.file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, async (err, data) => {
        if (err) {
          reject(err);
        }
        let fileURL = data.Location;
        let datas = { ...body, ...{ uploadResume: fileURL, Type: 'Assesment' } };
        let creations = await EventRegister.create(datas);
        resolve(creations);
      });
    });
  }
};

const slotDetails = async () => {
  let slots = await Eventslot.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const insertSlots = async (date) => {
  let slot = await Eventslot.create(date);
  return slot;
};

const insertSlots_intern = async (date) => {
  let slot = await EventslotIntern.create(date);
  return slot;
};

const slotDetails_intern = async () => {
  let slots = await EventslotIntern.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const insertSlotsTest = async (body) => {
  let date = body.body;
  const dateTimeString = `${date.date} ${date.slot}`;
  const momentObject = moment(dateTimeString, 'YYYY-MM-DD hh:mm A');
  const isoDateTime = momentObject.toISOString();
  let datas = { ...date, ...{ dateTime: isoDateTime } };
  let slot = await EventslotTest.create(datas);
  return slot;
};

const insertSlotsTestNew = async (body) => {
  let date = body.body;
  const dateTimeString = `${date.date} ${date.slot}`;
  const momentObject = moment(dateTimeString, 'YYYY-MM-DD hh:mm A');
  const isoDateTime = momentObject.toISOString();
  let datas = { ...date, ...{ dateTime: isoDateTime } };
  let slot = await EventslotTestNew.create(datas);
  return slot;
};

const slotDetailsTest = async () => {
  let slots = await EventslotTest.aggregate([
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const slotDetailsTestNewHR = async () => {
  let slots = await EventslotTestNew.aggregate([
    {
      $match: { Type: 'HR' },
    },
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const slotDetailsTestNewTech = async () => {
  let slots = await EventslotTestNew.aggregate([
    {
      $match: { Type: 'TECH' },
    },
    {
      $match: {
        $expr: {
          $and: [{ $gt: ['$no_of_count', '$booked_count'] }],
        },
      },
    },
    { $sort: { sortcount: 1 } },
    {
      $group: {
        _id: { date: '$date' },
        time: { $push: '$slot' },
      },
    },
    {
      $project: {
        _id: '',
        date: '$_id.date',
        time: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
  return slots;
};

const updateTestIntern = async (req) => {
  let values = await EventRegisterIntern.findById(req.params.id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidates not found');
  }

  if (values.NewTestEntry == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already You Profile Updated');
  }
  const bodyData = req.body;
  let findEnvent = await EventslotIntern.findOne({ slot: bodyData.time, date: bodyData.date });
  if (findEnvent) {
    if (findEnvent.no_of_count >= findEnvent.booked_count) {
      findEnvent.booked_count = findEnvent.booked_count + 1;
      findEnvent.save();
      values = await EventRegisterIntern.findByIdAndUpdate(
        { _id: values._id },
        { NewTestEntry: true, testProfile: bodyData, testDate: moment(), slotId: findEnvent._id },
        { new: true }
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Engached');
  }
  return values;
};

const updateTestWarmyNew = async (req) => {
  let values = await EventRegister.findById(req.params.id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidates not found');
  }

  if (values.NewTestEntry == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already You Profile Updated');
  }
  const bodyData = req.body;
  let findEnvent = await EventslotTestNew.findOne({ slot: bodyData.time, date: bodyData.date });
  if (findEnvent) {
    if (findEnvent.no_of_count >= findEnvent.booked_count) {
      findEnvent.booked_count = findEnvent.booked_count + 1;
      findEnvent.save();
      values = await EventRegister.findByIdAndUpdate(
        { _id: values._id },
        { NewTestEntry: true, testProfile: bodyData, testDate: moment() },
        { new: true }
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Engached');
  }
  return values;
};

const getAllRegistered_Candidate = async (query) => {
  let { key } = query;
  let matchCand = { active: true };
  if (key && key != null && key != 'null' && key != '') {
    matchCand = {
      $or: [{ mail: { $regex: key, $options: 'i' } }, { mobileNumber: { $regex: key, $options: 'i' } }],
    };
  }
  let values = await EventRegister.aggregate([
    {
      $match: matchCand,
    },
  ]);
  return values;
};

const getSlotDetails_WithCandidate = async () => {
  let values = await Eventslot.aggregate([
    {
      $lookup: {
        from: 'climbeventregisters',
        let: { eventDate: '$date', eventTime: '$slot' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$date', '$$eventDate'] }, { $eq: ['$slot', '$$eventTime'] }],
              },
            },
          },
        ],
        as: 'candidates',
      },
    },
    {
      $project: {
        _id: 1,
        booked_count: 1,
        date: 1,
        slot: 1,
        no_of_count: 1,
        createdAt: 1,
        candidates: { $size: '$candidates' },
        candList: '$candidates',
      },
    },
  ]);
  return values;
};

const getCandidateBySlot = async (req) => {
  const { date, time } = req.params;

  let values = await EventRegister.aggregate([
    {
      $match: {
        date: date,
        slot: time,
      },
    },
  ]);
  return values;
};

const CandidateLogin = async (req) => {
  const { mobileNumber } = req.body;
  let values = await EventRegister.findOne({ mobileNumber: mobileNumber });

  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*This number is not registered');
  }
  if (values.profileUpdated == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Your profile is already updated');
  }
  return values;
};

const getDetailsByCandidate = async (req) => {
  const userId = req.userId;
  let values = await EventRegister.findById(userId);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate user not found');
  }
  return values;
};

const updateProfileCandidate = async (req) => {
  const userId = req.userId;
  let values = await EventRegister.findById(userId);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidate Not Found');
  }
  if (values.profileUpdated == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profile Already Updated');
  }
  let bodyVal = req.body;
  values = await EventRegister.findByIdAndUpdate(
    { _id: values._id },
    { profiles: bodyVal, profileUpdated: true },
    { new: true }
  );
  return values;
};

const verify_cand = async (req) => {
  const { mob_email } = req.body;
  let findbyMobile = await EventRegister.findOne({ mobileNumber: mob_email });
  let findbyemail = await EventRegister.findOne({ mail: mob_email });

  if (findbyemail) {
    if (findbyemail.NewTestEntry) {
      throw new ApiError(httpStatus.BAD_REQUEST, '*Your Profile Already Updated');
    } else {
      return findbyemail;
    }
  } else if (findbyMobile) {
    if (findbyMobile.NewTestEntry) {
      throw new ApiError(httpStatus.BAD_REQUEST, '*Your Profile Already Updated');
    } else {
      return findbyMobile;
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Mobile Number Or E-mail Not Registered');
  }
};

const updateTestWarmy = async (req) => {
  let values = await EventRegister.findById(req.params.id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Candidates not found');
  }

  if (values.testEntry == true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already You Profile Updated');
  }
  const bodyData = req.body;
  let findEnvent = await EventslotTest.findOne({ slot: bodyData.time, date: bodyData.date });
  if (findEnvent) {
    if (findEnvent.no_of_count >= findEnvent.booked_count) {
      findEnvent.booked_count = findEnvent.booked_count + 1;
      findEnvent.save();
      values = await EventRegister.findByIdAndUpdate(
        { _id: values._id },
        { testEntry: true, testProfile: bodyData, testDate: moment() },
        { new: true }
      );
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slot Engached');
  }
  return values;
};

const getTestUsers = async (req) => {
  const { key, action } = req.query;
  let matchCand = { active: true };
  let matchStatus = { active: true };

  if (key && key != null && key != 'null' && key != '') {
    matchCand = {
      $or: [{ mail: { $regex: key, $options: 'i' } }, { mobileNumber: { $regex: key, $options: 'i' } }],
    };
  }

  if (action && action != null && action != 'null' && action != '') {
    if (action == 'Pending') {
      matchStatus = { status: { $nin: ['Activated', 'Link Send', 'Completed'] } };
    } else {
      matchStatus = { status: action };
    }
  }
  let values = await EventRegister.aggregate([
    {
      $sort: { testDate: -1 },
    },
    {
      $match: {
        testEntry: true,
      },
    },
    { $match: { $and: [matchCand, matchStatus] } },
  ]);

  let count = await EventRegister.find({ testEntry: true }).count();

  return { values, count };
};

const getTestUsersNew = async (req) => {
  const { key, action } = req.query;
  let matchCand = { active: true };
  let matchStatus = { active: true };

  if (key && key != null && key != 'null' && key != '') {
    matchCand = {
      $or: [{ mail: { $regex: key, $options: 'i' } }, { mobileNumber: { $regex: key, $options: 'i' } }],
    };
  }

  if (action && action != null && action != 'null' && action != '') {
    if (action == 'Pending') {
      matchStatus = { status: { $nin: ['Activated', 'Link Send', 'Completed'] } };
    } else {
      matchStatus = { status: action };
    }
  }
  let values = await EventRegister.aggregate([
    {
      $sort: { testDate: -1 },
    },
    {
      $match: {
        NewTestEntry: true,
      },
    },
    { $match: { $and: [matchCand, matchStatus] } },
  ]);

  let count = await EventRegister.find({ NewTestEntry: true }).count();

  return { values, count };
};

const updateStatus = async (req) => {
  const body = req.body;
  const id = req.params.id;
  let values = await EventRegister.findById(id);
  if (!values) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Not Found');
  }
  values = await EventRegister.findByIdAndUpdate({ _id: id }, body, { new: true });
  return values;
};

const getWorkShopCand = async (req) => {
  const { user, gender, coursetime, user_type } = req.query;
  let userMatch = { active: true };
  let genderMatch = { active: true };
  let courseTimeMatch = { active: true };
  let userType = { active: true };

  if (user && user != '' && user != null && user != 'null') {
    userMatch = { $or: [{ mail: { $regex: user, $options: 'i' } }, { mobileNumber: { $regex: user, $options: 'i' } }] };
  }
  if (gender && gender != null && gender != '' && gender != 'null') {
    genderMatch = { gender: { $regex: gender, $options: 'i' } };
  }

  if (coursetime && coursetime != '' && coursetime != 'null') {
    courseTimeMatch = { courseTiming: { $regex: coursetime, $options: 'i' } };
  }

  if (user_type != null && user_type != '' && user_type != 'null') {
    userType = { user_type: { $eq: user_type } };
  }

  let values = await EventRegisterIntern.aggregate([
    {
      $match: { $and: [userMatch, genderMatch, courseTimeMatch, userType] },
    },
  ]);
  return values;
};

const verify_cand_Intern = async (req) => {
  const { mob_email } = req.body;
  let findbyMobile = await EventRegisterIntern.findOne({ mobileNumber: mob_email });
  let findbyemail = await EventRegisterIntern.findOne({ mail: mob_email });

  if (findbyemail) {
    if (findbyemail.testEntry) {
      throw new ApiError(httpStatus.BAD_REQUEST, '*Your Profile Already Updated');
    } else {
      return findbyemail;
    }
  } else if (findbyMobile) {
    if (findbyMobile.testEntry) {
      throw new ApiError(httpStatus.BAD_REQUEST, '*Your Profile Already Updated');
    } else {
      return findbyMobile;
    }
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, '*Mobile Number Or E-mail Not Registered');
  }
};

const getInternSlots = async (req) => {
  const data = await EventslotIntern.aggregate([
    {
      $lookup: {
        from: 'climbeventregisterinterns',
        localField: '_id',
        foreignField: 'slotId',
        as: 'slots',
      },
    },
    {
      $project: {
        _id: 1,
        date: 1,
        slot: 1,
        cand: { $size: '$slots' },
      },
    },
  ]);
  return data;
};

const getWorkshopCandidatesBySlot = async (req) => {
  let id = req.params.id;
  const data = await EventRegisterIntern.aggregate([
    {
      $match: {
        slotId: id,
      },
    },
  ]);
  return data;
};


const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
AWS.config.update({
  accessKeyId: 'AKIA3323XNN7Y2RU77UG',
  secretAccessKey: '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',
  region: 'ap-south-1'
});
const s3 = new AWS.S3();
const generate_pdf = async (req) => {

  let finduser = await EventRegisterIntern.findById(req.query.id);
  // console.log(finduser)
  if (!finduser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This Number Not Registerd');
  }
  console.log()
  if (finduser.certificate_downloaded != true) {
    return new Promise(async (resolve, reject) => {
      // console.log("shjgyhj")
      const existingPdfPath = path.resolve(__dirname, 'public', '../../../public/ext.pdf');
      const existingPdfBytes = fs.readFileSync(existingPdfPath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const page = pdfDoc.getPage(0);
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      const text = finduser.name.toUpperCase();

      const textSize = font.widthOfTextAtSize(text, 20);
      const pageWidth = page.getWidth();
      const centerX = (pageWidth - textSize) / 2;


      page.drawText(text, {
        x: centerX,
        y: 238,
        size: 20,
        color: rgb(0, 0, 0), // black
      });


      pdfDoc.setTitle('Courage')
      pdfDoc.setAuthor('Bharathi')
      pdfDoc.setProducer('Aravind')
      pdfDoc.setCreator('GD (https://warmy.co.in)')

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      console.log(modifiedPdfBytes, 876578, uuidv4)
      let id = "cerificate/" + finduser.name + '-' + finduser.mobileNumber + "-" + uuidv4();


      const uploadParams = {
        Bucket: 'jobresume',
        Key: id + '.pdf',
        ACL: 'public-read',
        Body: modifiedPdfBytes,
        ContentType: 'application/pdf'
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      finduser.certificate = uploadResult.Location;
      finduser.certificate_downloaded = true;
      finduser.save();
      resolve({ pdf: uploadResult.Location });
    })
  }
  else {
    return { pdf: finduser.certificate }
  }
};

const verify_mobile = async (req) => {

  let finduser = await EventRegisterIntern.findOne({ mobileNumber: req.body.mobileNumber });
  if (!finduser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This Number Not Registerd');
  }
  if (finduser.user_type != 'Intern') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This Number Not Registerd');
  }

  return { id: finduser._id }
}
module.exports = {
  createEventCLimb,
  slotDetails,
  insertSlots,
  getAllRegistered_Candidate,
  getSlotDetails_WithCandidate,
  getCandidateBySlot,
  CandidateLogin,
  getDetailsByCandidate,
  updateProfileCandidate,
  verify_cand,
  updateTestWarmy,
  insertSlotsTest,
  slotDetailsTest,
  createTestCandidates,
  getTestUsers,
  updateStatus,
  insertSlotsTestNew,
  slotDetailsTestNewHR,
  slotDetailsTestNewTech,
  updateTestWarmyNew,
  getTestUsersNew,
  insertSlots_intern,
  slotDetails_intern,
  createEventCLimb_intern,
  getWorkShopCand,
  verify_cand_Intern,
  updateTestIntern,
  getInternSlots,
  getWorkshopCandidatesBySlot,
  createEventClimb_it,
  createEventClimb_hr,
  generate_pdf,
  verify_mobile
};
