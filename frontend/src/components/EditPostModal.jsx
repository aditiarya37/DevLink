import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { MentionsInput, Mention } from "react-mentions";
import defaultMentionStyle from "./defaultMentionStyle";
import mentionsInputStyle from "./mentionsInputStyle";

const EditPostModal = ({ postToEdit, onClose, onPostUpdated }) => {
  const { token, user: currentUser } = useAuth();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [shouldRemoveMedia, setShouldRemoveMedia] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const commonLanguages = [
    "javascript",
    "python",
    "java",
    "csharp",
    "cpp",
    "php",
    "ruby",
    "go",
    "swift",
    "kotlin",
    "typescript",
    "html",
    "css",
    "sql",
    "bash",
    "json",
    "xml",
    "markdown",
    "plaintext",
  ];

  useEffect(() => {
    if (postToEdit) {
      setContent(postToEdit.content || "");
      setTags(postToEdit.tags ? postToEdit.tags.join(", ") : "");
      setCodeLanguage(postToEdit.codeSnippet?.language || "");
      setCode(postToEdit.codeSnippet?.code || "");
      setImagePreview(postToEdit.mediaUrl || "");
      setImageFile(null);
      setShouldRemoveMedia(false);
    }
  }, [postToEdit]);

  // Lock body scroll + Escape to close
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  const fetchUsersForMention = useCallback(
    async (query, callback) => {
      if (!query || query.length < 1) return callback([]);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=5`,
        );
        if (response.data.users) {
          callback(
            response.data.users.map((u) => ({
              id: u.username,
              display: `${u.displayName} (@${u.username})`,
            })),
          );
        } else callback([]);
      } catch {
        callback([]);
      }
    },
    [API_BASE_URL],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("content", content);
    formData.append("tags", tags);
    if (code.trim()) {
      formData.append("codeSnippet[code]", code);
      formData.append(
        "codeSnippet[language]",
        codeLanguage.trim().toLowerCase() || "plaintext",
      );
    } else {
      formData.append("codeSnippet[code]", "");
    }
    if (imageFile) formData.append("postImage", imageFile);
    if (shouldRemoveMedia) formData.append("removeMedia", "true");
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(
        `${API_BASE_URL}/posts/${postToEdit._id}`,
        formData,
        config,
      );
      onPostUpdated(data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while updating the post.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setShouldRemoveMedia(false);
    }
  };

  if (!postToEdit) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--text-primary)",
            }}
          >
            Edit Post
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "var(--text-muted)",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              transition: "background 200ms, color 200ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
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

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: "auto",
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
                padding: "0.75rem 1rem",
                color: "#f87171",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <div className="mentions-textarea-wrapper">
            <MentionsInput
              value={content}
              onChange={(event, newValue) => {
                setContent(newValue);
                if (error) setError("");
              }}
              placeholder={
                currentUser
                  ? `What's on your mind, ${currentUser.displayName || currentUser.username}?`
                  : "Edit post content..."
              }
              style={mentionsInputStyle}
              singleLine={false}
              a11ySuggestionsListLabel="Suggested users to mention"
            >
              <Mention
                trigger="@"
                data={fetchUsersForMention}
                markup="@@@__id__@@@"
                style={defaultMentionStyle}
                displayTransform={(id) => `@${id}`}
                appendSpaceOnAdd={true}
                renderSuggestion={(
                  suggestion,
                  search,
                  highlightedDisplay,
                  index,
                  focused,
                ) => (
                  <div
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: focused
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {highlightedDisplay}
                  </div>
                )}
              />
            </MentionsInput>
          </div>

          {/* Image */}
          {imagePreview && (
            <div style={{ position: "relative" }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "240px",
                  objectFit: "contain",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(0,0,0,0.3)",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                  setShouldRemoveMedia(true);
                }}
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  background: "rgba(0,0,0,0.7)",
                  border: "none",
                  color: "white",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                ×
              </button>
            </div>
          )}
          <div>
            <label
              htmlFor="edit-image-upload"
              className="btn-ghost"
              style={{ cursor: "pointer", display: "inline-flex" }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {postToEdit.mediaUrl || imagePreview
                ? "Replace Image"
                : "Add Image"}
            </label>
            <input
              id="edit-image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {/* Code */}
          <div
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Code Snippet (leave blank to remove)
            </span>
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontSize: "0.82rem",
                padding: "0.4rem 0.75rem",
                outline: "none",
              }}
            >
              <option value="">Select Language</option>
              {commonLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <textarea
              rows="5"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              style={{
                background: "rgba(10,10,13,0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                padding: "0.75rem",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="input-label">Tags (comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, nodejs..."
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              paddingTop: "0.5rem",
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

export default EditPostModal;
