const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const moment = require('moment');

const  QualificationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    qualification:{
        type:String,
    },
    active:{
        type:Boolean,
        default:true,
    }
  },
  {
    timestamps: true,
  }
);
const Qualification = mongoose.model('Qualification', QualificationSchema);

const  sslcCourseSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Board:{
          type:String,
      },
      Degree:{
        type:String,
      },
      Education:{
        type:String,
      },
      QualificationId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const SslcCourse = mongoose.model('sslccourses', sslcCourseSchema);
  const  hscCourseSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Board:{
          type:String,
      },
      Degree:{
        type:String,
      },
      Education:{
        type:String,
      },
      QualificationId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const HscCourse = mongoose.model('hscCourse', hscCourseSchema);

  const  pgCourseSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Course:{
          type:String,
      },
      Degree:{
        type:String,
      },
      Education:{
        type:String,
      },
      QualificationId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const PgCourse = mongoose.model('pgCourse', pgCourseSchema);

  const  ugCourseSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Course:{
          type:String,
      },
      Degree:{
        type:String,
      },
      Education:{
        type:String,
      },
      QualificationId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const UgCourse = mongoose.model('ugCourse', ugCourseSchema);
  const  mediumSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      School_Medium:{
          type:String,
      },
      Education:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const Medium = mongoose.model('medium', mediumSchema);

  const  drCourseSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Course:{
          type:String,
      },
      Education:{
        type:String,
      },
      QualificationId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const DrCourse = mongoose.model('drCourse', drCourseSchema);
  const  specializationSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Course:{
          type:String,
      },
      Education:{
        type:String,
      },
      Specialization:{
        type:String,
      },
      courseId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const Specialization = mongoose.model('specialization', specializationSchema);

  const  pgspecializationSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Course:{
          type:String,
      },
      Education:{
        type:String,
      },
      Specialization:{
        type:String,
      },
      courseId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const Pgspecialization = mongoose.model('pgspecialization', pgspecializationSchema);

  const  drspecializationSchema = mongoose.Schema(
    {
      _id: {
        type: String,
        default: v4,
      },
      Course:{
          type:String,
      },
      Education:{
        type:String,
      },
      Specialization:{
        type:String,
      },
      courseId:{
        type:String,
      },
      active:{
          type:Boolean,
          default:true,
      }
    },
    {
      timestamps: true,
    }
  );
  const Drspecialization = mongoose.model('drspecialization', drspecializationSchema);
module.exports = {Qualification, SslcCourse, HscCourse, PgCourse, UgCourse, Medium, DrCourse, Specialization, Pgspecialization, Drspecialization} ;