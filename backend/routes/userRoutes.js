const express = require('express');
const {
  getMyProfile,
  getUserProfileByUsername,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import the protect middleware

const router = express.Router();

router.get('/me', protect, getMyProfile);

router.put('/me/update', protect, updateUserProfile);

router.get('/profile/:username', getUserProfileByUsername);

module.exports = router;