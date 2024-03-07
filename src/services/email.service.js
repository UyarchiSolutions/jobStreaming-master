const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const { OTPModel } = require('../models');
const { EmployeOtp } = require('../models');
const { Otpupdate } = require('../models/createPlan.model');
var ejs = require('ejs');
const Imap = require('node-imap');

const transport = nodemailer.createTransport(config.email.smtp);
// const transport2 = nodemailer.createTransport(config.email2.smtp);
const transporter2 = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Replace with your SMTP server host
  port: 465,
  auth: {
    user: 'noreply@warmy.co.in',
    pass: 'Asesea@001',
  },
  from: 'noreply@warmy.co.in',
});

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendVerificationEmail = async (user, tokens) => {
  data1 = await ejs.renderFile(__dirname + '/verifytemplate.ejs', {
    OTP: tokens,
  });

  const msg = {
    from: config.email.from,
    to: user.mail,
    subject: 'templates',
    html: data1,
  };
  await transport.sendMail(msg);
};

const sendVerificationEmailEmp = async (userData) => {
  const { name, _id, email } = userData;
  data1 = await ejs.renderFile(__dirname + '/employerTemplate.ejs', {
    name: name,
    id: _id,
  });
  const msg = {
    from: config.email.from,
    to: email,
    subject: 'templates',
    html: data1,
  };
  await transport.sendMail(msg);
};

const eventMailSend = async (to) => {
  data1 = await ejs.renderFile(__dirname + '/sample.ejs');
  const msg = {
    from: config.email.from,
    to: to,
    // to:"vignesh1041996@gmail.com",
    subject: 'Internship Opportunity-Final/Pre final years-Free Guidance',
    html: data1,
  };
  // await EmployeOtp.findOneAndUpdate({token:token},{otp:otp, userId:userId},{ new: true })
  await transport.sendMail(msg);
};

const volunteerMailVerification = async (data) => {
  const { email, name, _id } = data;
  let data1 = await ejs.renderFile(__dirname + '/volunteer-emailverify.ejs', {
    email: email,
    name: name,
    id: _id,
  });
  const msg = {
    from: config.email.from,
    to: email,
    subject: 'Email verification',
    html: data1,
  };
  await transport.sendMail(msg);
};

const candiRegReceveMail = async (data) => {
  const { mail, name } = data;
  let data1 = await ejs.renderFile(__dirname + '/agriCand.ejs', {
    email: mail,
    name: name,
  });
  const msg = {
    from: config.email.from,
    to: mail,
    subject: 'Email verification',
    html: data1,
  };
  await transport.sendMail(msg);
};

const sendsuccessTestMail = async (data) => {
  const { mail, name, date, slot } = data;
  let data1 = await ejs.renderFile(__dirname + '/testwarmy.ejs', {
    email: mail,
    name: name,
    date: date,
    time: slot,
  });
  let msg = {
    from: 'noreply@warmy.co.in',
    to: mail,
    subject: 'Registration Success-Entrepreneurship Workshop-COURAGE-Acknowledgement',
    html: data1,
  };

  if (data.user_type == 'IT') {
    data1 = await ejs.renderFile(__dirname + '/Entrepreneuship_IT.ejs', {
      email: mail,
      name: name,
      date: date,
      time: slot,
    });
    msg = {
      from: 'noreply@warmy.co.in',
      to: mail,
      subject: 'IT Entrepreneurship Drive-Registration-Acknowledgement',
      html: data1,
    };
  }
  if (data.user_type == 'HR') {
    data1 = await ejs.renderFile(__dirname + '/Entrepreneuship_HR.ejs', {
      email: mail,
      name: name,
      date: date,
      time: slot,
    });
    msg = {
      from: 'noreply@warmy.co.in',
      to: mail,
      subject: 'IT Entrepreneurship Drive-Registration-Acknowledgement',
      html: data1,
    };
  }
  await transporter2.sendMail(msg);
};

const sendsuccessTestMailNew = async (data) => {
  const { mail, name, date, slot, testProfile } = data;
  console.log(data);
  let data1 = await ejs.renderFile(__dirname + '/testwarmynew.ejs', {
    email: mail,
    name: name,
    date: testProfile.date,
    time: testProfile.time,
  });
  const msg = {
    from: 'noreply@warmy.co.in',
    to: mail,
    subject: 'Interview Registration Success-Associate Software Engineer-Acknowledgement',
    html: data1,
  };
  await transporter2.sendMail(msg);
};

