import React, { useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { MentionsInput, Mention } from "react-mentions";
import defaultMentionStyle from "./defaultMentionStyle";
import mentionsInputStyle from "./mentionsInputStyle";

const CreatePost = ({ onPostCreated }) => {
  const { token, user } = useAuth();
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showCodeSection, setShowCodeSection] = useState(false);

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
    if (!content.trim() && !imageFile && !code.trim()) {
      alert("Please add some content, an image, or a code snippet.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("content", content);
    formData.append("tags", tags);
    if (code.trim()) {
      formData.append("codeSnippet[code]", code);
      formData.append(
        "codeSnippet[language]",
        codeLanguage.trim().toLowerCase() || "plaintext",
      );
    }
    if (imageFile) formData.append("postImage", imageFile);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/posts`,
        formData,
        config,
      );
      onPostCreated?.(response.data);
      setSuccessMessage("Post created!");
      setContent("");
      setTags("");
      setCode("");
      setCodeLanguage("");
      setImageFile(null);
      setImagePreview("");
      setShowCodeSection(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (!user) return null;

  const userInitial = user.username
    ? user.username.charAt(0).toUpperCase()
    : "U";
  const userPic =
    user.profilePicture ||
    `https://ui-avatars.com/api/?name=${userInitial}&background=1c1c21&color=b9f43d&size=80&font-size=0.4&length=1`;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        marginBottom: "1.5rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <img
          src={userPic}
          alt={user.displayName || user.username}
          className="avatar"
          style={{ width: "36px", height: "36px", flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              marginBottom: "0.1rem",
            }}
          >
            {user.displayName || user.username}
          </p>
          <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
            @{user.username}
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "0.65rem 1rem",
            color: "#f87171",
            fontSize: "0.82rem",
            marginBottom: "0.75rem",
          }}
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          style={{
            background: "rgba(185,244,61,0.08)",
            border: "1px solid rgba(185,244,61,0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "0.65rem 1rem",
            color: "var(--accent-green)",
            fontSize: "0.82rem",
            marginBottom: "0.75rem",
          }}
        >
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
      >
        {/* Content */}
        <div className="mentions-textarea-wrapper">
          <MentionsInput
            value={content}
            onChange={(event, newValue) => {
              setContent(newValue);
              if (error) setError("");
            }}
            placeholder={`What's on your mind, ${user.displayName || user.username}? Use @ to mention...`}
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

        {/* Image preview */}
        {imagePreview && (
          <div style={{ position: "relative" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "300px",
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
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Code Section */}
        {showCodeSection && (
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Code Snippet
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCodeSection(false);
                  setCode("");
                  setCodeLanguage("");
                }}
                className="btn-ghost"
                style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
              >
                Remove
              </button>
            </div>
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
              rows="6"
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
        )}

        {/* Tags */}
        <div>
          <label className="input-label">Tags (comma-separated)</label>
          <input
            type="text"
            className="input-field"
            placeholder="react, nodejs, algorithms..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ fontSize: "0.85rem" }}
          />
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {/* Image upload */}
            <label
              htmlFor="image-upload"
              className="btn-ghost"
              style={{ cursor: "pointer" }}
              title="Add image"
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/png,image/jpeg,image/gif"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            {/* Code toggle */}
            {!showCodeSection && (
              <button
                type="button"
                onClick={() => setShowCodeSection(true)}
                className="btn-ghost"
                title="Add code snippet"
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Code
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
