const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    post: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Post',
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
      maxlength: [1000, 'Comment text cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true, 
  }
);

CommentSchema.index({ post: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;