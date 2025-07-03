const mongoose = require('mongoose');

const LinkPreviewSchema = new mongoose.Schema({ 
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String }, 
    siteName: { type: String },
}, { _id: false });

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
    codeSnippet: {
      language: {
        type: String,
        trim: true,
        lowercase: true,
      },
      code: {
        type: String,
        trim: true, 
      }
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
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    linkPreview: LinkPreviewSchema,
    mediaUrl: {
      type: String,
    },
    mediaPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ content: 'text' }); 

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;