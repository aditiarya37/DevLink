const express = require('express');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.use(protect); 

router.get('/', getNotifications);

router.patch('/read-all', markAllNotificationsAsRead);

router.patch('/:notificationId/read', markNotificationAsRead);

module.exports = router;