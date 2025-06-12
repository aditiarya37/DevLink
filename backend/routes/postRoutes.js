const express = require('express');
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByUserId,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.get('/', getAllPosts);

router.get('/:id', getPostById);

router.get('/user/:userId', getPostsByUserId);

router.post('/', protect, createPost);

router.put('/:id', protect, updatePost);

router.delete('/:id', protect, deletePost);

module.exports = router;