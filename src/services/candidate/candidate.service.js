const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');
const moment = require('moment');
const Agora = require('agora-access-token');
const axios = require('axios');

const { AgriCandidate, AgriEventSlot, agriCandReview, IntrestedCandidate, SlotBooking, BookedSlot, Reference, } = require('../../models/agri.Event.model')

const get_all_candidates = async (req) => {


  let range = req.body.range == null || req.body.range == undefined || req.body.range == null ? 10 : parseInt(req.body.range);
  let page = req.body.page == null || req.body.page == undefined || req.body.page == null ? 0 : parseInt(req.body.page);


  let candidate = await AgriCandidate.aggregate([
    {
      $match: {
        $or: [
          { skills: { $elemMatch: { $regex: "Horticulture", $options: "i" } } },
          { skills: { $elemMatch: { $regex: "Forestrxzczy", $options: "i" } } }
        ]
      }
    },

    { $skip: range * page },
    { $limit: range },
  ]);

  let next = await AgriCandidate.aggregate([
    { $skip: range * (page + 1) },
    { $limit: range },
  ]);

  return { candidate, next: next != 0 };

}
module.exports = {
  get_all_candidates,

};
