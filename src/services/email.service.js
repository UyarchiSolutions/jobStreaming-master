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
  port: 465, // Replace with your SMTP server port (587 is a common secure TLS/STARTTLS port)
  auth: {
    user: 'test@warmy.co.in',
    pass: 'Test@123',
  },
  from: 'test@warmy.co.in',
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
const sendVerificationEmail = async (to, token, mobilenumber) => {
  data1 = await ejs.renderFile(__dirname + '/verifytemplate.ejs', {
    mobilenumber: mobilenumber,
    email: to,
  });

  const msg = {
    from: config.email.from,
    to: to,
    // to:"vignesh1041996@gmail.com",
    subject: 'templates',
    html: data1,
  };
  // await OTPModel.findOneAndUpdate({token:token},{otp:otp, userId:userId},{ new: true })
  await transport.sendMail(msg);
};

const sendVerificationEmailEmp = async (to, token, mobilenumber) => {
  data1 = await ejs.renderFile(__dirname + '/employVerify.ejs', {
    mobilenumber: mobilenumber,
    email: to,
  });

  const msg = {
    from: config.email.from,
    to: to,
    // to:"vignesh1041996@gmail.com",
    subject: 'templates',
    html: data1,
  };
  // await EmployeOtp.findOneAndUpdate({token:token},{otp:otp, userId:userId},{ new: true })
  await transport.sendMail(msg);
};

const sendsuccessTestMail = async (data) => {
  const { mail, name, testProfile } = data;
  let data1 = await ejs.renderFile(__dirname + '/testwarmy.ejs', {
    email: mail,
    name: name,
    date: testProfile.date,
    time: testProfile.time,
  });

  const msg = {
    from: 'test@warmy.co.in',
    to: mail,
    // to:"vignesh1041996@gmail.com",
    subject: 'Assessment Registration Online-Associate Software Engineer-Acknowledgement',
    html: data1,
  };
  // await EmployeOtp.findOneAndUpdate({token:token},{otp:otp, userId:userId},{ new: true })
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
  const msg = { from: '"Uyarchi solutions" <noreply-tj@uyarchi.com>', to, subject: 'maskmailer checked' };
  console.log(msg);
  await transport.sendMail(msg);
};

const notification_mail = async (candidate, body) => {
  console.log(candidate);
  const msg = { from: '"Uyarchi solutions" <noreply-tj@uyarchi.com>', to, subject: 'maskmailer checked' };
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
};
