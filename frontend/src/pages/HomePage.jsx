import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import PostItem from "../components/PostItem";
import EditPostModal from "../components/EditPostModal";

/* ── Circular Drag Carousel ── */
const CircularCarousel = () => {
  const features = [
    {
      icon: "⌘",
      title: "Code Snippets",
      desc: "Syntax-highlighted code sharing",
      color: "#b9f43d",
    },
    {
      icon: "◈",
      title: "Link Previews",
      desc: "Rich previews for any URL",
      color: "#a855f7",
    },
    {
      icon: "◉",
      title: "Image Posts",
      desc: "Visual project showcases",
      color: "#b9f43d",
    },
    {
      icon: "⬡",
      title: "Dev Network",
      desc: "Follow & collaborate",
      color: "#a855f7",
    },
    {
      icon: "◎",
      title: "Tag System",
      desc: "Discover by technology",
      color: "#b9f43d",
    },
    {
      icon: "⊕",
      title: "Mentions",
      desc: "@mention your team",
      color: "#a855f7",
    },
  ];

  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const angle = useRef(0);
  const rafId = useRef(null);
  const lastTime = useRef(0);

  const RADIUS = 260;
  const N = features.length;

  const applyRotation = useCallback(() => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll(".circ-card");
    cards.forEach((card, i) => {
      const theta = (angle.current + (i * 360) / N) * (Math.PI / 180);
      const x = Math.sin(theta) * RADIUS;
      const z = Math.cos(theta) * RADIUS;
      const scale = 0.65 + 0.35 * ((z + RADIUS) / (2 * RADIUS));
      const opacity = 0.3 + 0.7 * ((z + RADIUS) / (2 * RADIUS));
      card.style.transform = `translateX(${x}px) translateZ(${z}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = Math.round(scale * 10);
    });
  }, [N]);

  const inertiaLoop = useCallback(() => {
    if (Math.abs(velocity.current) < 0.01) {
      velocity.current = 0;
      return;
    }
    velocity.current *= 0.94;
    angle.current += velocity.current;
    applyRotation();
    rafId.current = requestAnimationFrame(inertiaLoop);
  }, [applyRotation]);

  useEffect(() => {
    applyRotation();
  }, [applyRotation]);

  const onPointerDown = (e) => {
    cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    velocity.current = 0;
  };

  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastX.current;
    const now = Date.now();
    const dt = now - lastTime.current || 1;
    velocity.current = (dx / dt) * 8;
    angle.current += dx * 0.18;
    lastX.current = e.clientX;
    lastTime.current = now;
    applyRotation();
  };

  const onPointerUp = () => {
    isDragging.current = false;
    rafId.current = requestAnimationFrame(inertiaLoop);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "260px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "900px",
        cursor: "grab",
        userSelect: "none",
        overflow: "hidden",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        ref={trackRef}
        style={{
          position: "relative",
          width: "0",
          height: "0",
          transformStyle: "preserve-3d",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            className="circ-card"
            style={{
              position: "absolute",
              width: "160px",
              background: "var(--bg-card)",
              border: `1px solid ${f.color === "#b9f43d" ? "rgba(185,244,61,0.15)" : "rgba(168,85,247,0.15)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "1.25rem 1rem",
              textAlign: "center",
              transform: "translateX(0) translateZ(0)",
              transition: "none",
              pointerEvents: "none",
              left: "-80px",
              top: "-70px",
            }}
          >
            <div
              style={{
                fontSize: "1.6rem",
                marginBottom: "0.5rem",
                color: f.color,
              }}
            >
              {f.icon}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                marginBottom: "0.3rem",
              }}
            >
              {f.title}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                lineHeight: 1.4,
              }}
            >
              {f.desc}
            </div>
          </div>
        ))}
      </div>
      {/* Drag label */}
      <div
        style={{
          position: "absolute",
          bottom: "0.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "999px",
          padding: "0.25rem 0.75rem",
          fontSize: "0.7rem",
          color: "var(--text-dim)",
          fontFamily: "var(--font-body)",
          pointerEvents: "none",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        Drag
      </div>
    </div>
  );
};

