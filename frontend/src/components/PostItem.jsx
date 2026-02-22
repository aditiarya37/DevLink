import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CommentItem from "./CommentItem";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaExternalLinkAlt } from "react-icons/fa";

const PostItem = ({ post: initialPost, onEdit, onDelete }) => {
  const { user: currentUser, isAuthenticated, token } = useAuth();

  const [post, setPost] = useState(initialPost);
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeInProgress, setLikeInProgress] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [commentsFetched, setCommentsFetched] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (initialPost) {
      setPost(initialPost);
      if (isAuthenticated && currentUser && Array.isArray(initialPost.likes)) {
        setIsLikedByCurrentUser(
          initialPost.likes.some(
            (like) =>
              like === currentUser._id ||
              (like &&
                typeof like === "object" &&
                like._id === currentUser._id),
          ),
        );
      } else {
        setIsLikedByCurrentUser(false);
      }
      setLikeCount(initialPost.likeCount || 0);
    }
  }, [initialPost, isAuthenticated, currentUser]);

  const fetchTopLevelComments = useCallback(async () => {
    if (!post?._id) return;
    setLoadingComments(true);
    setCommentError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts/${post._id}/comments`,
      );
      setComments(response.data.comments || []);
      setCommentsFetched(true);
    } catch (err) {
      setCommentError(
        err.response?.data?.message || "Could not load comments.",
      );
      setComments([]);
      setCommentsFetched(true);
    } finally {
      setLoadingComments(false);
    }
  }, [post?._id, API_BASE_URL]);

  useEffect(() => {
    if (showComments && post?._id && !commentsFetched && !loadingComments) {
      fetchTopLevelComments();
    }
  }, [
    showComments,
    post?._id,
    commentsFetched,
    loadingComments,
    fetchTopLevelComments,
  ]);

  const handleToggleComments = () => {
    setShowComments((prev) => {
      if (prev) setCommentsFetched(false);
      return !prev;
    });
  };

  const handleAddCommentOrReply = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !isAuthenticated || !token) return;
    setIsSubmittingComment(true);
    setCommentError("");
    try {
      const payload = { text: newCommentText };
      if (replyingToComment) payload.parentCommentId = replyingToComment._id;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${API_BASE_URL}/posts/${post._id}/comments`,
        payload,
        config,
      );
      if (replyingToComment) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === replyingToComment._id
              ? { ...c, replyCount: (c.replyCount || 0) + 1 }
              : c,
          ),
        );
      } else {
        setComments((prev) => [response.data, ...prev]);
      }
      setNewCommentText("");
      setReplyingToComment(null);
      setPost((prev) => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1,
      }));
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to post.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSetReplyToComment = (parentComment) => {
    setReplyingToComment(parentComment);
    setNewCommentText("");
    document.getElementById(`comment-textarea-${post._id}`)?.focus();
  };

  const handleDeleteCommentForPostItem = async (
    commentId,
    postIdToDeleteFrom,
  ) => {
    if (!isAuthenticated || !token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${API_BASE_URL}/posts/${postIdToDeleteFrom}/comments/${commentId}`,
        config,
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((prev) => ({
        ...prev,
        commentCount: Math.max(0, (prev.commentCount || 1) - 1),
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated || !token || likeInProgress) return;
    setLikeInProgress(true);
    const originallyLiked = isLikedByCurrentUser;
    const originalLikeCount = likeCount;
    setIsLikedByCurrentUser(!originallyLiked);
    setLikeCount(
      originallyLiked ? originalLikeCount - 1 : originalLikeCount + 1,
    );
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(
        `${API_BASE_URL}/posts/${post._id}/like`,
        {},
        config,
      );
      setIsLikedByCurrentUser(response.data.isLikedByCurrentUser);
      setLikeCount(response.data.likeCount);
      setPost((prev) => ({
        ...prev,
        likes: response.data.likes,
        likeCount: response.data.likeCount,
      }));
    } catch (err) {
      setIsLikedByCurrentUser(originallyLiked);
      setLikeCount(originalLikeCount);
      alert(err.response?.data?.message || "Failed to update like status.");
    } finally {
      setLikeInProgress(false);
    }
  };

  const renderContentWithMentions = (text) => {
    if (!text) return "";
    const mentionRegex = /@@@([\w-]+)@@@/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const startIndex = match.index;
      if (startIndex > lastIndex)
        parts.push(text.substring(lastIndex, startIndex));
      parts.push(
        <Link
          key={`${username}-${startIndex}`}
          to={`/profile/${username.toLowerCase()}`}
          style={{
            color: "var(--accent-green)",
            fontWeight: 600,
            textDecoration: "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          @{username}
        </Link>,
      );
      lastIndex = startIndex + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.map((part, i) => (
      <React.Fragment key={i}>{part}</React.Fragment>
    ));
  };

  if (!post || !post.user) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          marginBottom: "1.25rem",
          border: "1px solid var(--border-card)",
          animation: "pulse 2s infinite",
        }}
      >
        <div
          style={{
            height: "16px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "8px",
            marginBottom: "1rem",
            width: "60%",
          }}
        />
        <div
          style={{
            height: "12px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "6px",
            width: "80%",
          }}
        />
      </div>
    );
  }

  const isAuthor =
    isAuthenticated && currentUser && currentUser._id === post.user._id;
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const userInitial = post.user.username
    ? post.user.username.charAt(0).toUpperCase()
    : "X";
  const authorProfilePic =
    post.user.profilePicture ||
    `https://ui-avatars.com/api/?name=${userInitial}&background=1c1c21&color=b9f43d&size=100&font-size=0.4&length=1`;

  return (
    <div className="post-card">
      {/* Author Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginBottom: "1rem",
          gap: "0.75rem",
        }}
      >
        <Link to={`/profile/${post.user.username.toLowerCase()}`}>
          <img
            src={authorProfilePic}
            alt={post.user.displayName || post.user.username}
            className="avatar"
            style={{ width: "40px", height: "40px", flexShrink: 0 }}
          />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            to={`/profile/${post.user.username.toLowerCase()}`}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "var(--text-primary)",
              textDecoration: "none",
              display: "block",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent-green)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
          >
            {post.user.displayName || post.user.username}
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              @{post.user.username.toLowerCase()}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              ·
            </span>
            <Link
              to={`/posts/${post._id}`}
              style={{
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-dim)")
              }
            >
              {formatDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {isAuthor && (
          <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
            <button
              onClick={() => onEdit && onEdit(post)}
              className="btn-ghost"
              style={{ fontSize: "0.75rem" }}
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm("Delete this post?"))
                  onDelete && onDelete(post._id);
              }}
              className="btn-danger"
              style={{ fontSize: "0.75rem" }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            wordBreak: "break-words",
            marginBottom: "1rem",
          }}
        >
          {renderContentWithMentions(post.content)}
        </p>
      )}

      {/* Image */}
      {post.mediaUrl && (
        <div
          style={{
            marginBottom: "1rem",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <Link to={`/posts/${post._id}`}>
            <img
              src={post.mediaUrl}
              alt="Post media"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "480px",
                objectFit: "cover",
                display: "block",
                transition: "opacity 200ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            />
          </Link>
        </div>
      )}

      {/* Link Preview */}
      {post.linkPreview?.url && post.linkPreview?.title && (
        <a
          href={post.linkPreview.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{
            display: "block",
            marginBottom: "1rem",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            textDecoration: "none",
            transition: "border-color 200ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-card)")
          }
        >
          {post.linkPreview.image && (
            <img
              src={post.linkPreview.image}
              alt={post.linkPreview.title || "Link preview"}
              style={{
                width: "100%",
                height: "160px",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {post.linkPreview.siteName && (
              <p
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.25rem",
                }}
              >
                {post.linkPreview.siteName}
              </p>
            )}
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "var(--accent-green)",
                marginBottom: "0.25rem",
              }}
            >
              {post.linkPreview.title}
            </h3>
            {post.linkPreview.description && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {post.linkPreview.description}
              </p>
            )}
            <p
              style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <FaExternalLinkAlt
                style={{ width: "10px", height: "10px", flexShrink: 0 }}
              />
              {post.linkPreview.url}
            </p>
          </div>
        </a>
      )}

      {/* Code Snippet */}
      {post.codeSnippet?.code && (
        <div
          style={{
            marginBottom: "1rem",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="code-header">
            <div className="code-lang-dot" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                letterSpacing: "0.04em",
              }}
            >
              {post.codeSnippet.language
                ? post.codeSnippet.language.charAt(0).toUpperCase() +
                  post.codeSnippet.language.slice(1)
                : "Code"}
            </span>
          </div>
          <SyntaxHighlighter
            language={post.codeSnippet.language || "plaintext"}
            style={dracula}
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.8rem",
              background: "rgba(10,10,13,0.8)",
              borderRadius: "0 0 var(--radius-md) var(--radius-md)",
            }}
            wrapLongLines={true}
            showLineNumbers={post.codeSnippet.code.split("\n").length > 1}
          >
            {String(post.codeSnippet.code).trimEnd()}
          </SyntaxHighlighter>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginBottom: "1rem",
            paddingTop: "0.5rem",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
              style={{ textDecoration: "none" }}
            >
              <span className="tag-badge">#{tag}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <button
          onClick={handleLikeToggle}
          disabled={!isAuthenticated || likeInProgress}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: isLikedByCurrentUser
              ? "rgba(239,68,68,0.1)"
              : "transparent",
            border: isLikedByCurrentUser
              ? "1px solid rgba(239,68,68,0.2)"
              : "1px solid transparent",
            borderRadius: "999px",
            padding: "0.4rem 0.85rem",
            cursor: isAuthenticated ? "pointer" : "not-allowed",
            color: isLikedByCurrentUser ? "#f87171" : "var(--text-muted)",
            fontSize: "0.8rem",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            transition: "all 200ms",
            opacity: !isAuthenticated ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (isAuthenticated) {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#f87171";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLikedByCurrentUser) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
        >
          <HeartIcon filled={isLikedByCurrentUser} />
          {likeCount}
        </button>

        <button
          onClick={handleToggleComments}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: showComments ? "rgba(185,244,61,0.08)" : "transparent",
            border: showComments
              ? "1px solid rgba(185,244,61,0.15)"
              : "1px solid transparent",
            borderRadius: "999px",
            padding: "0.4rem 0.85rem",
            cursor: "pointer",
            color: showComments ? "var(--accent-green)" : "var(--text-muted)",
            fontSize: "0.8rem",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            transition: "all 200ms",
          }}
          onMouseEnter={(e) => {
            if (!showComments) {
              e.currentTarget.style.background = "rgba(185,244,61,0.06)";
              e.currentTarget.style.color = "var(--accent-green)";
            }
          }}
          onMouseLeave={(e) => {
            if (!showComments) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }
          }}
        >
          <CommentIcon />
          {post.commentCount || 0}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div
          style={{
            marginTop: "1.25rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {isAuthenticated && (
            <form
              onSubmit={handleAddCommentOrReply}
              style={{
                marginBottom: "1.25rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
            >
              <img
                src={
                  currentUser.profilePicture ||
                  `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0).toUpperCase()}&background=1c1c21&color=b9f43d&size=80&font-size=0.4&length=1`
                }
                alt={currentUser.displayName || currentUser.username}
                className="avatar"
                style={{ width: "32px", height: "32px", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  id={`comment-textarea-${post._id}`}
                  rows="2"
                  className="input-field"
                  style={{ resize: "none", fontSize: "0.85rem" }}
                  placeholder={
                    replyingToComment
                      ? `Replying to @${replyingToComment.user.username}...`
                      : "Write a comment..."
                  }
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  required
                />
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  {replyingToComment && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToComment(null);
                        setNewCommentText("");
                      }}
                      className="btn-ghost"
                      style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
                    >
                      Cancel Reply
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newCommentText.trim()}
                    className="btn-primary"
                    style={{ padding: "0.35rem 1rem", fontSize: "0.78rem" }}
                  >
                    {isSubmittingComment
                      ? "Posting..."
                      : replyingToComment
                        ? "Reply"
                        : "Comment"}
                  </button>
                </div>
                {commentError && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#f87171",
                      marginTop: "0.3rem",
                    }}
                  >
                    {commentError}
                  </p>
                )}
              </div>
            </form>
          )}

          {loadingComments && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                textAlign: "center",
                padding: "1rem 0",
              }}
            >
              Loading comments...
            </p>
          )}

          {!loadingComments &&
            commentsFetched &&
            comments.length === 0 &&
            !commentError && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "0.75rem 0",
                }}
              >
                No comments yet. Be the first!
              </p>
            )}

          {!loadingComments && comments.length > 0 && (
            <div>
              {comments.map((topLevelComment) => (
                <CommentItem
                  key={topLevelComment._id}
                  comment={topLevelComment}
                  postId={post._id}
                  onDeleteComment={handleDeleteCommentForPostItem}
                  onEditComment={() => {}}
                  onReplyToComment={handleSetReplyToComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HeartIcon = ({ filled }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 20 20"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      fillRule="evenodd"
      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
      clipRule="evenodd"
    />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z"
      clipRule="evenodd"
    />
  </svg>
);

export default PostItem;
