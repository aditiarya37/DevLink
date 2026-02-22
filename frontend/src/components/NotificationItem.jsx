import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const NotificationItem = ({ notification, onMarkedAsRead }) => {
  const { token, decrementUnreadCount } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (!notification || !notification.sender) return null;

  const handleClick = () => {
    if (!notification.read && token) {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      axios
        .patch(
          `${API_BASE_URL}/notifications/${notification._id}/read`,
          {},
          config,
        )
        .then(() => {
          decrementUnreadCount();
          onMarkedAsRead?.(notification._id);
        })
        .catch((err) => console.error("Failed to mark as read:", err));
    }
    const dest = getLinkDestination();
    if (dest && dest !== "#") navigate(dest);
  };

  const getNotificationMessage = () => {
    const sender =
      notification.sender.displayName || notification.sender.username;
    const senderEl = (
      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
        {sender}
      </span>
    );
    switch (notification.type) {
      case "follow":
        return <>{senderEl} started following you.</>;
      case "like_post":
        return <>{senderEl} liked your post.</>;
      case "comment_post":
        return <>{senderEl} commented on your post.</>;
      case "reply_comment":
        return <>{senderEl} replied to your comment.</>;
      default:
        return <>{senderEl} mentioned you.</>;
    }
  };

  const getLinkDestination = () => {
    if (notification.type === "follow")
      return `/profile/${notification.sender.username}`;
    if (notification.post?._id) return `/posts/${notification.post._id}`;
    return "#";
  };

  const senderPic =
    notification.sender.profilePicture ||
    `https://ui-avatars.com/api/?name=${notification.sender.username.charAt(0)}&background=1c1c21&color=b9f43d&size=80`;

  return (
    <div>
      <button
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.85rem 1.25rem",
          width: "100%",
          textAlign: "left",
          background: notification.read
            ? "transparent"
            : "rgba(185,244,61,0.04)",
          border: "none",
          cursor: "pointer",
          transition: "background 200ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = notification.read
            ? "rgba(255,255,255,0.03)"
            : "rgba(185,244,61,0.07)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = notification.read
            ? "transparent"
            : "rgba(185,244,61,0.04)";
        }}
      >
        <img
          src={senderPic}
          alt={notification.sender.username}
          className="avatar"
          style={{ width: "36px", height: "36px", flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {getNotificationMessage()}
          </p>
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-dim)",
              marginTop: "0.2rem",
            }}
          >
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {!notification.read && (
          <span
            style={{
              width: "8px",
              height: "8px",
              background: "var(--accent-green)",
              borderRadius: "50%",
              flexShrink: 0,
              boxShadow: "0 0 6px rgba(185,244,61,0.4)",
            }}
          />
        )}
      </button>
    </div>
  );
};

export default NotificationItem;
