const User = require('../models/User');
const Notification = require('../models/Notification');

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

const getUserProfileByUsername = async (req, res, next) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username: username })
      .select('username displayName profilePicture bio location skills links workExperience education followers following createdAt');

    if (user) {
      const userProfile = {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        location: user.location,
        skills: user.skills,
        links: user.links,
        workExperience: user.workExperience,
        education: user.education,
        followerCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0,
        createdAt: user.createdAt,
      };
      res.status(200).json(userProfile);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.displayName = req.body.displayName !== undefined ? req.body.displayName.trim() : user.displayName;
      user.bio = req.body.bio !== undefined ? req.body.bio.trim() : user.bio;
      user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture.trim() : user.profilePicture;
      user.location = req.body.location !== undefined ? req.body.location.trim() : user.location;
      
      if (req.body.skills !== undefined) {
        user.skills = Array.isArray(req.body.skills) 
          ? req.body.skills.map(skill => String(skill).trim().toLowerCase()).filter(skill => skill) 
          : [];
      }

      if (req.body.links !== undefined) {
        user.links = {
          github: req.body.links.github !== undefined ? String(req.body.links.github).trim() : (user.links?.github || ''),
          linkedin: req.body.links.linkedin !== undefined ? String(req.body.links.linkedin).trim() : (user.links?.linkedin || ''),
          website: req.body.links.website !== undefined ? String(req.body.links.website).trim() : (user.links?.website || ''),
        };
      } else if (user.links === undefined) { 
          user.links = { github: '', linkedin: '', website: '' };
      }


      if (req.body.workExperience !== undefined) {
        user.workExperience = req.body.workExperience;
      }
      if (req.body.education !== undefined) {
        user.education = req.body.education;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        location: updatedUser.location,
        skills: updatedUser.skills,
        links: updatedUser.links,
        workExperience: updatedUser.workExperience,
        education: updatedUser.education,
        following: updatedUser.following,
        followers: updatedUser.followers,
      });
    } else {
      res.status(404);
      throw new Error('User not found for update');
    }
  } catch (error) {
    next(error);
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
    if (!userToFollow) { res.status(404); return next(new Error('User to follow not found')); }
    if (!currentUser) { res.status(404); return next(new Error('Current user not found')); }

    if (currentUser.following.map(id => id.toString()).includes(userIdToFollow._id.toString())) {
      res.status(400);
      return next(new Error('You are already following this user'));
    }
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);
    await currentUser.save();
    await userToFollow.save();
    if (currentUser._id.toString() !== userToFollow._id.toString()) {
        try {
            await Notification.create({
                recipient: userToFollow._id,
                sender: currentUser._id,
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
    if (!userToUnfollow || !currentUser) { res.status(404); return next(new Error('User not found')); }
    if (!currentUser.following.map(id => id.toString()).includes(userToUnfollow._id.toString())) {
      res.status(400);
      return next(new Error('You are not following this user'));
    }
    currentUser.following = currentUser.following.filter(
      (followedId) => followedId.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== currentUser._id.toString()
    );
    await currentUser.save();
    await userToUnfollow.save();
    res.status(200).json({ message: `Successfully unfollowed ${userToUnfollow.username}` });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  const searchTerm = req.query.q;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(200).json({ users: [], page: 1, pages: 0, count: 0 });
  }
  try {
    const regex = new RegExp(searchTerm.trim(), 'i');
    const query = {
      $or: [ { username: regex }, { displayName: regex }, { skills: regex } ],
    };
    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('username displayName profilePicture bio skills')
      .limit(limit)
      .skip(skip)
      .sort({ displayName: 1 });
    res.status(200).json({ users, page, pages: Math.ceil(count / limit), count });
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