/* ── Feature Card (Landing) ── */
const FeatureCard = ({ icon, title, desc, color, delay = 0 }) => (
  <div
    className="card animate-stagger"
    style={{
      padding: "1.75rem",
      animationDelay: `${delay}s`,
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        background:
          color === "green" ? "rgba(185,244,61,0.1)" : "rgba(168,85,247,0.1)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.1rem",
        color:
          color === "green" ? "var(--accent-green)" : "var(--accent-purple)",
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "1.05rem",
        color: "var(--text-primary)",
        marginBottom: "0.5rem",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontSize: "0.875rem",
        color: "var(--text-muted)",
        lineHeight: 1.6,
      }}
    >
      {desc}
    </p>
  </div>
);

/* ── Main HomePage ── */
const HomePage = () => {
  const { isAuthenticated, user, loading: authLoading, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [editingPost, setEditingPost] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPosts = useCallback(
    async (pageNum = 1) => {
      setLoadingPosts(true);
      setPostsError("");
      try {
        const url = isAuthenticated
          ? `${API_BASE_URL}/posts?pageNumber=${pageNum}`
          : `${API_BASE_URL}/posts/global?pageNumber=${pageNum}`;
        const response = await axios.get(url);
        setPosts(response.data.posts || []);
      } catch (err) {
        setPostsError(err.response?.data?.message || "Could not load posts.");
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    },
    [API_BASE_URL, isAuthenticated],
  );

  useEffect(() => {
    if (!authLoading) fetchPosts();
    else {
      setPosts([]);
      setLoadingPosts(true);
    }
  }, [authLoading, fetchPosts]);

  const handlePostCreated = (newPost) => {
    if (isAuthenticated) setPosts((prev) => [newPost, ...prev]);
    else fetchPosts();
  };

  const handlePostDelete = async (postId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, config);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  const handleOpenEditModal = (post) => setEditingPost(post);
  const handleCloseEditModal = () => setEditingPost(null);
  const handlePostUpdated = (updatedPost) =>
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
    );

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "2px solid var(--border-subtle)",
            borderTop: "2px solid var(--accent-green)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-muted)",
            fontSize: "0.9rem",
          }}
        >
          Loading DevLink...
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* ══════════════════ HERO — UNAUTHENTICATED ══════════════════ */}
      {!isAuthenticated && (
        <>
          {/* Hero Section */}
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "5rem 1.5rem 4rem",
              textAlign: "center",
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(185,244,61,0.07) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                maxWidth: "820px",
                margin: "0 auto",
              }}
            >
              {/* NEW BADGE */}
              <div
                className="animate-stagger"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.25)",
                  borderRadius: "999px",
                  padding: "0.3rem 0.9rem 0.3rem 0.5rem",
                  marginBottom: "2rem",
                }}
              >
                <span
                  style={{
                    background: "var(--accent-purple)",
                    color: "white",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    padding: "0.1rem 0.5rem",
                    borderRadius: "999px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  NEW
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                  }}
                >
                  The developer platform you've been waiting for
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className="hero-display animate-stagger-1"
                style={{
                  fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                  marginBottom: "1.5rem",
                }}
              >
                DevLink{" "}
                <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>
                  *
                </span>
                <br />
                <span className="text-gradient-green">Built to Flex</span>
              </h1>

              <p
                className="animate-stagger-2"
                style={{
                  fontSize: "1.1rem",
                  color: "var(--text-muted)",
                  maxWidth: "520px",
                  margin: "0 auto 2.5rem",
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                Where developers connect, share code, and build the future
                together. Post, collaborate, and grow your network.
              </p>

              {/* CTAs */}
              <div
                className="animate-stagger-3"
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: "4rem",
                }}
              >
                <Link
                  to="/register"
                  className="btn-primary"
                  style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary"
                  style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}
                >
                  Sign In
                </Link>
              </div>

              {/* Circular Drag Carousel */}
              <div className="animate-stagger-4">
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    color: "var(--text-dim)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "1.5rem",
                  }}
                >
                  Everything developers need
                </p>
                <CircularCarousel />
              </div>
            </div>
          </section>

          {/* Feature Grid */}
          <section
            style={{
              padding: "3rem 1.5rem 5rem",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem",
                color: "var(--text-dim)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Core Features
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1rem",
              }}
            >
              <FeatureCard
                color="green"
                delay={0}
                icon={
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                }
                title="Code Snippets"
                desc="Post code with full syntax highlighting across 20+ languages. Get peer feedback instantly."
              />
              <FeatureCard
                color="purple"
                delay={0.1}
                icon={
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                title="Dev Network"
                desc="Follow developers, discover talent, and find collaborators for your next project."
              />
              <FeatureCard
                color="green"
                delay={0.2}
                icon={
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
                title="Smart Feed"
                desc="Personalized feed based on who you follow, with tags and trending topics surfaced."
              />
            </div>
          </section>

          {/* Global Feed divider */}
          <div
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              padding: "0 1.25rem 1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <hr
                style={{
                  flex: 1,
                  border: "none",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Live Activity
              </span>
              <hr
                style={{
                  flex: 1,
                  border: "none",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ══════════════════ AUTHENTICATED HEADER ══════════════════ */}
      {isAuthenticated && user && (
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            padding: "2rem 1.25rem 0",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1.8rem",
                color: "var(--text-primary)",
                marginBottom: "0.25rem",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back,{" "}
              <span style={{ color: "var(--accent-green)" }}>
                {user.displayName || user.username}
              </span>
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              What's on your mind today?
            </p>
          </div>
          <CreatePost onPostCreated={handlePostCreated} />
        </div>
      )}

      {/* ══════════════════ POSTS FEED ══════════════════ */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: isAuthenticated ? "1.5rem 1.25rem 4rem" : "0 1.25rem 4rem",
        }}
      >
        {/* Feed Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.25rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.15rem",
              color: "var(--text-primary)",
            }}
          >
            {isAuthenticated ? "Your Feed" : "Recent Activity"}
          </h2>
          {!isAuthenticated && (
            <span
              style={{
                background: "rgba(185,244,61,0.08)",
                color: "var(--accent-green)",
                fontSize: "0.68rem",
                fontWeight: 600,
                fontFamily: "var(--font-display)",
                padding: "0.2rem 0.65rem",
                borderRadius: "999px",
                border: "1px solid rgba(185,244,61,0.15)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Global
            </span>
          )}
        </div>

        {/* Loading */}
        {loadingPosts && (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
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

        {/* Error */}
        {postsError && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "1rem 1.25rem",
              color: "#f87171",
              fontSize: "0.875rem",
              textAlign: "center",
            }}
          >
            {postsError}
          </div>
        )}

        {/* Empty */}
        {!loadingPosts && !postsError && posts.length === 0 && (
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px dashed var(--border-card)",
              borderRadius: "var(--radius-lg)",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--text-muted)",
                marginBottom: "1rem",
              }}
            >
              {isAuthenticated
                ? "Your feed is quiet. Follow developers or create your first post!"
                : "No recent activity yet. Be the first!"}
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="btn-primary"
                style={{ display: "inline-flex", padding: "0.6rem 1.5rem" }}
              >
                Join DevLink
              </Link>
            )}
          </div>
        )}

        {/* Posts */}
        {!loadingPosts && !postsError && posts.length > 0 && (
          <div>
            {posts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onEdit={handleOpenEditModal}
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={handleCloseEditModal}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default HomePage;
