const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  type: {
    type: String,
    enum: ['status_update', 'ai_flagged', 'general'],
    default: 'status_update'
  },
  title: String,
  message: String,
  status: String, // approved, rejected
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
