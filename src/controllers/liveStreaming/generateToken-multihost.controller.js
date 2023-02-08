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
const agora_acquire = catchAsync(async (req, res) => {
  const tokens = await generateTokenService.agora_acquire(req);
  res.status(httpStatus.CREATED).send(tokens);
});
const recording_start = catchAsync(async (req, res) => {
  const tokens = await generateTokenService.recording_start(req);
  res.status(httpStatus.CREATED).send(tokens);
});
const recording_query = catchAsync(async (req, res) => {
  const tokens = await generateTokenService.recording_query(req);
  res.status(httpStatus.CREATED).send(tokens);
});
const recording_stop = catchAsync(async (req, res) => {
  const tokens = await generateTokenService.recording_stop(req);
  res.status(httpStatus.CREATED).send(tokens);
});
const recording_updateLayout = catchAsync(async (req, res) => {
  const tokens = await generateTokenService.recording_updateLayout(req.query);
  res.status(httpStatus.CREATED).send(tokens);
});
module.exports = {
  generateToken,
  createRooms,
  get_allrooms,
  agora_acquire,
  recording_start,
  recording_query,
  recording_stop,
  recording_updateLayout,
};
