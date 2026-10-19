const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    purpose: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    }
  },
  {
    timestamps: true
  }
);

consentRecordSchema.index({ userId: 1, source: 1, purpose: 1 });

const ConsentRecord = mongoose.model('ConsentRecord', consentRecordSchema);
module.exports = ConsentRecord;
