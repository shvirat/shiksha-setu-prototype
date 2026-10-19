const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    nameHi: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    descriptionHi: {
      type: String,
      default: ''
    },
    level: {
      type: String,
      enum: ['Pre-Matric', 'Post-Matric', 'Higher Education', 'Overseas'],
      required: true
    },
    eligibilityRules: {
      incomeCeiling: { type: Number, default: null }, // null means no ceiling
      allowedCategories: [{ type: String, default: ['ST'] }],
      minCourseYear: { type: Number, default: 1 },
      maxCourseYear: { type: Number, default: 10 },
      allowedLevels: [{ type: String }],
      conflictsWith: [{ type: String }] // Scheme codes that cannot be held together
    },
    requiredDocs: [
      {
        type: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        mandatory: {
          type: Boolean,
          default: true
        }
      }
    ],
    sourcePortal: {
      type: String,
      enum: ['NSP', 'SFMP', 'NOS', 'MoTA Unified Portal'],
      default: 'MoTA Unified Portal'
    },
    sample: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Scheme = mongoose.model('Scheme', schemeSchema);
module.exports = Scheme;
