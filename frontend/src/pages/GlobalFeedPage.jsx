import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import PostItem from "../components/PostItem";
import Navbar from "../components/Navbar";

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
   BACK TO TOP — bottom-right floating button
   Click triggers a smooth JS-driven scroll with a custom
   ease curve, plus the button plays a launch animation.
───────────────────────────────────────────────────────── */
function smoothScrollToTop() {
  const start = window.scrollY;
  const duration = Math.min(600 + start * 0.18, 1200); // scales with distance
  const startTime = performance.now();
  // Expo ease-out: fast start, graceful landing
  const ease = (t) => 1 - Math.pow(1 - t, 5);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start * (1 - ease(progress)));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const BackToTopButton = ({ visible }) => {
  const [launching, setLaunching] = useState(false);

  const handleClick = () => {
    setLaunching(true);
    smoothScrollToTop();
    // Reset launch state after animation completes
    setTimeout(() => setLaunching(false), 600);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
          exit={{
            opacity: 0,
            y: 14,
            scale: 0.88,
            transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
          }}
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleClick}
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 500,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: launching
              ? "rgba(185,244,61,0.15)"
              : "rgba(13, 13, 16, 0.82)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: launching
              ? "1px solid rgba(185,244,61,0.45)"
              : "1px solid rgba(255,255,255,0.11)",
            boxShadow: launching
              ? "0 0 24px rgba(185,244,61,0.25), 0 4px 24px rgba(0,0,0,0.4)"
              : "0 4px 24px rgba(0,0,0,0.4)",
            color: launching ? "var(--accent-green)" : "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition:
              "background 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s",
            overflow: "hidden",
          }}
          aria-label="Scroll to top"
          title="Back to top"
        >
          {/* Arrow — slides up and reappears when launching */}
          <motion.svg
            key={launching ? "launching" : "idle"}
            initial={launching ? { y: 10, opacity: 0 } : { y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </motion.svg>

          {/* Green ripple on click */}
          <AnimatePresence>
            {launching && (
              <motion.span
                key="ripple"
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 3.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "rgba(185,244,61,0.35)",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const GlobalFeedPage = () => {
  const [pageVisible, setPageVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Track scroll for the bottom-right back-to-top button
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
          gap: 0;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }
        .gf-sidebar-col {
          position: sticky;
          top: 96px;
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

      {/*
        Navbar with expandOnScroll=true:
        - At top of page → centred pill (same as every other page)
        - On scroll      → stretches to full viewport width, hugs edges
        Other pages are unaffected because they render Navbar without this prop.
      */}
      <Navbar expandOnScroll />

      {/* Bottom-right "Back to top" — appears after scrolling 300px */}
      <BackToTopButton visible={showBackToTop} />

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
