const mongoose = require('mongoose');

const verificationResultSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    source: {
      type: String,
      enum: ['MOCK_DIGILOCKER', 'MOCK_UDISE', 'MOCK_APAAR', 'MOCK_OTR', 'MOCK_EDISTRICT', 'MOCK_BANK_DBT'],
      required: true
    },
    status: {
      type: String,
      enum: ['PASS', 'MISMATCH', 'ERROR'],
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const VerificationResult = mongoose.model('VerificationResult', verificationResultSchema);
module.exports = VerificationResult;
