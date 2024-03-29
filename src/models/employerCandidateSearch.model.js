const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { v4 } = require('uuid');

// const candiadteSearchSchema = mongoose.Schema(
//   {
//     _id: {
//       type: String,
//       default: v4,
//     },
//     anyKeywords: {
//       type: Array,
//     },
//     keyskill: {
//       type: Array,
//     },
//     experienceMonthFrom: {
//       type: Number,
//     },
//     experienceMonthTo: {
//       type: Number,
//     },
//     experienceYearFrom: {
//       type: Number,
//     },
//     experienceYearTo: {
//       type: Number,
//     },
//     salaryFrom: {
//       type: Number,
//     },
//     salaryTo: {
//       type: Number,
//     },
//     locationCurrent: {
//       type: String,
//     },
//     education: {
//       type: String,
//     },
//     course: {
//       type: String,
//     },
//     specification: {
//       type: String,
//     },
//     university: {
//       type: String,
//     },
//     courseType: {
//       type: String,
//     },
//     passingYearFrom: {
//       type: Number,
//     },
//     passingYearTo: {
//       type: Number,
//     },
//     registration: {
//       type: String,
//     },
//     onlyCandidates: {
//       type: String,
//     },
//     candiadeSeeking: {
//       type: String,
//     },
//     employmentType: {
//       type: String,
//     },
//     EducationalType: {
//       type: String,
//     },
//     userId: {
//       type: String,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const CandiadteSearch = mongoose.model('candiadteSearch', candiadteSearchSchema);
// const createSavetoFolderSchema = mongoose.Schema(
//   {
//     _id: {
//       type: String,
//       default: v4,
//     },
//     userId: {
//       type: String,
//     },
//     candidateId: {
//       type: String,
//     },
//     status: {
//       type: Boolean,
//       default: true,
//     },
//     folderName: {
//       type: String,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const CreateSavetoFolder = mongoose.model('SavetoFolderEmployerSearches', createSavetoFolderSchema);
// const createSavetoFolderseprateSchema = mongoose.Schema(
//   {
//     _id: {
//       type: String,
//       default: v4,
//     },
//     userId: {
//       type: String,
//     },
//     candidateId: {
//       type: String,
//     },
//     status: {
//       type: Boolean,
//       default: true,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const CreateSavetoFolderseprate = mongoose.model('createSavetoFolderseprate', createSavetoFolderseprateSchema);
// const createoutSearchHistorySchema = mongoose.Schema(
//   {
//     _id: {
//       type: String,
//       default: v4,
//     },
//     userId: {
//       type: String,
//     },
//     experience: {
//       type: Number,
//     },
//     keyskills: {
//       type: Array,
//     },
//     anykeywords: {
//       type: String,
//     },
//     experiencefrom: {
//       type: Number,
//     },
//     experienceto: {
//       type: Number,
//     },
//     Location: {
//       type: Array,
//     },
//     qualification: {
//       type: Array,
//     },
//     date: {
//       type: String,
//     },
//     salary: {
//       type: Array,
//     },
//     displayDetails: {
//       type: String,
//     },
//     course: {
//       type: Array,
//     },
//     gender: {
//       type: String,
//     },
//     date: {
//       type: String,
//     },
//     time: {
//       type: String,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const CreateoutSearchHistory = mongoose.model('createoutSearchHistory', createoutSearchHistorySchema);
// const createoutSearchHistorySaveShema = mongoose.Schema(
//   {
//     _id: {
//       type: String,
//       default: v4,
//     },
//     userId: {
//       type: String,
//     },
//     keyskills: {
//       type: Array,
//     },
//     experience: {
//       type: Number,
//     },
//     anykeywords: {
//       type: Array,
//     },
//     experiencefrom: {
//       type: Number,
//     },
//     experienceto: {
//       type: Number,
//     },
//     Location: {
//       type: Array,
//     },
//     qualification: {
//       type: Array,
//     },
//     date: {
//       type: String,
//     },
//     salary: {
//       type: Array,
//     },
//     displayDetails: {
//       type: String,
//     },
//     course: {
//       type: Array,
//     },
//     gender: {
//       type: String,
//     },
//     searchTittle: {
//       type: String,
//     },
//     time: {
//       type: String,
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// const CreateoutSearchHistorySave = mongoose.model('createoutSearchHistorySave', createoutSearchHistorySaveShema);



const folderschema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    status: {
      type: String,
      default: "Created",
    },
    folderName: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Folder = mongoose.model('emp-folder', folderschema);




const savedcandidateschema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    userId: {
      type: String,
    },
    status: {
      type: String,
      default: "Created",
    },
    folderId: {
      type: String,
    },
    folderName: {
      type: String,
    },
    candidateId: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Savedcandidate = mongoose.model('saved-candidate', savedcandidateschema);


module.exports = {
  // CandiadteSearch,
  // CreateSavetoFolder,
  // CreateSavetoFolderseprate,
  // CreateoutSearchHistory,
  // CreateoutSearchHistorySave,
  Folder,
  Savedcandidate
};
