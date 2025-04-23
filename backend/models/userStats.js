import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  totalUsers: {
    type: Number,
    required: true
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  newUsers: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure we have only one record per month/year
userStatsSchema.index({ month: 1, year: 1 }, { unique: true });

const UserStats = mongoose.model('UserStats', userStatsSchema);
export default UserStats; 