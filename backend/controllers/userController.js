const User = require('../models/User');

const getMyProfile = async (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

const getUserProfileByUsername = async (req, res) => {
  try {
    const username = req.params.username.toLowerCase(); 
    const user = await User.findOne({ username: username }).select('-password'); 

    if (user) {
      res.status(200).json({
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user profile by username:', error.message);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.displayName = req.body.displayName || user.displayName;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio; 
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email, 
      displayName: updatedUser.displayName,
      profilePicture: updatedUser.profilePicture,
      bio: updatedUser.bio,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found for update');
  }
};

module.exports = {
  getMyProfile,
  getUserProfileByUsername,
  updateUserProfile,
};