const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likeCount: {
        type: Number,
        default: 0
    }
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;