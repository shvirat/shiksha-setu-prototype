const mongoose = require('mongoose');

const enrollmentRecordSchema = new mongoose.Schema(
  {
    udiseId: {
      type: String,
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    dob: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'female'
    },
    category: {
      type: String,
      required: true,
      default: 'ST',
      index: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      default: 'Higher Secondary'
    },
    level: {
      type: String,
      enum: ['Pre-Matric', 'Post-Matric', 'Higher Education', 'Overseas'],
      default: 'Post-Matric'
    },
    state: {
      type: String,
      required: true,
      index: true
    },
    district: {
      type: String,
      required: true,
      index: true
    },
    familyIncomeEstimate: {
      type: Number,
      default: 180000
    }
  },
  {
    timestamps: true
  }
);

const EnrollmentRecord = mongoose.model('EnrollmentRecord', enrollmentRecordSchema);
module.exports = EnrollmentRecord;
