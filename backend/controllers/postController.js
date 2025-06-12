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
    console.error('Error creating post:', error.message);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1; 

  try {
    const count = await Post.countDocuments(); 
    const posts = await Post.find({})
      .populate('user', 'username displayName profilePicture') 
      .sort({ createdAt: -1 }) 
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    console.error('Error getting all posts:', error.message);
    res.status(500).json({ message: 'Server Error while fetching posts' });
  }
};

const getPostById = async (req, res) => {
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
    console.error(`Error getting post by ID ${req.params.id}:`, error.message);
    const statusCode = res.statusCode === 200 ? (error.kind === 'ObjectId' ? 404 : 500) : res.statusCode;
    res.status(statusCode).json({ message: error.message || 'Post not found' });
  }
};

const updatePost = async (req, res) => {
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
    console.error(`Error updating post ${req.params.id}:`, error.message);
    const statusCode = res.statusCode === 200 ? (error.kind === 'ObjectId' ? 404 : 500) : res.statusCode;
    res.status(statusCode).json({ message: error.message || 'Error updating post' });
  }
};

const deletePost = async (req, res) => {
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
    console.error(`Error deleting post ${req.params.id}:`, error.message);
    const statusCode = res.statusCode === 200 ? (error.kind === 'ObjectId' ? 404 : 500) : res.statusCode;
    res.status(statusCode).json({ message: error.message || 'Error deleting post' });
  }
};

const getPostsByUserId = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .populate('user', 'username displayName profilePicture')
            .sort({ createdAt: -1 });

        if (!posts) { 
            return res.status(200).json([]); 
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error(`Error getting posts for user ${req.params.userId}:`, error.message);
        const statusCode = res.statusCode === 200 ? (error.kind === 'ObjectId' ? 404 : 500) : res.statusCode;
        res.status(statusCode).json({ message: error.message || 'Error fetching user posts' });
    }
};


module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUserId,
};