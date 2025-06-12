import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationItem = ({ notification, onNotificationClicked }) => {
  const { token, decrementUnreadCount } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (!notification || !notification.sender) {
    return <li className="p-2 text-xs text-gray-500">Invalid notification data.</li>;
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) { return "Invalid date"; }
  };

  let linkTo = "/";
  let message = "";

  switch (notification.type) {
    case 'follow':
      message = `${notification.sender.displayName || notification.sender.username} started following you.`;
      linkTo = `/profile/${notification.sender.username.toLowerCase()}`;
      break;
    case 'like_post':
      message = `${notification.sender.displayName || notification.sender.username} liked your post.`;
      linkTo = notification.post?._id ? `/posts/${notification.post._id}` : '/'; 
      break;
    case 'comment_post':
      message = `${notification.sender.displayName || notification.sender.username} commented on your post.`;
      linkTo = notification.post?._id ? `/posts/${notification.post._id}` : '/';
      break;
    case 'reply_comment': 
        message = `${notification.sender.displayName || notification.sender.username} replied to your comment.`;
        linkTo = notification.post?._id ? `/posts/${notification.post._id}` : '/'; 
        if (notification.comment?._id && linkTo !== '/')
        break;
    default:
      message = "You have a new notification.";
  }

  const handleNotificationClick = async () => {
    if (linkTo && linkTo !== "/posts/undefined" && linkTo !== "/posts/null") { 
        navigate(linkTo);
    } else if (notification.type === 'like_post' || notification.type === 'comment_post') {
        console.warn("Notification points to an undefined post, navigating to home.");
        navigate("/"); 
    } else {
        navigate(linkTo);
    }

    if (!notification.read && token) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.patch(`${API_BASE_URL}/notifications/${notification._id}/read`, {}, config);
        if (onNotificationClicked) {
          onNotificationClicked(notification._id); 
        }
        decrementUnreadCount(); 
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    } else if (onNotificationClicked) { 
        onNotificationClicked(notification._id);
    }
  };


  return (
    <li className={`border-b border-gray-600 last:border-b-0 ${!notification.read ? 'bg-sky-900 hover:bg-sky-800' : 'hover:bg-gray-600'}`}>
      <button
        onClick={handleNotificationClick}
        className="w-full text-left px-4 py-3 block focus:outline-none"
      >
        <div className="flex items-start space-x-3">
          <img
            src={notification.sender.profilePicture || `https://ui-avatars.com/api/?name=${notification.sender.username.charAt(0).toUpperCase()}&background=random&color=fff&size=80&font-size=0.33&length=1`}
            alt={notification.sender.displayName || notification.sender.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className={`text-sm ${!notification.read ? 'text-white font-semibold' : 'text-gray-300'}`}>
              {message}
            </p>
            <p className={`text-xs ${!notification.read ? 'text-sky-300' : 'text-gray-500'}`}>
              {formatDate(notification.createdAt)}
            </p>
          </div>
          {!notification.read && (
            <span className="mt-1 flex-shrink-0 w-2.5 h-2.5 bg-sky-400 rounded-full" aria-label="Unread"></span>
          )}
        </div>
      </button>
    </li>
  );
};

export default NotificationItem;