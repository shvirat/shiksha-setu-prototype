const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['st_certificate', 'income_certificate', 'marksheet', 'aadhaar_id', 'bank_passbook', 'other'],
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    storedPath: {
      type: String,
      required: true
    },
    encrypted: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'FLAGGED', 'EXPIRED'],
      default: 'PENDING'
    },
    source: {
      type: String,
      enum: ['STUDENT_UPLOAD', 'MOCK_DIGILOCKER', 'MOCK_EDISTRICT'],
      default: 'STUDENT_UPLOAD'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
