const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  const { content, tags } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('Post content is required');
  }
  try {
    const post = new Post({
      user: req.user._id,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
    });
    const createdPost = await post.save();
    await createdPost.populate('user', 'username displayName profilePicture');
    res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
};

const getFeedPosts = async (req, res, next) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  let queryOptions = {};
  
  try {
    const currentUserWithFollowing = await User.findById(req.user._id).select('following');

    if (!currentUserWithFollowing) {
      res.status(404);
      throw new Error("User not found for feed generation.");
    }

    const followedUserIds = currentUserWithFollowing.following.map(id => id.toString());
    let usersForFeedQuery = [req.user._id.toString()]; 
    if (followedUserIds.length > 0) {
      usersForFeedQuery = [...usersForFeedQuery, ...followedUserIds];
    }
    
    queryOptions = { user: { $in: usersForFeedQuery } };
    
    const count = await Post.countDocuments(queryOptions);
    const posts = await Post.find(queryOptions)
      .populate('user', 'username displayName profilePicture')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });

  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
                         .populate('user', 'username displayName profilePicture');
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404);
      throw new Error('Post not found');
    }
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  const { content, tags } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this post');
    }
    post.content = content || post.content;
    if (tags !== undefined) {
         post.tags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
    }
    const updatedPost = await post.save();
    await updatedPost.populate('user', 'username displayName profilePicture');
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this post');
    }
    await post.deleteOne();
    res.status(200).json({ message: 'Post removed successfully' });
  } catch (error) {
    next(error);
  }
};

const getPostsByUserId = async (req, res, next) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'username displayName profilePicture')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        next(error);
    }
};

module.exports = {
  createPost,
  getFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUserId,
};