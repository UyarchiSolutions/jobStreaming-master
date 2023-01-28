const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const generateTokenService = require('../../services/liveStreaming/generateToken-multihost.service');

const generateToken = catchAsync(async (req, res) => {
  let tokens;
  if (req.body.type == 'host') {
    tokens = await generateTokenService.generateToken(req);
  } else {
    tokens = await generateTokenService.generateToken_sub(req);
  }
  req.io.emit('subscriberjoined', { user: 'sd' });
  res.status(httpStatus.CREATED).send(tokens);
});


const createRooms = catchAsync(async (req, res) => {
  let value = await generateTokenService.createRooms(req);
  res.status(httpStatus.CREATED).send(value);
});

const get_allrooms = catchAsync(async (req, res) => {
  let value = await generateTokenService.get_allrooms(req);
  res.status(httpStatus.CREATED).send(value);
});

module.exports = {
  generateToken,
  createRooms,
  get_allrooms
};
