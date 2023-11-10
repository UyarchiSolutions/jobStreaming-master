const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const requestStreamService = require('../services/request.stream.service');
const { response } = require('express');

const createRequestStream = catchAsync(async (req, res) => {
  const data = await requestStreamService.createRequestStream(req, res);
  res.send(data);
});

module.exports = {
  createRequestStream,
};
