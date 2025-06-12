const express = require('express');
const {
  addCommentToPost,
  getCommentsForPost,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.post('/', protect, addCommentToPost);

router.get('/', getCommentsForPost);

router.put('/:commentId', protect, updateComment);

router.delete('/:commentId', protect, deleteComment);

module.exports = router;