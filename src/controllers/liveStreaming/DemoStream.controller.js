const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const demostream = require('../../services/liveStreaming/DemoStream.service');

const getDatas = catchAsync(async (req, res) => {
  const TechIssue = await demostream.getDatas();
  res.status(httpStatus.OK).send(TechIssue);
});

const get_stream_details = catchAsync(async (req, res) => {
  const TechIssue = await demostream.get_stream_details(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const send_otp = catchAsync(async (req, res) => {
  const TechIssue = await demostream.send_otp(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const verify_otp = catchAsync(async (req, res) => {
  const TechIssue = await demostream.verify_otp(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const select_data_time = catchAsync(async (req, res) => {
  const TechIssue = await demostream.select_data_time(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const add_one_more_time = catchAsync(async (req, res) => {
  const TechIssue = await demostream.add_one_more_time(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const end_stream = catchAsync(async (req, res) => {
  const category = await demostream.end_stream(req);
  res.send(category);
});

const seller_go_live = catchAsync(async (req, res) => {
  const TechIssue = await demostream.seller_go_live(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const seller_go_live_details = catchAsync(async (req, res) => {
  const TechIssue = await demostream.seller_go_live_details(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const start_cloud = catchAsync(async (req, res) => {
  const TechIssue = await demostream.start_cloud(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const buyer_join_stream = catchAsync(async (req, res) => {
  const TechIssue = await demostream.buyer_join_stream(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const get_buyer_join_stream = catchAsync(async (req, res) => {
  const TechIssue = await demostream.get_buyer_join_stream(req);
  res.status(httpStatus.OK).send(TechIssue);
});

const buyer_go_live_stream = catchAsync(async (req, res) => {
  const data = await demostream.buyer_go_live_stream(req);
  res.status(httpStatus.CREATED).send(data);
});

const byer_get_stream_details = catchAsync(async (req, res) => {
  const data = await demostream.byer_get_stream_details(req);
  res.status(httpStatus.CREATED).send(data);
});

const buyer_interested = catchAsync(async (req, res) => {
  const data = await demostream.buyer_interested(req);
  res.status(httpStatus.CREATED).send(data);
});

const getStreamDetails = catchAsync(async (req, res) => {
  const data = await demostream.getStreamDetails(req);
  res.send(data);
});

const get_stream_details_check_golive = catchAsync(async (req, res) => {
  const data = await demostream.get_stream_details_check_golive(req);
  res.status(httpStatus.CREATED).send(data);
});
const start_cloud_record = catchAsync(async (req, res) => {
  const data = await demostream.recording_start(req.query.id);
  res.send(data);
});


const get_stream_verify = catchAsync(async (req, res) => {
  const data = await demostream.verifyToken(req);
  res.status(httpStatus.CREATED).send(data);
});


const verification_sms_send = catchAsync(async (req, res) => {
  const data = await demostream.verification_sms_send(req);
  res.send(data);
});

const get_buyer_token = catchAsync(async (req, res) => {
  const data = await demostream.get_buyer_token(req);
  res.status(httpStatus.CREATED).send(data);
});


const get_reference = catchAsync(async (req, res) => {
  const data = await demostream.get_reference(req);
  res.status(httpStatus.CREATED).send(data);
});

const add_reference = catchAsync(async (req, res) => {
  const data = await demostream.add_reference(req);
  res.status(httpStatus.CREATED).send(data);
});

const completed_videos = catchAsync(async (req, res) => {
  const data = await demostream.completed_videos(req);
  res.status(httpStatus.CREATED).send(data);
});


const upload_teaser = catchAsync(async (req, res) => {
  const data = await demostream.upload_teaser(req);
  res.status(httpStatus.CREATED).send(data);
});
const upload_trailer = catchAsync(async (req, res) => {
  const data = await demostream.upload_trailer(req);
  res.status(httpStatus.CREATED).send(data);
});
const upload_edited = catchAsync(async (req, res) => {
  const data = await demostream.upload_edited(req);
  res.status(httpStatus.CREATED).send(data);
});

const approve_upload = catchAsync(async (req, res) => {
  const data = await demostream.approve_upload(req);
  res.status(httpStatus.CREATED).send(data);
});
module.exports = {
  getDatas,
  get_stream_details,
  send_otp,
  verify_otp,
  select_data_time,
  add_one_more_time,
  seller_go_live,
  seller_go_live_details,
  start_cloud,
  end_stream,
  buyer_join_stream,
  get_buyer_join_stream,
  buyer_go_live_stream,
  byer_get_stream_details,
  buyer_interested,
  getStreamDetails,
  get_stream_details_check_golive,
  start_cloud_record,
  get_stream_verify,
  verification_sms_send,
  get_buyer_token,
  get_reference,
  add_reference,
  completed_videos,
  upload_teaser,
  upload_trailer,
  upload_edited,
  approve_upload
};
