const express = require('express');
const commentController = require('../controllers/commentController'); 
console.log('Imported commentController in commentRoutes:', commentController); 

const {
  addCommentToPost,
  getCommentsForPost,
  getCommentReplies,
  updateComment,
  deleteComment,
} = commentController;

const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(protect, addCommentToPost)
  .get(getCommentsForPost);

router.get('/:commentId/replies', getCommentReplies);

router.route('/:commentId')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;