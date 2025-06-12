const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: ['follow', 'like_post', 'comment_post'],
    },
    post: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 }); 

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;