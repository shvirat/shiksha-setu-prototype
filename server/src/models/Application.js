const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    schemeCode: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'AUTO_VERIFYING',
        'VERIFIED',
        'FLAGGED',
        'UNDER_REVIEW',
        'APPROVED_FOR_SANCTION',
        'REJECTED',
        'DISBURSED_SIMULATED'
      ],
      default: 'DRAFT',
      index: true
    },
    prefilled: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    attachedDocs: [
      {
        docType: String,
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Document'
        },
        originalName: String
      }
    ],
    mismatches: [
      {
        field: { type: String, required: true },
        userValue: { type: String, required: true },
        recordValue: { type: String, required: true },
        source: { type: String, required: true },
        note: { type: String, default: '' },
        resolved: { type: Boolean, default: false }
      }
    ],
    timeline: [
      {
        status: { type: String, required: true },
        at: { type: Date, default: Date.now },
        by: { type: String, default: 'SYSTEM' }, // 'SYSTEM' or Officer name/id
        note: { type: String, default: '' }
      }
    ],
    rejectionReason: {
      type: String,
      default: ''
    },
    recommendedSchemes: [
      {
        type: String // Scheme codes recommended on rejection
      }
    ]
  },
  {
    timestamps: true
  }
);

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
