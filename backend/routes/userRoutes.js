const express = require('express');
const {
  getMyProfile,
  getUserProfileByUsername,
  updateUserProfile,
  followUser,
  unfollowUser,
  searchUsers,
  addWorkExperience,
  updateWorkExperience,
  deleteWorkExperience
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchUsers); 

router.get('/me', protect, getMyProfile);

router.put('/me/update', protect, updateUserProfile);

router.get('/profile/:username', getUserProfileByUsername);

router.put('/:userIdToFollow/follow', protect, followUser);

router.put('/:userIdToUnfollow/unfollow', protect, unfollowUser);

router.post('/profile/experience', protect, addWorkExperience);

router.put('/profile/experience/:exp_id', protect, updateWorkExperience);

router.delete('/profile/experience/:exp_id', protect, deleteWorkExperience);

module.exports = router;