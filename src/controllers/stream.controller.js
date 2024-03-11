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

const get_all_chats = catchAsync(async (req, res) => {
    const data = await StreamService.get_all_chats(req, res);
    res.send(data);
});


module.exports = {
    emp_go_live,
    get_stream_token,
    get_all_chats
};
