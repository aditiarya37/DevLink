const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

const MAX_COMMENT_DEPTH = 5;

const addCommentToPost = async (req, res, next) => {
  const { text, parentCommentId } = req.body;
  const postId = req.params.postId;
  const userId = req.user._id;

  if (!text || text.trim() === '') {
    res.status(400);
    return next(new Error('Comment text is required'));
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      return next(new Error('Post not found'));
    }

    let parentCommentDoc = null; 
    let depth = 0;

    if (parentCommentId) {
      parentCommentDoc = await Comment.findById(parentCommentId);
      if (!parentCommentDoc) {
        res.status(404);
        return next(new Error('Parent comment not found'));
      }
      if (parentCommentDoc.post.toString() !== postId) {
        res.status(400);
        return next(new Error('Parent comment does not belong to this post'));
      }
      depth = parentCommentDoc.depth + 1;
      if (depth > MAX_COMMENT_DEPTH) {
        res.status(400);
        return next(new Error(`Comment nesting depth cannot exceed ${MAX_COMMENT_DEPTH}`));
      }
    }

    const commentFields = {
      text,
      user: userId,
      post: postId,
      parentComment: parentCommentId || null,
      depth,
    };

    const newComment = new Comment(commentFields);
    const createdComment = await newComment.save();

    if (parentCommentDoc) {
      parentCommentDoc.replyCount = (parentCommentDoc.replyCount || 0) + 1;
      await parentCommentDoc.save();
    }

    post.commentCount = (await Comment.countDocuments({ post: postId })) || 0;
    await post.save();

    let notificationRecipient = null;
    if (parentCommentDoc && parentCommentDoc.user.toString() !== userId.toString()) {
        notificationRecipient = parentCommentDoc.user;
    } else if (!parentCommentDoc && post.user.toString() !== userId.toString()) {
        notificationRecipient = post.user;
    }

    if (notificationRecipient) {
        await Notification.create({
            recipient: notificationRecipient,
            sender: userId,
            type: parentCommentDoc ? 'reply_comment' : 'comment_post',
            post: postId,
            comment: createdComment._id,
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
  const pageSize = parseInt(req.query.limit) || 10;
  const page = Number(req.query.pageNumber) || 1;

  try {
    const postExists = await Post.findById(postId);
    if (!postExists) {
      res.status(404);
      return next(new Error('Post not found, cannot fetch comments'));
    }

    const query = { post: postId, parentComment: null }; 
    const count = await Comment.countDocuments(query);
    const comments = await Comment.find(query)
      .populate('user', 'username displayName profilePicture')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      comments,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(error);
  }
};

const getCommentReplies = async (req, res, next) => {
    const parentCommentId = req.params.commentId;
    const pageSize = parseInt(req.query.limit) || 5;
    const page = Number(req.query.pageNumber) || 1;

    try {
        const parentCommentExists = await Comment.findById(parentCommentId);
        if (!parentCommentExists) {
            res.status(404);
            return next(new Error('Parent comment not found, cannot fetch replies.'));
        }

        const query = { parentComment: parentCommentId };
        const count = await Comment.countDocuments(query);
        const replies = await Comment.find(query)
            .populate('user', 'username displayName profilePicture')
            .sort({ createdAt: 1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        
        res.status(200).json({
            replies,
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
    if (!text || text.trim() === '') { res.status(400); return next(new Error('Comment text is required for update')); }
    try {
        const commentToUpdate = await Comment.findById(commentId); 
        if (!commentToUpdate) { res.status(404); return next(new Error('Comment not found')); }
        if (commentToUpdate.user.toString() !== userId.toString()) { res.status(401); return next(new Error('User not authorized to update this comment'));}
        commentToUpdate.text = text;
        const updatedComment = await commentToUpdate.save();
        await updatedComment.populate('user', 'username displayName profilePicture');
        res.status(200).json(updatedComment);
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (req, res, next) => {
   const { commentId } = req.params;
   const userId = req.user._id;

   try {
     const commentToDelete = await Comment.findById(commentId);
     if (!commentToDelete) {
       res.status(404);
       return next(new Error('Comment not found'));
     }

     const post = await Post.findById(commentToDelete.post);
     if (!post) {
         res.status(404);
         return next(new Error('Associated post not found'));
     }

     const isCommentAuthor = commentToDelete.user.toString() === userId.toString();
     const isPostAuthor = post.user.toString() === userId.toString();

     if (!isCommentAuthor && !isPostAuthor) {
       res.status(401);
       return next(new Error('User not authorized to delete this comment'));
     }

     if (commentToDelete.replyCount > 0 && commentToDelete.status === 'visible') {
         commentToDelete.text = "[This comment has been deleted by user]";
         commentToDelete.status = 'deleted';
         await commentToDelete.save();
         res.status(200).json({ message: 'Comment marked as deleted to preserve replies', comment: commentToDelete });

     } else {
         await Comment.deleteOne({ _id: commentId });

         if (commentToDelete.parentComment) {
             await Comment.findByIdAndUpdate(commentToDelete.parentComment, { $inc: { replyCount: -1 } });
         }
         post.commentCount = Math.max(0, (post.commentCount || 0) - 1);
         await post.save();
         res.status(200).json({ message: 'Comment removed successfully' });
     }
   } catch (error) {
     next(error);
   }
 };

module.exports = {
  addCommentToPost,
  getCommentsForPost,
  getCommentReplies,
  updateComment,
  deleteComment,
};