const express = require('express');
const {
  getMyProfile,
  getUserProfileByUsername,
  updateUserProfile,
  followUser,
  unfollowUser,
  searchUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchUsers); 

router.get('/me', protect, getMyProfile);

router.put('/me/update', protect, updateUserProfile);

router.get('/profile/:username', getUserProfileByUsername);

router.put('/:userIdToFollow/follow', protect, followUser);

router.put('/:userIdToUnfollow/unfollow', protect, unfollowUser);

module.exports = router;