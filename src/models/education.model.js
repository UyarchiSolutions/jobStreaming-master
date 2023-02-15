const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { StringDecoder } = require('string_decoder');
const { v4 } = require('uuid');
const moment = require('moment');

const QualificationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    qualification: {
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
const Qualification = mongoose.model('Qualification', QualificationSchema);

const sslcCourseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Board: {
      type: String,
    },
    Degree: {
      type: String,
    },
    Education: {
      type: String,
    },
    QualificationId: {
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
const SslcCourse = mongoose.model('sslccourses', sslcCourseSchema);
const hscCourseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Board: {
      type: String,
    },
    Degree: {
      type: String,
    },
    Education: {
      type: String,
    },
    QualificationId: {
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
const HscCourse = mongoose.model('hscCourse', hscCourseSchema);

const pgCourseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Degree: {
      type: String,
    },
    Education: {
      type: String,
    },
    QualificationId: {
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
const PgCourse = mongoose.model('pgCourse', pgCourseSchema);

const ugCourseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Degree: {
      type: String,
    },
    Education: {
      type: String,
    },
    QualificationId: {
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
const UgCourse = mongoose.model('ugCourse', ugCourseSchema);
const mediumSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    School_Medium: {
      type: String,
    },
    Education: {
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
const Medium = mongoose.model('medium', mediumSchema);

const drCourseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Education: {
      type: String,
    },
    QualificationId: {
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
const DrCourse = mongoose.model('drCourse', drCourseSchema);
const specializationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Education: {
      type: String,
    },
    Specialization: {
      type: String,
    },
    courseId: {
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
const Specialization = mongoose.model('specialization', specializationSchema);

const pgspecializationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Education: {
      type: String,
    },
    Specialization: {
      type: String,
    },
    courseId: {
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
const Pgspecialization = mongoose.model('pgspecialization', pgspecializationSchema);

const drspecializationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Education: {
      type: String,
    },
    Specialization: {
      type: String,
    },
    courseId: {
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
const Drspecialization = mongoose.model('drspecialization', drspecializationSchema);
const departmentSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Department: {
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
const Department = mongoose.model('department', departmentSchema);
const citySchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    name: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    stateCode: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
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
const City = mongoose.model('city', citySchema);
const rolecategorySchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Role_Category: {
      type: String,
    },
    DepartmentId: {
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
const Rolecategory = mongoose.model('rolecategory', rolecategorySchema);
const industriesSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Type: {
      type: String,
    },
    Industry: {
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
const Industries = mongoose.model('industry', industriesSchema);
const roleSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    RoleId: {
      type: String,
    },
    Job_role: {
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
const Role = mongoose.model('jobrole', roleSchema);
const allCourseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },
    Degree: {
      type: String,
    },
    Education: {
      type: String,
    },
    QualificationId: {
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
const AllCourse = mongoose.model('allCourse', allCourseSchema);
const skillSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Skill_Title: {
      type: String,
    },   
  },
);
const Skill = mongoose.model('skill', skillSchema);
const allSpecializationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
      default: v4,
    },
    Course: {
      type: String,
    },   
    Education: {
      type: String,
    },
    Specialization: {
      type: String,
    },
    courseId: {
      type: String,
    },
  },
);
const AllSpecialization = mongoose.model('allSpecialization', allSpecializationSchema);
module.exports = {
  Qualification,
  SslcCourse,
  HscCourse,
  PgCourse,
  UgCourse,
  Medium,
  DrCourse,
  Specialization,
  Pgspecialization,
  Drspecialization,
  Department,
  City,
  Rolecategory,
  Industries,
  Role,
  AllCourse,
  Skill,
  AllSpecialization,
};
