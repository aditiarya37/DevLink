const Comment = require('../models/Comment');
const Post = require('../models/Post'); 
const Notification = require('../models/Notification');

const addCommentToPost = async (req, res, next) => {
  const { text } = req.body;
  const postId = req.params.postId;
  const userId = req.user._id; 

  if (!text || text.trim() === '') {
    res.status(400);
    throw new Error('Comment text is required');
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const postAuthorId = post.user; 

    const comment = new Comment({
      text,
      user: userId,
      post: postId,
    });
    const createdComment = await comment.save();

    post.commentCount = (await Comment.countDocuments({ post: postId })) || 0;
    await post.save();

    if (userId.toString() !== postAuthorId.toString()) {
        await Notification.create({
            recipient: postAuthorId,
            sender: userId,             
            type: 'comment_post',
            post: postId,
        });
    }

    await createdComment.populate('user', 'username displayName profilePicture');
    res.status(201).json(createdComment);
  } catch (error) {
    next(error);
  }
};

const getCommentsForPost = async (req, res, next) => {
  const postId = req.params.postId;
  const pageSize = 10; 
  const page = Number(req.query.pageNumber) || 1;

  try {
    const postExists = await Post.findById(postId);
    if (!postExists) {
      res.status(404);
      throw new Error('Post not found, cannot fetch comments');
    }

    const count = await Comment.countDocuments({ post: postId }); 
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username displayName profilePicture')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      comments,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  const { text } = req.body;
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!text || text.trim() === '') {
    res.status(400);
    throw new Error('Comment text is required for update');
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    if (comment.user.toString() !== userId.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this comment');
    }

    comment.text = text;
    const updatedComment = await comment.save();
    await updatedComment.populate('user', 'username displayName profilePicture');

    res.status(200).json(updatedComment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  const { commentId, postId } = req.params; 
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const post = await Post.findById(comment.post); 

    if (comment.user.toString() !== userId.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this comment');
    }

    await comment.deleteOne();

    if (post) {
      post.commentCount = (await Comment.countDocuments({ post: post._id })) || 0;
      await post.save();
    } else if (postId) { 
        const postToUpdate = await Post.findById(postId);
        if (postToUpdate) {
            postToUpdate.commentCount = (await Comment.countDocuments({ post: postId })) || 0;
            await postToUpdate.save();
        }
    }


    res.status(200).json({ message: 'Comment removed successfully' });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  addCommentToPost,
  getCommentsForPost,
  updateComment,
  deleteComment,
};