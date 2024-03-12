const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const StreamService = require('../services/stream.service');
const { response } = require('express');

const emp_go_live = catchAsync(async (req, res) => {
    const data = await StreamService.emp_go_live(req, res);
    res.send(data);
});

const get_stream_token = catchAsync(async (req, res) => {
    const data = await StreamService.get_stream_token(req, res);
    res.send(data);
});


const stream_end = catchAsync(async (req, res) => {
    const data = await StreamService.stream_end(req, res);
    res.send(data);
});

const cloud_start = catchAsync(async (req, res) => {
    const data = await StreamService.cloud_start(req, res);
    res.send(data);
});

const cloud_stop = catchAsync(async (req, res) => {
    const data = await StreamService.cloud_stop(req, res);
    res.send(data);
});

const get_all_chats = catchAsync(async (req, res) => {
    const data = await StreamService.get_all_chats(req, res);
    res.send(data);
});

const get_candidate_jobpost = catchAsync(async (req, res) => {
    const data = await StreamService.get_candidate_jobpost(req, res);
    res.send(data);
});

const get_post_details = catchAsync(async (req, res) => {
    const data = await StreamService.get_post_details(req, res);
    res.send(data);
});


const candidate_go_live = catchAsync(async (req, res) => {
    const data = await StreamService.candidate_go_live(req, res);
    res.send(data);
});

const candidateAuth_get_all_chats = catchAsync(async (req, res) => {
    const data = await StreamService.candidateAuth_get_all_chats(req, res);
    res.send(data);
});


const get_stream_token_candidateAuth = catchAsync(async (req, res) => {
    const data = await StreamService.get_stream_token_candidateAuth(req, res);
    res.send(data);
});



module.exports = {
    emp_go_live,
    get_stream_token,
    get_all_chats,
    cloud_start,
    cloud_stop,
    stream_end,
    get_candidate_jobpost,
    get_post_details,
    candidate_go_live,
    get_stream_token_candidateAuth,
    candidateAuth_get_all_chats
};
