const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username displayName profilePicture') 
      .populate('post', 'content _id') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });


    res.status(200).json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      totalNotifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  const userId = req.user._id;
  const notificationId = req.params.notificationId;

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.recipient.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this notification');
    }

    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const updateResult = await Notification.updateMany(
      { recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      message: 'All unread notifications marked as read.',
      modifiedCount: updateResult.modifiedCount 
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};