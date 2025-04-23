import mongoose from 'mongoose';

const engagementSchema = new mongoose.Schema({
  postId: {
    type: String,
    ref: 'Post',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// Compound index to ensure unique entries per post per month/year
engagementSchema.index({ postId: 1, month: 1, year: 1 }, { unique: true });

const Engagement = mongoose.model('Engagement', engagementSchema);
export default Engagement; 