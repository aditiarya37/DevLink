import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PostItem from "../components/PostItem";
import NotificationList from "../components/NotificationList";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────────────────────────────────────
   INFINITE SCROLL HOOK
───────────────────────────────────────────────────────── */
function useInfiniteScroll(fetchFn) {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loaderRef = useRef(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const seenIds = useRef(new Set());
  const fetchRef = useRef(fetchFn);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  const load = useCallback(async (pageNum) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const newPosts = await fetchRef.current(pageNum);
      if (!newPosts || newPosts.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        const unique = newPosts.filter((p) => !seenIds.current.has(p._id));
        unique.forEach((p) => seenIds.current.add(p._id));
        setPosts((prev) => [...prev, ...unique]);
        if (newPosts.length < 10) {
          hasMoreRef.current = false;
          setHasMore(false);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load posts.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          pageRef.current += 1;
          load(pageRef.current);
        }
      },
      { threshold: 0.1, rootMargin: "300px" },
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [load]);

  return { posts, loading, error, hasMore, loaderRef };
}

/* ─────────────────────────────────────────────────────────
   SCROLL LOADER
───────────────────────────────────────────────────────── */
const ScrollLoader = ({ loading, hasMore, loaderRef }) => (
  <div
    ref={loaderRef}
    style={{ padding: "1.5rem 0 2.5rem", textAlign: "center" }}
  >
    {loading && (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "999px",
          padding: "0.35rem 1rem",
        }}
      >
        <span
          style={{
            width: "13px",
            height: "13px",
            border: "2px solid var(--border-subtle)",
            borderTop: "2px solid var(--accent-green)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.75s linear infinite",
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-body)",
          }}
        >
          Loading more...
        </span>
      </span>
    )}
    {!loading && !hasMore && (
      <p
        style={{
          fontSize: "0.68rem",
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        You've reached the end ✓
      </p>
    )}
  </div>
);

/* ─────────────────────────────────────────────────────────
   LEFT SIDEBAR
───────────────────────────────────────────────────────── */
const LeftSidebar = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
    <div
      style={{
        background:
          "linear-gradient(135deg,rgba(185,244,61,0.09) 0%,rgba(168,85,247,0.06) 100%)",
        border: "1px solid rgba(185,244,61,0.18)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 90,
          height: 90,
          background: "rgba(185,244,61,0.12)",
          borderRadius: "50%",
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          marginBottom: "0.65rem",
        }}
      >
        <span
          style={{
            width: 13,
            height: 13,
            background: "var(--accent-green)",
            borderRadius: 4,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1rem",
            color: "var(--text-primary)",
          }}
        >
          Global Feed
        </span>
      </div>
      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          lineHeight: 1.3,
        }}
      >
        Public posts from the DevLink community
      </p>
    </div>
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.875rem",
          color: "var(--text-primary)",
          marginBottom: "0.9rem",
        }}
      >
        Why DevLink?
      </p>
      {[
        {
          icon: "⌘",
          label: "Post code snippets",
          desc: "Share & get feedback on your work",
        },
        {
          icon: "◈",
          label: "Follow developers",
          desc: "Build your professional network",
        },
        {
          icon: "◉",
          label: "Personalized feed",
          desc: "See posts from people you follow",
        },
      ].map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "0.65rem",
            marginBottom: i < 2 ? "0.75rem" : 0,
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              color: "var(--accent-green)",
              flexShrink: 0,
              lineHeight: 1.4,
            }}
          >
            {p.icon}
          </span>
          <div>
            <div
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {p.label}
            </div>
            <div
              style={{
                fontSize: "0.74rem",
                color: "var(--text-muted)",
                marginTop: "0.08rem",
              }}
            >
              {p.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.875rem",
          color: "var(--text-primary)",
          marginBottom: "0.9rem",
        }}
      >
        Trending Tags
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {["react", "python", "typescript", "nodejs", "golang", "rust"].map(
          (tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.74rem",
                background: "rgba(168,85,247,0.08)",
                color: "var(--accent-purple)",
                border: "1px solid rgba(168,85,247,0.15)",
                borderRadius: "999px",
                padding: "0.22rem 0.6rem",
              }}
            >
              #{tag}
            </span>
          ),
        )}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   RIGHT SIDEBAR
