const { Schema, model } = require('mongoose');
const { POST_CATEGORIES } = require('../utils/constants');

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, enum: POST_CATEGORIES, index: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

postSchema.index({ createdAt: -1 });

module.exports = model('Post', postSchema);
