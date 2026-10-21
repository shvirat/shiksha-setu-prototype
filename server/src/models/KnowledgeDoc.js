const mongoose = require('mongoose');

const knowledgeDocSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
      index: true
    },
    text: {
      type: String,
      required: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    schemeCode: {
      type: String,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

knowledgeDocSchema.index(
  { title: 'text', text: 'text', tags: 'text' },
  { language_override: 'none' }
);

const KnowledgeDoc = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
module.exports = KnowledgeDoc;