───────────────────────────────────────────────────────── */
const RightSidebar = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.9rem",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: "var(--accent-green)",
            borderRadius: "50%",
            boxShadow: "0 0 8px rgba(185,244,61,0.7)",
            animation: "pulse-green 2s infinite",
            flexShrink: 0,
          }}
        />
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.875rem",
            color: "var(--text-primary)",
          }}
        >
          Live Activity
        </p>
      </div>
      {[
        {
          label: "Developers Online",
          value: "1.2k",
          icon: "◉",
          color: "#b9f43d",
        },
        { label: "Posts Today", value: "342", icon: "◈", color: "#a855f7" },
        { label: "Code Snippets", value: "128", icon: "⌘", color: "#b9f43d" },
        { label: "New Members", value: "89", icon: "⊕", color: "#a855f7" },
      ].map((s, i, arr) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 0",
            borderBottom:
              i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span style={{ color: s.color }}>{s.icon}</span>
            {s.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "var(--text-primary)",
            }}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
    <div
      style={{
        background:
          "linear-gradient(135deg,rgba(168,85,247,0.07) 0%,rgba(185,244,61,0.04) 100%)",
        border: "1px solid rgba(168,85,247,0.15)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.875rem",
          color: "var(--text-primary)",
          marginBottom: "0.9rem",
        }}
      >
        What you unlock
      </p>
      {[
        { icon: "🔥", text: "Code snippet sharing with syntax highlighting" },
        { icon: "⚡", text: "Real-time personalized developer feed" },
        { icon: "🔗", text: "Follow & connect with devs you admire" },
        { icon: "🏷️", text: "Tag-based discovery across 50+ topics" },
        { icon: "💬", text: "Comments, likes & @mentions" },
      ].map((f, i, arr) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.65rem",
            marginBottom: i < arr.length - 1 ? "0.7rem" : 0,
          }}
        >
          <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{f.icon}</span>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {f.text}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────
   BELL ICON
───────────────────────────────────────────────────────── */
const BellIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

/* ─────────────────────────────────────────────────────────
   BACK TO TOP BUTTON
   Appears at top-right when scrolled down, matching the
   pill style of the collapsed navbar.
───────────────────────────────────────────────────────── */
const BackToTopButton = ({ visible }) => {
  const EASE_IN = [0.25, 1, 0.3, 1];
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, x: 30 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: 0.38, ease: EASE_IN },
          }}
          exit={{ opacity: 0, x: 30, transition: { duration: 0.22 } }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed",
            top: "20px",
            right: "24px",
            zIndex: 1000,
            height: "68px",
            padding: "0 1.5rem",
            borderRadius: "34px",
            background: "rgba(13, 13, 16, 0.92)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 36px rgba(0,0,0,0.52)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "background 0.2s, border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(185,244,61,0.1)";
            e.currentTarget.style.borderColor = "rgba(185,244,61,0.35)";
            e.currentTarget.style.color = "var(--accent-green)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(13, 13, 16, 0.92)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          Top
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════
   GLOBAL FEED NAVBAR
═══════════════════════════════════════════════════════════ */
const GlobalFeedNavbar = ({ onScrollChange }) => {
  const { user, isAuthenticated, logout, unreadNotificationCount } = useAuth();
  const navigate = useNavigate();

  const [navState, setNavState] = useState("center");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);
  const wasScrolled = useRef(false);

  const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };
  const EASE_IN = [0.25, 1, 0.3, 1];
  const EASE_OUT = [1.0, 0, 0.2, 1];

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 80;
      if (scrolled && !wasScrolled.current) {
        setNavState("icon");
        setShowNotifDropdown(false);
        onScrollChange?.(true);
      } else if (!scrolled && wasScrolled.current) {
        setNavState("center");
        setShowNotifDropdown(false);
        onScrollChange?.(false);
      }
      wasScrolled.current = scrolled;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScrollChange]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };
  const toggleOpen = () => {
    setNavState((s) => (s === "open" ? "icon" : "open"));
  };

  const isCenter = navState === "center";
  const isScrolled = navState === "icon" || navState === "open";
  const isOpen = navState === "open";

  const mkLink = (isActive) => ({
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: "0.9rem",
    textDecoration: "none",
    padding: "0.45rem 0.85rem",
    borderRadius: "999px",
    transition: "color 200ms, background 200ms",
    whiteSpace: "nowrap",
    display: "block",
    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
    background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
  });

  const navItems =
    isAuthenticated && user
      ? [
          {
            id: "logo",
            node: (
              <Link
                to="/"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0 0.5rem 0 0.25rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "19px",
                    height: "19px",
                    background: "var(--accent-green)",
                    borderRadius: "5px",
                    flexShrink: 0,
                  }}
                />
                DevLink
              </Link>
            ),
          },
          {
            id: "search",
            node: (
              <form onSubmit={handleSearchSubmit} style={{ display: "flex" }}>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "999px",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    padding: "0.4rem 1rem",
                    outline: "none",
                    width: "160px",
                    transition: "border-color 200ms, background 200ms",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(185,244,61,0.3)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-subtle)";
                    e.target.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
              </form>
            ),
          },
          {
            id: "home",
            node: (
              <NavLink to="/" end style={({ isActive }) => mkLink(isActive)}>
                Home
              </NavLink>
            ),
          },
          {
            id: "notifs",
            isDropdown: true,
            node: (
              <div style={{ position: "relative" }} ref={notifRef}>
                <button
                  onClick={() => setShowNotifDropdown((p) => !p)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "0.45rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 200ms",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <BellIcon />
                  {unreadNotificationCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        background: "var(--accent-green)",
                        color: "#0a0a0d",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        borderRadius: "50%",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 2px",
                      }}
                    >
                      {unreadNotificationCount > 9
                        ? "9+"
                        : unreadNotificationCount}
                    </span>
                  )}
                </button>
                {showNotifDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: "calc(100% + 1rem)",
                      width: "360px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-card)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-modal)",
                      overflow: "hidden",
                      animation: "modalIn 0.25s var(--ease-expo) both",
                      zIndex: 9999,
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        Notifications
                      </span>
                      {unreadNotificationCount > 0 && (
                        <span
                          style={{
                            background: "rgba(185,244,61,0.12)",
                            color: "var(--accent-green)",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(185,244,61,0.2)",
                          }}
                        >
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    <NotificationList
                      closeDropdown={() => setShowNotifDropdown(false)}
                    />
                  </div>
                )}
              </div>
            ),
          },
          {
            id: "profile",
            node: (
              <NavLink
                to={
                  user.username
                    ? `/profile/${user.username.toLowerCase()}`
                    : "/profile"
                }
                style={({ isActive }) => mkLink(isActive)}
              >
                {user.displayName || user.username}
              </NavLink>
            ),
          },
          {
            id: "logout",
            node: (
              <button
                onClick={handleLogout}
                style={{
                  ...mkLink(false),
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f87171";
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Logout
              </button>
            ),
          },
        ]
      : [
          {
            id: "logo",
            node: (
              <Link
                to="/"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0 0.5rem 0 0.25rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "19px",
                    height: "19px",
                    background: "var(--accent-green)",
                    borderRadius: "5px",
                    flexShrink: 0,
                  }}
                />
                DevLink
              </Link>
            ),
          },
          {
            id: "search",
            node: (
              <form onSubmit={handleSearchSubmit} style={{ display: "flex" }}>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "999px",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    padding: "0.4rem 1rem",
                    outline: "none",
                    width: "160px",
                    transition: "border-color 200ms, background 200ms",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(185,244,61,0.3)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-subtle)";
                    e.target.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
              </form>
            ),
          },
          {
            id: "feed",
            node: (
              <NavLink to="/feed" style={({ isActive }) => mkLink(isActive)}>
                Feed
              </NavLink>
            ),
          },
          {
            id: "login",
            node: (
              <NavLink to="/login" style={({ isActive }) => mkLink(isActive)}>
                Login
              </NavLink>
            ),
          },
          {
            id: "join",
            node: (
              <Link
                to="/register"
                className="btn-primary"
                style={{
                  padding: "0.45rem 1.25rem",
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-block",
                  borderRadius: "999px",
                }}
              >
                Join
              </Link>
            ),
          },
        ];

  // Exact copy of navLinkStyle from Navbar.jsx
  const centerLinkStyle = {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: "0.82rem",
    color: "var(--text-muted)",
    textDecoration: "none",
    padding: "0.4rem 0.75rem",
    borderRadius: "999px",
    transition: "color 200ms, background 200ms",
    whiteSpace: "nowrap",
    display: "block",
  };

  // Slightly slower stagger for expand/collapse
  const itemVariants = {
    enter: (i) => ({
      opacity: 1,
      width: "auto",
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.52, ease: EASE_IN, delay: i * 0.09 },
    }),
    exit: (i) => ({
      opacity: 0,
      width: 0,
      x: -10,
      filter: "blur(3px)",
      transition: {
        duration: 0.32,
        ease: EASE_OUT,
        delay: (navItems.length - 1 - i) * 0.07,
      },
    }),
    initial: { opacity: 0, width: 0, x: -10, filter: "blur(3px)" },
  };

  const pillVariants = {
    // Exact match to Navbar.jsx "top" variant — same bg, padding, maxWidth, borderRadius
    center: {
      left: "50%",
      x: "-50%",
      top: "16px",
      width: "min(1100px, calc(100vw - 32px))",
      height: "auto", // let padding define height, just like Navbar.jsx
      borderRadius: "999px", // Navbar.jsx uses 999px, not 26px
      backgroundColor: "rgba(22, 22, 26, 0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 2px 16px rgba(0, 0, 0, 0.2)",
      // Navbar.jsx padding: "0.75rem 1rem 0.75rem 1.5rem"
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "1.5rem",
      paddingRight: "1rem",
    },
    icon: {
      left: "24px",
      x: "0%",
      top: "20px",
      width: "68px",
      height: "68px",
      borderRadius: "34px",
      backgroundColor: "rgba(13, 13, 16, 0.92)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderColor: "rgba(255,255,255,0.10)",
      boxShadow: "0 8px 36px rgba(0,0,0,0.52)",
      paddingTop: "0px",
      paddingBottom: "0px",
      paddingLeft: "0px",
      paddingRight: "0px",
    },
    open: {
      left: "24px",
      x: "0%",
      top: "20px",
      width: "auto",
      height: "68px",
      borderRadius: "34px",
      backgroundColor: "rgba(13, 13, 16, 0.92)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderColor: "rgba(255,255,255,0.10)",
      boxShadow: "0 8px 36px rgba(0,0,0,0.52)",
      paddingTop: "0px",
      paddingBottom: "0px",
      paddingLeft: "0px",
      paddingRight: "16px",
    },
  };

  const pillTransition = {
    // Slowed down: lower stiffness + higher mass = more leisurely spring
    left: { ...SPRING, stiffness: 180, damping: 28, mass: 1.2 },
    x: { ...SPRING, stiffness: 180, damping: 28, mass: 1.2 },
    width: { ...SPRING, stiffness: 160, damping: 28, mass: 1.2 },
    height: { ...SPRING, stiffness: 180, damping: 32, mass: 1.1 },
    borderRadius: { duration: 0.6, ease: EASE_IN },
    backgroundColor: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    boxShadow: { duration: 0.55 },
    borderColor: { duration: 0.45 },
    paddingTop: { duration: 0.5, ease: EASE_IN },
    paddingBottom: { duration: 0.5, ease: EASE_IN },
    paddingLeft: { duration: 0.5, ease: EASE_IN },
    paddingRight: { duration: 0.5, ease: EASE_IN },
    top: { ...SPRING, stiffness: 180, damping: 28, mass: 1.2 },
  };

  return (
    <motion.div
      animate={navState}
      variants={pillVariants}
      transition={pillTransition}
      style={{
        position: "fixed",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        overflow: "visible",
        willChange: "transform, left, width, height",
      }}
    >
      {/* ══════════════════════════════════════════════════
          CENTER STATE — pixel-perfect copy of Navbar.jsx
          Same structure: Logo | search(flex-1) | right-links
          Same gap: 1.5rem, justifyContent: space-between
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isCenter && (
          <motion.div
            key="center-nav"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.55, delay: 0.2, ease: EASE_IN },
            }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* Logo — exact Navbar.jsx Logo component */}
            <Link
              to="/"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--text-primary)",
                textDecoration: "none",
                letterSpacing: "-0.03em",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  background: "var(--accent-green)",
                  borderRadius: "5px",
                  flexShrink: 0,
                }}
              />
              DevLink
            </Link>

            {/* Search — flex:1, centred, exact Navbar.jsx motion.form */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
                margin: 0,
                padding: 0,
              }}
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search DevLink..."
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "999px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
                  padding: "0.4rem 1rem",
                  outline: "none",
                  width: "100%",
                  minWidth: "200px",
                  transition: "border-color 200ms, background 200ms",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(185, 244, 61, 0.3)";
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-subtle)";
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </form>

            {/* Right links — exact Navbar.jsx right-side div */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {/* Home link — was missing before */}
              <NavLink
                to="/"
                end
                style={({ isActive }) => ({
                  ...centerLinkStyle,
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  background: isActive
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                })}
              >
                Home
              </NavLink>

              {isAuthenticated && user ? (
                <>
                  {/* Bell / notifications */}
                  <div style={{ position: "relative" }} ref={notifRef}>
                    <button
                      id="gf-notifications-btn"
                      onClick={() => setShowNotifDropdown((p) => !p)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "0.4rem",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 200ms, background 200ms",
                        position: "relative",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--text-primary)";
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <BellIcon />
                      {unreadNotificationCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            background: "var(--accent-green)",
                            color: "#0a0a0d",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            borderRadius: "50%",
                            minWidth: "14px",
                            height: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 2px",
                            animation: "pulse-green 2s infinite",
                          }}
                        >
                          {unreadNotificationCount > 9
                            ? "9+"
                            : unreadNotificationCount}
                        </span>
                      )}
                    </button>
                    {showNotifDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 0.75rem)",
                          width: "360px",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-card)",
                          borderRadius: "var(--radius-lg)",
                          boxShadow: "var(--shadow-modal)",
                          overflow: "hidden",
                          animation: "modalIn 0.25s var(--ease-expo) both",
                          zIndex: 9999,
                        }}
                      >
                        <div
                          style={{
                            padding: "1rem 1.25rem",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "var(--text-primary)",
                            }}
                          >
                            Notifications
                          </span>
                          {unreadNotificationCount > 0 && (
                            <span
                              style={{
                                background: "rgba(185,244,61,0.12)",
                                color: "var(--accent-green)",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                padding: "0.15rem 0.5rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(185,244,61,0.2)",
                              }}
                            >
                              {unreadNotificationCount} new
                            </span>
                          )}
                        </div>
                        <NotificationList
                          closeDropdown={() => setShowNotifDropdown(false)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Profile */}
                  <NavLink
                    to={
                      user.username
                        ? `/profile/${user.username.toLowerCase()}`
                        : "/profile"
                    }
                    style={({ isActive }) => ({
                      ...centerLinkStyle,
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    })}
                  >
                    {user.displayName || user.username}
                  </NavLink>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    style={{
                      ...centerLinkStyle,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#f87171";
                      e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/feed"
                    style={({ isActive }) => ({
                      ...centerLinkStyle,
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    })}
                  >
                    Feed
                  </NavLink>
                  <NavLink
                    to="/login"
                    style={({ isActive }) => ({
                      ...centerLinkStyle,
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                    })}
                  >
                    Login
                  </NavLink>
                  <Link
                    to="/register"
                    className="btn-primary"
                    style={{ padding: "0.45rem 1.1rem", fontSize: "0.82rem" }}
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLLED STATE */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            key="scrolled-nav"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.22, ease: EASE_IN },
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              flexShrink: 0,
            }}
          >
            <motion.button
              onClick={toggleOpen}
              whileTap={{ scale: 0.9 }}
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: isOpen ? "var(--accent-green)" : "var(--text-primary)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-green)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isOpen
                  ? "var(--accent-green)"
                  : "var(--text-primary)";
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.svg
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                      transition: { duration: 0.22, ease: EASE_IN },
                    }}
                    exit={{
                      rotate: 90,
                      opacity: 0,
                      transition: { duration: 0.18 },
                    }}
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{
                      rotate: 0,
                      opacity: 1,
                      transition: { duration: 0.22, ease: EASE_IN },
                    }}
                    exit={{
                      rotate: -90,
                      opacity: 0,
                      transition: { duration: 0.18 },
                    }}
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="14" y2="16" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {isOpen &&
                navItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    custom={i}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    variants={itemVariants}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                      overflow: item.isDropdown ? "visible" : "hidden",
                    }}
                  >
                    {item.node}
                  </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const GlobalFeedPage = () => {
  const [pageVisible, setPageVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const fetchGlobal = useCallback(async (pageNum) => {
    const res = await axios.get(
      `${API_BASE_URL}/posts/global?pageNumber=${pageNum}`,
    );
    return res.data.posts || [];
  }, []);

  const { posts, loading, error, hasMore, loaderRef } =
    useInfiniteScroll(fetchGlobal);

  return (
    <>
      <style>{`
        .gf-wrap {
          display: grid;
          grid-template-columns: 280px 1fr 280px;
          /* gap between columns */
          gap: 0;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        .gf-sidebar-col {
          position: sticky;
          top: 96px;
          /* outer left/right padding matches feed-col side padding (1.5rem)
             so the gap from page edge = gap between columns */
          padding: 2rem 1.5rem;
        }
        .gf-feed-col {
          padding: 2rem 1.5rem 4rem;
          min-width: 0;
        }
        @media (max-width: 1200px) {
          .gf-wrap { grid-template-columns: 240px 1fr 240px; }
        }
        @media (max-width: 1000px) {
          .gf-wrap { grid-template-columns: 220px 1fr; }
          .gf-sidebar-right-col { display: none; }
        }
        @media (max-width: 700px) {
          .gf-wrap { grid-template-columns: 1fr; }
          .gf-sidebar-col { display: none; }
        }
      `}</style>

      <GlobalFeedNavbar onScrollChange={setIsScrolled} />
      <BackToTopButton visible={isScrolled} />

      <div style={{ height: "84px" }} />

      <div
        className="gf-wrap"
        style={{
          opacity: pageVisible ? 1 : 0,
          transform: pageVisible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 400ms ease, transform 400ms var(--ease-expo)",
        }}
      >
        <div className="gf-sidebar-col">
          <LeftSidebar />
        </div>

        <div className="gf-feed-col">
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                color: "#f87171",
                fontSize: "0.875rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {posts.length === 0 && !loading && !error && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px dashed var(--border-card)",
                borderRadius: "var(--radius-lg)",
                padding: "4rem 2rem",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--text-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Nothing here yet
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.5rem",
                }}
              >
                Be the first to post on DevLink!
              </p>
              <Link
                to="/register"
                className="btn-primary"
                style={{ display: "inline-flex", padding: "0.6rem 1.5rem" }}
              >
                Join DevLink
              </Link>
            </div>
          )}

          <div>
            {posts.map((post, i) => (
              <div
                key={post._id}
                style={{
                  opacity: pageVisible ? 1 : 0,
                  transform: pageVisible ? "translateY(0)" : "translateY(16px)",
                  transition: `opacity 400ms ${Math.min(i * 45, 500)}ms ease, transform 400ms ${Math.min(i * 45, 500)}ms var(--ease-expo)`,
                }}
              >
                <PostItem post={post} />
              </div>
            ))}
          </div>

          <ScrollLoader
            loading={loading}
            hasMore={hasMore}
            loaderRef={loaderRef}
          />
        </div>

        <div className="gf-sidebar-col gf-sidebar-right-col">
          <RightSidebar />
        </div>
      </div>
    </>
  );
};

export default GlobalFeedPage;
