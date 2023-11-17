const httpStatus = require('http-status');
const moment = require('moment');
const { Volunteer } = require('../models/vlounteer.model');

const createVolunteer = async (req) => {
  let body = req.body;
  let creations = await Volunteer.create(body);
  return creations;
};

module.exports = { createVolunteer };
