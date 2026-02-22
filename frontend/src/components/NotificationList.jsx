import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import NotificationItem from "./NotificationItem";

const NotificationList = ({ closeDropdown }) => {
  const { token, updateUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${API_BASE_URL}/notifications?page=1&limit=7`,
        config,
      );
      setNotifications(response.data.notifications || []);
      updateUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, updateUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationItemClicked = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
    );
    closeDropdown?.();
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, config);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      updateUnreadCount(0);
    } catch {
      alert("Failed to mark all as read.");
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div
        style={{
          padding: "1.5rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.82rem",
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "1.5rem",
          textAlign: "center",
          color: "#f87171",
          fontSize: "0.82rem",
        }}
      >
        {error}
      </div>
    );
  }

  if (!loading && notifications.length === 0) {
    return (
      <div
        style={{
          padding: "1.5rem",
          textAlign: "center",
          color: "var(--text-dim)",
          fontSize: "0.82rem",
        }}
      >
        No new notifications.
      </div>
    );
  }

  return (
    <>
      <div style={{ maxHeight: "320px", overflowY: "auto" }}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkedAsRead={handleNotificationItemClicked}
          />
        ))}
      </div>
      {notifications.some((n) => !n.read) && (
        <div
          style={{
            padding: "0.65rem 1.25rem",
            borderTop: "1px solid var(--border-subtle)",
            textAlign: "center",
          }}
        >
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
              transition: "color 200ms",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent-green)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            Mark all as read
          </button>
        </div>
      )}
    </>
  );
};

export default NotificationList;
