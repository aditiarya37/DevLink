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
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    depth: { 
      type: Number,
      default: 0,
      min: 0,
      max: 5 
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    status: {
         type: String,
         enum: ['visible', 'deleted'], 
         default: 'visible',
     }
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ post: 1, parentComment: 1, createdAt: -1 }); 
CommentSchema.index({ parentComment: 1, createdAt: 1 }); 

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;