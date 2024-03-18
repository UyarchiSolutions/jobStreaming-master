const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const StreamService = require('../services/crud.service');
const { response } = require('express');

const create = catchAsync(async (req, res) => {
    const data = await StreamService.create(req);
    res.send(data);
});

const get_one = catchAsync(async (req, res) => {
    const data = await StreamService.get_one(req);
    res.send(data);
});
const update = catchAsync(async (req, res) => {
    const data = await StreamService.update(req);
    res.send(data);
});

const delete_one = catchAsync(async (req, res) => {
    const data = await StreamService.delete_one(req);
    res.send(data);
});

const getall = catchAsync(async (req, res) => {
    const data = await StreamService.getall(req);
    res.send(data);
});




module.exports = {
    create,
    get_one,
    update,
    delete_one,
    getall,
};
