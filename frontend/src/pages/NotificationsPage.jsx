import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import NotificationItem from '../components/NotificationItem';
import Pagination from '../components/Pagination';

const handleNotificationStateUpdate = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      )
    );
};

const NotificationsPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_BASE_URL}/notifications?page=${page}&limit=15`, config);
      
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    if (token) {
      fetchNotifications(1);
    }
  }, [token, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, config);
      
      fetchNotifications(pagination.currentPage);
    } catch (err) {
      alert('Could not mark all as read. Please try again.');
    }
  };
  
  if (loading) {
    return <div className="text-center text-sky-400 p-10">Loading notifications...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-sky-300">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-3 py-1 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md disabled:opacity-50"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(notif => (
            <NotificationItem key={notif._id} notification={notif} onMarkedAsRead={handleNotificationStateUpdate} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <p className="text-gray-400">You have no notifications yet.</p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={fetchNotifications}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;