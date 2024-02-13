const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const AgoraAppId = require('../../services/candidate/candidate.service');


const get_all_candidates = catchAsync(async (req, res) => {
  const data = await AgoraAppId.get_all_candidates(req);
  res.status(httpStatus.CREATED).send(data);
});


module.exports = {
  get_all_candidates,

};


