const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    dob: {
      type: String, // YYYY-MM-DD
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    category: {
      type: String,
      default: 'ST',
      required: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    familyIncome: {
      type: Number,
      required: true,
      min: 0
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1
    },
    udiseId: {
      type: String,
      trim: true,
      default: ''
    },
    apaarId: {
      type: String,
      trim: true,
      default: ''
    },
    maskedBankRef: {
      type: String,
      trim: true,
      default: 'XXXX-XXXX-1234'
    }
  },
  {
    timestamps: true
  }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
module.exports = StudentProfile;
