import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import NotificationItem from './NotificationItem';
import { Link } from 'react-router-dom';

const NotificationList = ({ closeDropdown }) => {
  const { token, updateUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (!token) {
        setLoading(false);
        return;
    }
    setLoading(pageNum === 1); 
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_BASE_URL}/notifications?page=${pageNum}&limit=7`, config);
      
      if (pageNum === 1) {
        setNotifications(response.data.notifications || []);
      } else {
      }
      updateUnreadCount(response.data.unreadCount || 0);
      setHasMore((response.data.notifications || []).length === 7 && response.data.totalPages > pageNum);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, updateUnreadCount]);

  useEffect(() => {
    fetchNotifications(1); 
  }, [fetchNotifications]);

  const handleNotificationItemClicked = (notificationId) => {
    setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
    );
    if(closeDropdown) closeDropdown();
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, config);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        updateUnreadCount(0);
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        alert("Failed to mark all as read.");
    }
  };

  if (loading && notifications.length === 0) {
    return <div className="p-4 text-sm text-gray-400 text-center">Loading notifications...</div>;
  }
  if (error) {
    return <div className="p-4 text-sm text-red-400 text-center">{error}</div>;
  }
  if (!loading && notifications.length === 0) {
    return <div className="p-4 text-sm text-gray-400 text-center">No new notifications.</div>;
  }

  return (
    <>
      <div className="max-h-80 overflow-y-auto" role="none">
        <ul>
          {notifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onNotificationClicked={handleNotificationItemClicked}
            />
          ))}
        </ul>
      </div>
       {notifications.some(n => !n.read) && ( 
        <div className="px-4 py-2 border-t border-gray-600 text-center block" role="none">
            <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-sky-400 hover:underline"
            >
                Mark all as read
            </button>
        </div>
       )}
    </>
  );
};

export default NotificationList;