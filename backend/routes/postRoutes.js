const express = require('express');
const {
  createPost,
  getFeedPosts,
  getGlobalFeedPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUserId,
  toggleLikePost,
  searchPosts,
  getPostsByTag,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); 

const commentRouter = require('./commentRoutes');

const router = express.Router();

router.use('/:postId/comments', commentRouter);

router.get('/search', searchPosts);

router.get('/', protect, getFeedPosts);

router.get('/global', getGlobalFeedPosts);

router.get('/:id', getPostById);

router.get('/tag/:tagName', getPostsByTag);

router.get('/user/:userId', getPostsByUserId);

router.post('/', protect, createPost);

router.put('/:id', protect, updatePost);

router.delete('/:id', protect, deletePost);

router.put('/:id/like', protect, toggleLikePost);

module.exports = router;