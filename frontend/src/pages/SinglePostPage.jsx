import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PostItem from "../components/PostItem";
import CommentItem from "../components/CommentItem";
import EditPostModal from "../components/EditPostModal";
import { MentionsInput, Mention } from "react-mentions";
import mentionsInputStyle from "../components/mentionsInputStyle";
import defaultMentionStyle from "../components/defaultMentionStyle";

const SinglePostPage = () => {
  const { postId } = useParams();
  const {
    user: currentUser,
    isAuthenticated,
    token,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPostAndComments = useCallback(async () => {
    if (!postId) return;
    setLoadingPost(true);
    setLoadingComments(true);
    setError("");
    try {
      const postRes = await axios.get(`${API_BASE_URL}/posts/${postId}`);
      setPost(postRes.data);
      const commentsRes = await axios.get(
        `${API_BASE_URL}/posts/${postId}/comments`,
      );
      setComments(commentsRes.data.comments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load post details.");
      setPost(null);
      setComments([]);
    } finally {
      setLoadingPost(false);
      setLoadingComments(false);
    }
  }, [postId, API_BASE_URL]);

  const fetchUsers = useCallback(
    (query, callback) => {
      if (!query || !token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      axios
        .get(`${API_BASE_URL}/users/search?q=${query}`, config)
        .then((res) => {
          const users = res.data.map((user) => ({
            id: user._id,
            display: user.displayName || user.username,
          }));
          callback(users);
        })
        .catch((err) =>
          console.error("Could not fetch users for mention:", err),
        );
    },
    [API_BASE_URL, token],
  );

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handlePostDelete = async (idOfPostToDelete) => {
    if (window.confirm("Delete this post?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_BASE_URL}/posts/${idOfPostToDelete}`, config);
        navigate("/");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete post.");
      }
    }
  };

  const handleAddCommentOrReply = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !isAuthenticated || !token) return;
    setIsSubmittingComment(true);
    setError("");
    try {
      const payload = { content: newCommentText };
      if (replyingToComment) payload.parentCommentId = replyingToComment._id;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${API_BASE_URL}/posts/${postId}/comments`,
        payload,
        config,
      );
      if (replyingToComment) {
        setComments((prev) =>
          prev.map((c) =>
            replyingToComment.parentComment === null &&
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
      setError(err.response?.data?.message || "Failed to post comment/reply.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSetReplyToComment = (parentComment) => {
    setReplyingToComment(parentComment);
    setNewCommentText("");
    document.getElementById(`single-post-comment-textarea-${postId}`)?.focus();
  };

  const handleDeleteCommentForPost = async (commentId) => {
    if (!isAuthenticated || !token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${API_BASE_URL}/posts/${postId}/comments/${commentId}`,
        config,
      );
      fetchPostAndComments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment.");
    }
  };

  if (loadingPost || authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
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

  if (error && !post) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#f87171" }}>
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          color: "var(--text-muted)",
        }}
      >
        Post not found.
      </div>
    );
  }

  const userPic =
    currentUser?.profilePicture ||
    (currentUser
      ? `https://ui-avatars.com/api/?name=${currentUser.username.charAt(0).toUpperCase()}&background=1c1c21&color=b9f43d&size=80`
      : "");

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      <PostItem
        post={post}
        onEdit={
          isAuthenticated && currentUser?._id === post.user?._id
            ? setEditingPost
            : undefined
        }
        onDelete={
          isAuthenticated && currentUser?._id === post.user?._id
            ? handlePostDelete
            : undefined
        }
      />

      {/* Comments Section */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--shadow-card)",
          marginTop: "0.25rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--text-primary)",
            marginBottom: "1.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          Comments ({post.commentCount || 0})
        </h2>

        {isAuthenticated && (
          <form
            onSubmit={handleAddCommentOrReply}
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <img
              src={userPic}
              alt={currentUser?.username}
              className="avatar"
              style={{ width: "32px", height: "32px", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div className="mentions-textarea-wrapper">
                <MentionsInput
                  id={`single-post-comment-textarea-${postId}`}
                  value={newCommentText}
                  onChange={(event, newValue) => setNewCommentText(newValue)}
                  placeholder={
                    replyingToComment
                      ? `Replying to @${replyingToComment.user.username}...`
                      : "Add a public comment..."
                  }
                  style={mentionsInputStyle}
                >
                  <Mention
                    trigger="@"
                    data={fetchUsers}
                    style={defaultMentionStyle}
                    markup="@[__display__](user:__id__)"
                    appendSpaceOnAdd={true}
                  />
                </MentionsInput>
              </div>
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
                    ? "Submitting..."
                    : replyingToComment
                      ? "Post Reply"
                      : "Post Comment"}
                </button>
              </div>
              {error && !loadingPost && (
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#f87171",
                    marginTop: "0.3rem",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </form>
        )}

        {loadingComments && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textAlign: "center",
              padding: "1rem 0",
            }}
          >
            Loading comments...
          </p>
        )}

        {!loadingComments && comments.length === 0 && !error && (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-dim)",
              fontStyle: "italic",
              textAlign: "center",
              padding: "1.5rem 0",
            }}
          >
            No comments on this post yet. Be the first!
          </p>
        )}

        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              onDeleteComment={handleDeleteCommentForPost}
              onEditComment={() => {}}
              onReplyToComment={handleSetReplyToComment}
            />
          ))}
        </div>
      </div>

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={(updated) => setPost(updated)}
        />
      )}
    </div>
  );
};

export default SinglePostPage;