const agriCandidateSlotBookedMail = async (data) => {
  const { mail, name, date, slot } = data;
  console.log(data);
  let data1 = await ejs.renderFile(__dirname + '/testwarmynew.ejs', {
    email: mail,
    name: name,
    date: date,
    time: slot,
  });
  const msg = {
    from: 'noreply@warmy.co.in',
    to: mail,
    subject: 'Agri job Fair Slot Confirmation Message',
    html: data1,
  };
  await transporter2.sendMail(msg);
};

const sendEmailTemplate = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  // await EmployeOtp.findOneAndUpdate({token:token},{otp:otp, userId:userId},{ new: true })
  await transport.sendMail(msg);
};
const forgetEmail = async (to, subject, text, otp, userId) => {
  const msg = { from: config.email.from, to, subject, text };
  await OTPModel.findOneAndUpdate({ userId: userId }, { otp: otp }, { new: true });
  await transport.sendMail(msg);
};

const forgetEmailEmp = async (to, subject, text, otp, userId) => {
  const msg = { from: config.email.from, to, subject, text };
  await EmployeOtp.findOneAndUpdate({ userId: userId }, { otp: otp }, { new: true });
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
// const sendVerificationEmailEmp = async (to, token, mobilenumber) => {
//   const subject = 'Email Verification';
//   // replace this url with the link to the reset password page of your front-end app
//   const resetPasswordUrl = `https://job.lotsmart.in/empverify-otp?mobilenumber=${mobilenumber}`;
//   const text = `Dear user,
// To set your password, click on this link: ${resetPasswordUrl}
// If you did not request any password sets, then ignore this email.`;
//   await sendEmailEmp(to, subject, text, token);
// };

// const sendVerificationEmail = async (to, token, mobilenumber) => {
//   // console.log(to);
//   // const subject = 'Email Verification';
//   // replace this url with the link to the reset password page of your front-end app
//  `https://job.lotsmart.in/VeriftOPT?mobilenumber=${mobilenumber}`;
// //   const text = `Dear user,
// // To set your password, click on this link: ${resetPasswordUrl}
// // If you did not request any password sets, then ignore this email.`;
//   await sendEmail(to, subject, mobilenumber, token);
// };

const sendforgotEmail = async (to, userId) => {
  const subject = 'Forget Password';
  // console.log(to, token)
  // replace this url with the link to the email verification page of your front-end app
  var otp = Math.random();
  otp = otp * 1000000;
  otp = parseInt(otp);
  //  console.log(otp);
  const text = `Dear user, To Forget Password, OTP:${otp}. Do not share your otp`;
  await forgetEmail(to, subject, text, otp, userId);
};

const sendforgotEmailEmp = async (to, userId) => {
  const subject = 'Forget Password';
  // console.log(to, token)
  // replace this url with the link to the email verification page of your front-end app
  var otp = Math.random();
  otp = otp * 1000000;
  otp = parseInt(otp);
  //  console.log(otp);
  const text = `Dear user, To Forget Password, OTP:${otp}. Do not share your otp`;
  await forgetEmailEmp(to, subject, text, otp, userId);
};

let maskmail = async (email) => {
  console.log(email);
  await maskmail_email(email);
};

const maskmail_email = async (to) => {
  console.log(to);
  const msg = { from: '"Uyarchi solutions" <noreply-sw@seewe.info>', to, subject: 'maskmailer checked' };
  console.log(msg);
  await transport.sendMail(msg);
};

const notification_mail = async (candidate, body) => {
  console.log(candidate);
  const msg = { from: '"Uyarchi solutions" <noreply-sw@seewe.info>', to, subject: 'maskmailer checked' };
  console.log(msg);
  await transport.sendMail(msg);
};

const send_email_update = async (id, to) => {
  const subject = 'Email Changing';
  // await EmployeOtp.findOneAndUpdate({token:token},{otp:otp, userId:userId},{ new: true })
  // console.log(to, token)
  // replace this url with the link to the email verification page of your front-end app
  var otp = Math.random();
  otp = otp * 1000000;
  otp = parseInt(otp);
  //  console.log(otp);
  const text = `Dear user, To Change the email, OTP:${otp}. Do not share your otp`;
  const msg = { from: config.email.from, to, subject, text };

  await Otpupdate.create({ email: to, otp: otp, userId: id });
  await transport.sendMail(msg);
};

module.exports = {
  transport,
  // sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendforgotEmail,
  forgetEmail,
  forgetEmailEmp,
  sendVerificationEmailEmp,
  sendforgotEmailEmp,
  maskmail,
  notification_mail,
  sendEmailTemplate,
  send_email_update,
  sendsuccessTestMail,
  volunteerMailVerification,
  candiRegReceveMail,
  eventMailSend,
  sendsuccessTestMailNew,
  agriCandidateSlotBookedMail,
};
