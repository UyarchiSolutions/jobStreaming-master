const mongoose = require('mongoose');
const { v4 } = require('uuid');
const { toJSON, paginate } = require('./plugins');

const streamRequestschema = mongoose.Schema({
  _id: {
    type: String,
    default: v4,
  },
  active: {
    type: Boolean,
    default: true,
  },
  archive: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  DateIso: {
    type: Number,
  },
  quantity: {
    type: Number,
  },
  suppierId: {
    type: String,
  },
  post: {
    type: Array,
  },
  communicationMode: {
    type: Array,
  },
  primarycommunication: {
    type: String,
  },
  secondarycommunication: {
    type: String,
  },
  streamingDate: {
    type: String,
  },
  streamingTime: {
    type: String,
  },
  streamingDate_time: {
    type: String,
  },
  image: {
    type: String,
  },
  teaser: {
    type: String,
  },
  postCount: {
    type: Number,
  },
  sepTwo: {
    type: String,
    default: 'Pending',
  },
  planId: {
    type: String,
  },
  streamName: {
    type: String,
  },
  discription: {
    type: String,
  },
  adminApprove: {
    type: String,
    default: 'Pending',
  },
  tokenDetails: {
    type: String,
  },
  activelive: {
    type: String,
    default: 'Pending',
  },
  tokenGeneration: {
    type: Boolean,
    default: false,
  },
  Duration: {
    type: Number,
  },
  startTime: {
    type: Number,
  },
  endTime: {
    type: Number,
  },
  noOfParticipants: {
    type: Number,
  },
  chat: {
    type: String,
  },
  max_post_per_stream: {
    type: Number,
  },
  goLive: {
    type: Boolean,
    default: false,
  },
  brouchers: {
    type: String,
  },
  // afterStreaming: {
  //   type: String,
  //   default: false,
  // }
  audio: {
    type: Boolean,
    default: false,
  },
  video: {
    type: Boolean,
    default: false,
  },
  chat_need: {
    type: String,
  },
  allot_chat: {
    type: String,
  },
  allot_host_1: {
    type: String,
  },
  allot_host_2: {
    type: String,
  },
  allot_host_3: {
    type: String,
  },
  allot: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
  },
  streamEnd_Time: {
    type: Number,
  },
  end_Status: {
    type: String,
  },
  videoconvertStatus: {
    type: String,
    default: 'Pending',
  },
  agoraID: {
    type: String,
  },
  totalMinues: {
    type: Number,
  },
  slotId: {
    type: String,
  },
  bookingslotId: {
    type: String,
  },
  Location: {
    type: String,
  },
  PumpupView: {
    type: Number,
  },
  uploadDate: {
    type: Number,
  },
  uploadLink: {
    type: String,
  },
  uploadStatus: {
    type: String,
    default: 'Pending',
  },
  transaction: {
    type: String,
  },
  selectvideo: {
    type: String,
  },
  showLink: {
    type: String,
  },
  show_completd: {
    type: Boolean,
    default: false,
  },
  raise_hands: {
    type: Boolean,
    default: false,
  },
  current_raise: {
    type: String,
  },
  streamPlanId: {
    type: String,
  },
  uploatedBy: {
    type: String,
  },
  updatedBy_id: {
    type: String,
  },
  completed_stream: {
    type: String,
  },
  completed_stream_by: {
    type: String,
  },
  broucher: {
    type: String,
  },
  completedStream: {
    type: String,
  },
  streamExpire: {
    type: Number,
  },
  Service_Charges: {
    type: Number,
  },
  Interest_View_Count: {
    type: String,
  },
  No_of_Limitations: {
    type: Number,
  },
  removedBy: {
    type: String,
  },
  removedBy_id: {
    type: String,
  },
  broucherName: {
    type: String,
  },
  timeline: {
    type: Array,
    default: [],
  },
  userDetails: {
    type: Object,
  },
});

const Streamrequest = mongoose.model('StreamRequest', streamRequestschema);

module.exports = {
  Streamrequest,
};
