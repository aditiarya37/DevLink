import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import PostItem from "../components/PostItem";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchResults = useCallback(async () => {
    if (!query?.trim()) {
      setError("Please enter a search term.");
      return;
    }
    setLoadingUsers(true);
    setLoadingPosts(true);
    setError("");

    try {
      const userRes = await axios.get(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=6`,
      );
      setUserResults(userRes.data.users || []);
    } catch {
      setError("Failed to fetch user results.");
    } finally {
      setLoadingUsers(false);
    }

    try {
      const postRes = await axios.get(
        `${API_BASE_URL}/posts/search?q=${encodeURIComponent(query)}&limit=10`,
      );
      setPostResults(postRes.data.posts || []);
    } catch {
    } finally {
      setLoadingPosts(false);
    }
  }, [query, API_BASE_URL]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div
      style={{
        maxWidth: "720px",
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
          Search Results
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.75rem",
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          "{query}"
        </h1>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            color: "#f87171",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Users */}
      <section style={{ marginBottom: "2.5rem" }}>
        <SectionHeader label="Developers" count={userResults.length} />
        {loadingUsers && <LoadingDots />}
        {!loadingUsers && userResults.length === 0 && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-dim)",
              fontStyle: "italic",
            }}
          >
            No users found.
          </p>
        )}
        {!loadingUsers && userResults.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {userResults.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user.username.toLowerCase()}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card"
                  style={{ padding: "1.25rem", textAlign: "center" }}
                >
                  <img
                    src={
                      user.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user.username.charAt(0).toUpperCase()}&background=1c1c21&color=b9f43d&size=80`
                    }
                    alt={user.displayName || user.username}
                    className="avatar"
                    style={{
                      width: "52px",
                      height: "52px",
                      margin: "0 auto 0.75rem",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                      marginBottom: "0.2rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.displayName || user.username}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                    @{user.username.toLowerCase()}
                  </p>
                  {user.bio && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        marginTop: "0.5rem",
                        lineHeight: 1.45,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {user.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Posts */}
      <section>
        <SectionHeader label="Posts" count={postResults.length} />
        {loadingPosts && <LoadingDots />}
        {!loadingPosts && postResults.length === 0 && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-dim)",
              fontStyle: "italic",
            }}
          >
            No posts found.
          </p>
        )}
        {!loadingPosts &&
          postResults.length > 0 &&
          postResults.map((post) => <PostItem key={post._id} post={post} />)}
      </section>
    </div>
  );
};

const SectionHeader = ({ label, count }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "1rem",
    }}
  >
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "1rem",
        color: "var(--text-primary)",
        margin: 0,
      }}
    >
      {label}
    </h2>
    {count > 0 && (
      <span
        style={{
          background: "rgba(185,244,61,0.08)",
          color: "var(--accent-green)",
          fontSize: "0.68rem",
          fontWeight: 600,
          padding: "0.15rem 0.5rem",
          borderRadius: "999px",
          border: "1px solid rgba(185,244,61,0.15)",
        }}
      >
        {count}
      </span>
    )}
  </div>
);

const LoadingDots = () => (
  <p
    style={{
      fontSize: "0.85rem",
      color: "var(--text-muted)",
      padding: "0.5rem 0",
    }}
  >
    Searching...
  </p>
);

export default SearchResultsPage;
