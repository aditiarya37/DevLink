import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostItem from "../components/PostItem";
import EditPostModal from "../components/EditPostModal";
import { useAuth } from "../context/AuthContext";

const TagFeedPage = () => {
  const { tagName } = useParams();
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [editingPost, setEditingPost] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPostsByTag = useCallback(
    async (currentPage = 1) => {
      if (!tagName) return;
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${API_BASE_URL}/posts/tag/${encodeURIComponent(tagName.toLowerCase())}?pageNumber=${currentPage}`,
        );
        setPosts(response.data.posts || []);
        setCount(response.data.count || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            `Could not load posts for #${tagName}.`,
        );
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [tagName, API_BASE_URL],
  );

  useEffect(() => {
    fetchPostsByTag(1);
  }, [fetchPostsByTag]);

  const handlePostDelete = async (postId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setCount((prev) => prev - 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            color: "var(--text-dim)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          Tag Feed
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "var(--accent-purple)" }}>#</span>
            {tagName}
          </h1>
          <span
            style={{
              background: "rgba(168,85,247,0.1)",
              color: "var(--accent-purple)",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.2rem 0.65rem",
              borderRadius: "999px",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            {count} {count === 1 ? "post" : "posts"}
          </span>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              border: "2px solid var(--border-subtle)",
              borderTop: "2px solid var(--accent-green)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 0.75rem",
            }}
          />
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Loading posts...
          </p>
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            color: "#f87171",
            fontSize: "0.875rem",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border-card)",
            borderRadius: "var(--radius-lg)",
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-dim)",
          }}
        >
          No posts tagged with #{tagName} yet.
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              onEdit={setEditingPost}
              onDelete={handlePostDelete}
            />
          ))}
        </div>
      )}

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={(updated) =>
            setPosts((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p)),
            )
          }
        />
      )}
    </div>
  );
};

export default TagFeedPage;
