const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createPost = async (req, res, next) => {
  const { content, tags, codeSnippet } = req.body;

  if (!content && (!codeSnippet || !codeSnippet.code)) { 
    res.status(400);
    throw new Error('Post must include content or a code snippet.');
  }
  if (codeSnippet && codeSnippet.code && !codeSnippet.language) {
      res.status(400);
      throw new Error('Please specify a language for the code snippet.');
  }


  try {
    const postFields = {
      user: req.user._id,
      content: content || '', 
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
    };

    if (codeSnippet && codeSnippet.code) {
      postFields.codeSnippet = {
        language: codeSnippet.language ? codeSnippet.language.trim().toLowerCase() : 'plaintext',
        code: codeSnippet.code, 
      };
    } else if (codeSnippet && !codeSnippet.code && codeSnippet.language) {
        res.status(400);
        throw new Error('Code content is missing for the specified language.');
    }


    const post = new Post(postFields);
    const createdPost = await post.save();
    await createdPost.populate('user', 'username displayName profilePicture');

    res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
};

const getGlobalFeedPosts = async (req, res, next) => {
  const pageSize = 10; 
  const page = Number(req.query.pageNumber) || 1;
    
  try {
    const queryOptions = {};

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
  const { content, tags, codeSnippet } = req.body;
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

    const newContent = content !== undefined ? content : post.content;
    const newCode = codeSnippet && codeSnippet.code !== undefined ? codeSnippet.code : post.codeSnippet?.code;

    if (!newContent && !newCode) {
        res.status(400);
        throw new Error('Post must include content or a code snippet after update.');
    }
    if (codeSnippet && codeSnippet.code && (codeSnippet.language === undefined && !post.codeSnippet?.language)) {
        res.status(400);
        throw new Error('Please specify a language for the new/updated code snippet.');
    }


    if (content !== undefined) post.content = content;
    if (tags !== undefined) {
      post.tags = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];
    }

    if (codeSnippet !== undefined) {
      if (codeSnippet.code === null || codeSnippet.code === '') { 
        post.codeSnippet = undefined;
      } else if (codeSnippet.code) {
        post.codeSnippet = {
          language: codeSnippet.language ? codeSnippet.language.trim().toLowerCase() : (post.codeSnippet?.language || 'plaintext'),
          code: codeSnippet.code,
        };
      } else if (codeSnippet.language && !codeSnippet.code) {
        if (post.codeSnippet && post.codeSnippet.code) {
            post.codeSnippet.language = codeSnippet.language.trim().toLowerCase();
        } else {
            res.status(400);
            throw new Error('Cannot set language without code content for a new snippet.');
        }
      }
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

const toggleLikePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id; 

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const postAuthorId = post.user; 
    const isLiked = post.likes.some(like => like.equals(userId));
    let newIsLikedStatus;

    if (isLiked) {
      post.likes = post.likes.filter(like => !like.equals(userId));
      newIsLikedStatus = false;
    } else {
      post.likes.push(userId);
      newIsLikedStatus = true;

      if (userId.toString() !== postAuthorId.toString()) {
        await Notification.create({
          recipient: postAuthorId, 
          sender: userId,           
          type: 'like_post',
          post: postId,
        });
      }
    }

    post.likeCount = post.likes.length;
    await post.save();

    res.status(200).json({
        _id: post._id,
        likes: post.likes,
        likeCount: post.likeCount,
        isLikedByCurrentUser: newIsLikedStatus
    });

  } catch (error) {
    next(error);
  }
};

const searchPosts = async (req, res, next) => {
  const keyword = req.query.q; 
  const tagsQuery = req.query.tags;

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  let queryConditions = [];

  if (keyword && keyword.trim() !== '') {
    queryConditions.push({ content: new RegExp(keyword.trim(), 'i') });
  }

  if (tagsQuery && tagsQuery.trim() !== '') {
    const tagsArray = tagsQuery.split(',').map(tag => tag.trim().toLowerCase());
    if (tagsArray.length > 0) {
      queryConditions.push({ tags: { $all: tagsArray } });
    }
  }

  if (queryConditions.length === 0) {
    if (!keyword && !tagsQuery) {
        return res.status(200).json({
            posts: [],
            page: 1,
            pages: 0,
            count: 0,
            message: "Please provide a search keyword or tags."
        });
    }
  }

  const finalQuery = queryConditions.length > 0 ? { $and: queryConditions } : {};

  try {
    const count = await Post.countDocuments(finalQuery);
    const posts = await Post.find(finalQuery)
      .populate('user', 'username displayName profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(count / limit),
      count
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getGlobalFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUserId,
  toggleLikePost,
  searchPosts,
};