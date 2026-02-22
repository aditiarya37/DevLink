import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import EditCommentModal from "./EditCommentModal";

const MAX_COMMENT_DEPTH = 5;

const CommentItem = ({
  comment: initialComment,
  postId,
  onDeleteComment,
  onReplyToComment,
}) => {
  const { user: currentUser, isAuthenticated, token } = useAuth();
  const [comment, setComment] = useState(initialComment);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [isEditingComment, setIsEditingComment] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  const isAuthor =
    isAuthenticated && currentUser && currentUser._id === comment.user?._id;
  const isDeletedPlaceholder = comment.status === "deleted";

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete this comment?")) {
      onDeleteComment?.(comment._id, postId);
    }
  };

  const fetchReplies = useCallback(async () => {
    if (!comment?._id || !postId) return;
    setLoadingReplies(true);
    setReplyError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts/${postId}/comments/${comment._id}/replies`,
      );
      setReplies(response.data.replies || []);
    } catch (err) {
      setReplyError(err.response?.data?.message || "Could not load replies.");
    } finally {
      setLoadingReplies(false);
    }
  }, [comment?._id, postId, API_BASE_URL]);

  useEffect(() => {
    if (
      showReplies &&
      comment.replyCount > 0 &&
      replies.length === 0 &&
      !loadingReplies
    ) {
      fetchReplies();
    }
  }, [
    showReplies,
    comment?.replyCount,
    replies.length,
    loadingReplies,
    fetchReplies,
  ]);

  const handleDeleteChildReply = (replyId) => {
    setReplies((prev) => prev.filter((r) => r._id !== replyId));
    setComment((prev) => ({
      ...prev,
      replyCount: Math.max(0, (prev.replyCount || 1) - 1),
    }));
  };

  if (!comment) return null;

  const authorDisplayName = comment.user
    ? comment.user.displayName || comment.user.username
    : "[deleted user]";
  const authorUsername = comment.user
    ? comment.user.username.toLowerCase()
    : "deleted";
  const authorProfilePic = comment.user
    ? comment.user.profilePicture ||
      `https://ui-avatars.com/api/?name=${comment.user.username.charAt(0).toUpperCase()}&background=1c1c21&color=b9f43d&size=80&font-size=0.4&length=1`
    : `https://ui-avatars.com/api/?name=X&background=1c1c21&color=8a8a94&size=80`;

  const depthPad = Math.min((comment.depth || 0) * 20, 60);

  return (
    <>
      <div
        style={{
          paddingLeft: `${depthPad}px`,
          paddingTop: "0.75rem",
          paddingBottom: "0.75rem",
          borderLeft:
            comment.depth > 0 ? "1px solid var(--border-subtle)" : "none",
          marginLeft: comment.depth > 0 ? "20px" : "0",
        }}
      >
        <div
          style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}
        >
          {!isDeletedPlaceholder && comment.user ? (
            <Link to={`/profile/${authorUsername}`}>
              <img
                src={authorProfilePic}
                alt={authorDisplayName}
                className="avatar"
                style={{ width: "28px", height: "28px", flexShrink: 0 }}
              />
            </Link>
          ) : (
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--bg-card-hover)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                flexShrink: 0,
              }}
            >
              X
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.25rem",
                marginBottom: "0.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {!isDeletedPlaceholder && comment.user ? (
                  <Link
                    to={`/profile/${authorUsername}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--accent-green)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-primary)")
                    }
                  >
                    {authorDisplayName}
                  </Link>
                ) : (
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-dim)",
                      fontStyle: "italic",
                    }}
                  >
                    {authorDisplayName}
                  </span>
                )}
                <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              {!isDeletedPlaceholder && isAuthor && (
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    onClick={() => setIsEditingComment(true)}
                    className="btn-ghost"
                    style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-danger"
                    style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Comment Text */}
            <p
              style={{
                fontSize: "0.85rem",
                lineHeight: 1.55,
                whiteSpace: "pre-wrap",
                wordBreak: "break-words",
                color: isDeletedPlaceholder
                  ? "var(--text-dim)"
                  : "var(--text-secondary)",
                fontStyle: isDeletedPlaceholder ? "italic" : "normal",
                marginBottom: "0.4rem",
              }}
            >
              {comment.text}
            </p>

            {/* Actions */}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              {!isDeletedPlaceholder &&
                isAuthenticated &&
                (comment.depth || 0) < MAX_COMMENT_DEPTH && (
                  <button
                    onClick={() => onReplyToComment(comment)}
                    className="btn-ghost"
                    style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem" }}
                  >
                    Reply
                  </button>
                )}
              {comment.replyCount > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="btn-ghost"
                  style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem" }}
                >
                  {showReplies ? "↑ Hide" : "↓ View"} {comment.replyCount}{" "}
                  {comment.replyCount === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {showReplies && (
          <div style={{ marginTop: "0.5rem" }}>
            {loadingReplies && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  paddingLeft: "2.5rem",
                }}
              >
                Loading replies...
              </p>
            )}
            {replyError && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#f87171",
                  paddingLeft: "2.5rem",
                }}
              >
                {replyError}
              </p>
            )}
            {!loadingReplies &&
              replies.length > 0 &&
              replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  onDeleteComment={handleDeleteChildReply}
                  onReplyToComment={onReplyToComment}
                />
              ))}
          </div>
        )}
      </div>

      {isEditingComment && (
        <EditCommentModal
          commentToEdit={comment}
          postId={postId}
          onClose={() => setIsEditingComment(false)}
          onCommentUpdated={(updated) => setComment(updated)}
        />
      )}
    </>
  );
};

export default CommentItem;
