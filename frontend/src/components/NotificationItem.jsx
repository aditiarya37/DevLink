import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const NotificationItem = ({ notification, onMarkedAsRead }) => {
  const { token, decrementUnreadCount } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (!notification || !notification.sender) {
    return null;
  }

  const handleClick = () => {
    if (!notification.read && token) {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      axios.patch(`${API_BASE_URL}/notifications/${notification._id}/read`, {}, config)
        .then(() => {
          decrementUnreadCount();
          if (onMarkedAsRead) {
            onMarkedAsRead(notification._id);
          }
        })
        .catch(err => console.error('Failed to mark notification as read:', err));
    }

    const linkDestination = getLinkDestination();
    if (linkDestination && linkDestination !== '#') {
      navigate(linkDestination);
    }
  };

  const getNotificationMessage = () => {
    const sender = notification.sender.displayName || notification.sender.username;
    switch (notification.type) {
      case 'follow': return <><span className="font-bold">{sender}</span> started following you.</>;
      case 'like_post': return <><span className="font-bold">{sender}</span> liked your post.</>;
      case 'comment_post': return <><span className="font-bold">{sender}</span> commented on your post.</>;
      case 'reply_comment': return <><span className="font-bold">{sender}</span> replied to your comment.</>;
      default: return <><span className="font-bold">{sender}</span> mentioned you.</>;
    }
  };

  const getLinkDestination = () => {
    if (notification.type === 'follow') return `/profile/${notification.sender.username}`;
    if (notification.post?._id) return `/posts/${notification.post._id}`;
    return '#';
  };

  const wrapperClasses = `
    flex items-center p-4 rounded-lg transition-colors duration-200 w-full text-left
    ${notification.read ? 'bg-gray-800' : 'bg-sky-900/50'}
    hover:bg-sky-800/60 cursor-pointer
  `;

  return (
    <div> 
      <button onClick={handleClick} className={wrapperClasses}>
        <img
          src={notification.sender.profilePicture || `https://ui-avatars.com/api/?name=${notification.sender.username.charAt(0)}`}
          alt={notification.sender.username}
          className="w-10 h-10 rounded-full object-cover mr-4 flex-shrink-0"
        />
        <div className="flex-grow">
          <p className="text-gray-200">{getNotificationMessage()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <span className="w-2.5 h-2.5 bg-sky-400 rounded-full ml-3 flex-shrink-0" aria-label="Unread"></span>
        )}
      </button>
    </div>
  );
};

export default NotificationItem;