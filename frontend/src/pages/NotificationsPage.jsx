import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import NotificationItem from "../components/NotificationItem";
import Pagination from "../components/Pagination";

const NotificationsPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(
          `${API_BASE_URL}/notifications?page=${page}&limit=15`,
          config,
        );
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load notifications.",
        );
      } finally {
        setLoading(false);
      }
    },
    [token, API_BASE_URL],
  );

  useEffect(() => {
    if (token) fetchNotifications(1);
  }, [token, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        config,
      );
      fetchNotifications(pagination.currentPage);
    } catch {
      alert("Could not mark all as read.");
    }
  };

  const handleItemMarkedAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "50vh",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            border: "2px solid var(--border-subtle)",
            borderTop: "2px solid var(--accent-green)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#f87171" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "0.2rem",
            }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary"
            style={{ padding: "0.45rem 1.1rem", fontSize: "0.8rem" }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {notifications.length > 0 ? (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {notifications.map((notif, i) => (
            <div
              key={notif._id}
              style={{
                borderBottom:
                  i < notifications.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
              }}
            >
              <NotificationItem
                notification={notif}
                onMarkedAsRead={handleItemMarkedAsRead}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border-card)",
            borderRadius: "var(--radius-xl)",
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-dim)",
          }}
        >
          <p style={{ fontSize: "0.95rem" }}>You're all caught up!</p>
          <p
            style={{
              fontSize: "0.82rem",
              marginTop: "0.4rem",
              color: "var(--text-dim)",
            }}
          >
            No new notifications.
          </p>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={{ marginTop: "1.5rem" }}>
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
