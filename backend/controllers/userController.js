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

const followUser = async (req, res) => {
  const userIdToFollow = req.params.userIdToFollow;
  const currentUserId = req.user._id; 

  if (userIdToFollow === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  try {
    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      res.status(404);
      throw new Error('User not found');
    }

    if (currentUser.following.includes(userIdToFollow)) {
      res.status(400);
      throw new Error('You are already following this user');
    }

    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: `Successfully followed ${userToFollow.username}` });

  } catch (error) {
    console.error('Error following user:', error.message);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

const unfollowUser = async (req, res) => {
  const userIdToUnfollow = req.params.userIdToUnfollow;
  const currentUserId = req.user._id;

  if (userIdToUnfollow === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot unfollow yourself");
  }

  try {
    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!currentUser.following.includes(userIdToUnfollow)) {
      res.status(400);
      throw new Error('You are not following this user');
    }

    currentUser.following = currentUser.following.filter(
      (followedId) => followedId.toString() !== userIdToUnfollow
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: `Successfully unfollowed ${userToUnfollow.username}` });

  } catch (error) {
    console.error('Error unfollowing user:', error.message);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  getMyProfile,
  getUserProfileByUsername,
  updateUserProfile,
  followUser,
  unfollowUser,
};