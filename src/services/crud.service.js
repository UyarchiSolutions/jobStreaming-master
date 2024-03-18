const httpStatus = require('http-status');
const Agora = require('agora-access-token');

const { Crud } = require('../models/crud.model');
const create = async (req) => {
    const crud = await Crud.create(req.body)
    return crud;
};
const get_one = async (req) => {
    const crud = await Crud.findById(req.query.id)
    return crud;
};

const update = async (req) => {
    const crud = await Crud.findByIdAndUpdate({ _id: req.query.id }, req.body, { new: true })
    return crud;
};




const delete_one = async (req) => {
    const crud = await Crud.findByIdAndDelete(req.query.id)
    return { message: "Deleted Successfully" };
};




const getall = async (req) => {
    const crud = await Crud.find()
    return crud;
};












module.exports = {
    create,
    get_one,
    update,
    delete_one,
    getall,
};
