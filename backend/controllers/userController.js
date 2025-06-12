const User = require('../models/User');
const Notification = require('../models/Notification'); 

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

const followUser = async (req, res, next) => {
  const userIdToFollow = req.params.userIdToFollow;
  const currentUserId = req.user._id;

  if (userIdToFollow === currentUserId.toString()) {
    res.status(400);
    return next(new Error("You cannot follow yourself"));
  }

  try {
    const [userToFollow, currentUser] = await Promise.all([
      User.findById(userIdToFollow),
      User.findById(currentUserId)
    ]);

    if (!userToFollow) {
      res.status(404);
      return next(new Error('User to follow not found'));
    }
    if (!currentUser) {
      res.status(404);
      return next(new Error('Current user not found'));
    }

    if (currentUser.following.map(id => id.toString()).includes(userIdToFollow.toString())) {
      res.status(400);
      return next(new Error('You are already following this user'));
    }

    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    if (currentUserId.toString() !== userIdToFollow.toString()) {
        try {
            await Notification.create({
                recipient: userIdToFollow,
                sender: currentUserId,
                type: 'follow',
            });
        } catch (notificationError) {
            console.error('Error creating follow notification:', notificationError.message);
        }
    }

    res.status(200).json({ message: `Successfully followed ${userToFollow.username}` });

  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  const userIdToUnfollow = req.params.userIdToUnfollow;
  const currentUserId = req.user._id;

  if (userIdToUnfollow === currentUserId.toString()) {
    res.status(400);
    return next(new Error("You cannot unfollow yourself"));
  }
  try {
    const [userToUnfollow, currentUser] = await Promise.all([
        User.findById(userIdToUnfollow),
        User.findById(currentUserId)
    ]);

    if (!userToUnfollow || !currentUser) {
      res.status(404);
      return next(new Error('User not found'));
    }
    if (!currentUser.following.map(id => id.toString()).includes(userIdToUnfollow.toString())) {
      res.status(400);
      return next(new Error('You are not following this user'));
    }
    currentUser.following = currentUser.following.filter(
      (followedId) => followedId.toString() !== userIdToUnfollow.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== currentUserId.toString()
    );
    await currentUser.save();
    await userToUnfollow.save();
    res.status(200).json({ message: `Successfully unfollowed ${userToUnfollow.username}` });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  const searchTerm = req.query.q; // Get search term from query parameter 'q'
  const limit = parseInt(req.query.limit) || 10; // Allow specifying limit, default 10
  const page = parseInt(req.query.page) || 1;    // Allow specifying page
  const skip = (page - 1) * limit;

  if (!searchTerm || searchTerm.trim() === '') {
    // Return empty array or specific message if search term is missing
    return res.status(200).json({
        users: [],
        page: 1,
        pages: 0,
        count: 0
    });
  }

  try {
    // Create a regex for case-insensitive partial matching
    const regex = new RegExp(searchTerm.trim(), 'i'); // 'i' for case-insensitive

    // Search criteria: username OR displayName matches the regex
    const query = {
      $or: [
        { username: regex },
        { displayName: regex }
        // Future: Add search by skills: { 'skills.name': regex } if skills is an array of objects
        // Or if skills is an array of strings: { skills: regex }
      ],
    };

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('username displayName profilePicture bio') // Select fields to return
      .limit(limit)
      .skip(skip)
      .sort({ displayName: 1 }); // Optional: sort by displayName or username

    res.status(200).json({
      users,
      page,
      pages: Math.ceil(count / limit),
      count
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  getUserProfileByUsername,
  updateUserProfile,
  followUser,
  unfollowUser,
  searchUsers,
};