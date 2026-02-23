import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const EditCommentModal = ({
  commentToEdit,
  postId,
  onClose,
  onCommentUpdated,
}) => {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (commentToEdit)
      setText(commentToEdit.text || commentToEdit.content || "");
  }, [commentToEdit]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Comment text cannot be empty.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        `${API_BASE_URL}/posts/${postId}/comments/${commentToEdit._id}`,
        { text },
        config,
      );
      onCommentUpdated?.(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update comment.");
    } finally {
      setLoading(false);
    }
  };

  if (!commentToEdit) return null;

  return (
    /* Fixed, perfectly centered, always visible */
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        animation: "overlayIn 0.2s ease both",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          width: "100%",
          maxWidth: "480px",
          animation: "modalIn 0.35s var(--ease-expo) both",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Edit Comment
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "var(--text-muted)",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              transition: "background 200ms, color 200ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "0.65rem 1rem",
                color: "#f87171",
                fontSize: "0.82rem",
              }}
            >
              {error}
            </div>
          )}
          <div>
            <label className="input-label">Comment</label>
            <textarea
              rows="4"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError("");
              }}
              required
              className="input-field"
              autoFocus
              style={{
                resize: "vertical",
                fontSize: "0.875rem",
                lineHeight: 1.55,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: "0.55rem 1.25rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: "0.55rem 1.25rem" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommentModal;
