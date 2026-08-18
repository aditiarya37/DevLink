import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import PostItem from "../components/PostItem";
import EditPostModal from "../components/EditPostModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DevLinkPlaceholder = ({ seed = 0 }) => {
  const palettes = [
    {
      bg: "linear-gradient(135deg,rgba(185,244,61,0.13) 0%,rgba(10,10,13,0.0) 100%)",
      icon: "⌘",
      c: "rgba(185,244,61,0.38)",
    },
    {
      bg: "linear-gradient(135deg,rgba(168,85,247,0.13) 0%,rgba(10,10,13,0.0) 100%)",
      icon: "◈",
      c: "rgba(168,85,247,0.38)",
    },
    {
      bg: "linear-gradient(135deg,rgba(185,244,61,0.08) 0%,rgba(168,85,247,0.08) 100%)",
      icon: "◉",
      c: "rgba(185,244,61,0.3)",
    },
    {
      bg: "linear-gradient(135deg,rgba(168,85,247,0.10) 0%,rgba(185,244,61,0.06) 100%)",
      icon: "⬡",
      c: "rgba(168,85,247,0.35)",
    },
    {
      bg: "linear-gradient(135deg,rgba(185,244,61,0.10) 0%,rgba(168,85,247,0.04) 100%)",
      icon: "◎",
      c: "rgba(185,244,61,0.32)",
    },
    {
      bg: "linear-gradient(135deg,rgba(168,85,247,0.08) 0%,rgba(185,244,61,0.10) 100%)",
      icon: "⊕",
      c: "rgba(168,85,247,0.32)",
    },
  ];
  const p = palettes[seed % palettes.length];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: p.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.3rem",
        border: "1px solid rgba(185,244,61,0.07)",
        borderRadius: "inherit",
      }}
    >
      <span style={{ fontSize: "1.5rem", color: p.c, lineHeight: 1 }}>
        {p.icon}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "0.55rem",
          letterSpacing: "0.18em",
          color: p.c,
          textTransform: "uppercase",
        }}
      >
        DevLink
      </span>
    </div>
  );
};

const ArcCarousel = ({ posts }) => {
  const base = posts.slice(0, 20);
  const N = base.length;
  if (N === 0) return null;

  const items = [...base, ...base, ...base];
  const TOTAL = items.length;
  const START_IDX = N;

  const [activeIndex, setActiveIndex] = useState(START_IDX);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const velocityRef = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const rafRef = useRef(null);
  const jumpLock = useRef(false);

  const isAutoPaused = useRef(false);
  const resumeTimerRef = useRef(null);

  const CARD_W = 320;
  const CARD_H = 420;
  const ARC_SPREAD = 380;
  const ARC_DIP = 80;
  const MAX_VIS = 3;

  const getCardStyle = (i) => {
    const rawOffset = (i - activeIndex) * ARC_SPREAD + dragOffset;
    const norm = rawOffset / ARC_SPREAD;
    const arcY = ARC_DIP * Math.pow(norm * 0.55, 2);
    const dist = Math.abs(norm);
    const scale = Math.max(0.68, 1 - dist * 0.1);
    const opacity = Math.max(0, 1 - dist * 0.26);
    const rotateY = Math.max(-32, Math.min(32, norm * 11));
    const rotateZ = Math.max(-6, Math.min(6, norm * 1.8));
    const zIndex = Math.round(100 - dist * 10);
    const visible = dist <= MAX_VIS + 0.5;
    return {
      transform: `translateX(${rawOffset}px) translateY(${arcY}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
      opacity: visible ? opacity : 0,
      zIndex,
      pointerEvents: visible ? "auto" : "none",
    };
  };

  const loopCorrect = useCallback(
    (idx) => {
      if (jumpLock.current) return;
      if (idx < Math.floor(N * 0.5)) {
        jumpLock.current = true;
        setActiveIndex(idx + N);
        setTimeout(() => {
          jumpLock.current = false;
        }, 80);
      } else if (idx >= N * 2 + Math.floor(N * 0.5)) {
        jumpLock.current = true;
        setActiveIndex(idx - N);
        setTimeout(() => {
          jumpLock.current = false;
        }, 80);
      }
    },
    [N],
  );

  const snapToNearest = useCallback(() => {
    const nearestCard = Math.round(-dragOffset / ARC_SPREAD);
    const raw = activeIndex + nearestCard;
    const clamped = Math.max(0, Math.min(TOTAL - 1, raw));
    setActiveIndex(clamped);
    setDragOffset(0);
    setTimeout(() => loopCorrect(clamped), 0);
  }, [dragOffset, activeIndex, TOTAL, loopCorrect]);

  const inertiaLoop = useCallback(() => {
    velocityRef.current *= 0.92;
    if (Math.abs(velocityRef.current) < 0.5) {
      velocityRef.current = 0;
      snapToNearest();
      return;
    }
    setDragOffset((prev) => prev + velocityRef.current);
    rafRef.current = requestAnimationFrame(inertiaLoop);
  }, [snapToNearest]);

  const onPointerDown = (e) => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(resumeTimerRef.current);
    isAutoPaused.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartOffset.current = dragOffset;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX.current;
    const dt = Math.max(1, Date.now() - lastTime.current);
    velocityRef.current = (dx / dt) * 12;
    lastX.current = e.clientX;
    lastTime.current = Date.now();
    setDragOffset(dragStartOffset.current + (e.clientX - dragStartX.current));
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    rafRef.current = requestAnimationFrame(inertiaLoop);
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isAutoPaused.current = false;
    }, 6000);
  };

  const goTo = (dotIdx) => {
    setActiveIndex(N + dotIdx);
    setDragOffset(0);
  };

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAutoPaused.current) return;
      setActiveIndex((prev) => prev + 1);
      setTimeout(() => loopCorrect(activeIndexRef.current + 1), 0);
    }, 3000);
    return () => clearInterval(interval);
  }, [N, loopCorrect]);

  const activeDot = ((activeIndex % N) + N) % N;

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${CARD_H + ARC_DIP + 80}px`,
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          perspective: "1400px",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* ── Edge fade: use transparent instead of hard #0a0a0d so the
            green glow from body shows through on the home page ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 200,
            pointerEvents: "none",
            background:
              "linear-gradient(90deg, var(--bg-1) 0%, transparent 12%, transparent 88%, var(--bg-1) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "24px",
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((post, i) => {
            const cs = getCardStyle(i);
            const isActive =
              i === activeIndex && Math.abs(dragOffset) < ARC_SPREAD / 2;
            const u = post.user || {};
            const pic =
              u.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent((u.username || "U").charAt(0).toUpperCase())}&background=1c1c21&color=b9f43d&size=80&font-size=0.4&length=1`;
            const hasImg = !!post.mediaUrl;
            const seed = (i % N) % 6;

            return (
              <div
                key={`${post._id}-${Math.floor(i / N)}`}
                style={{
                  position: "absolute",
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  left: `-${CARD_W / 2}px`,
                  top: 0,
                  background: isActive
                    ? "linear-gradient(160deg,#1e1e28 0%,#16161e 100%)"
                    : "var(--bg-card)",
                  border: isActive
                    ? "1px solid rgba(185,244,61,0.28)"
                    : "1px solid var(--border-card)",
                  borderRadius: "22px",
                  padding: "1.1rem 1.1rem 1rem",
                  boxShadow: isActive
                    ? "0 24px 64px rgba(0,0,0,0.7),0 0 0 1px rgba(185,244,61,0.07),inset 0 1px 0 rgba(255,255,255,0.04)"
                    : "0 8px 30px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  ...cs,
                  transitionProperty: isDragging
                    ? "none"
                    : "transform,border-color,box-shadow,opacity",
                  transitionDuration: isDragging ? "0ms" : "500ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.55rem",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={pic}
                    alt={u.username || "user"}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid rgba(185,244,61,0.18)",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.displayName || u.username || "Unknown"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.67rem",
                        color: "var(--text-dim)",
                        marginTop: "0.04rem",
                      }}
                    >
                      @{u.username || "user"} · {fmtDate(post.createdAt)}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        background: "var(--accent-green)",
                        borderRadius: "50%",
                        boxShadow: "0 0 10px rgba(185,244,61,0.7)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {/* Image */}
                <div
                  style={{
                    height: "138px",
                    borderRadius: "13px",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {hasImg ? (
                    <img
                      src={post.mediaUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <DevLinkPlaceholder seed={seed} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                  {post.content ? (
                    <p
                      style={{
                        fontSize: "0.79rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.55,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        margin: 0,
                      }}
                    >
                      {post.content.replace(
                        /@@@[\w-]+@@@/g,
                        (m) => "@" + m.slice(3, -3),
                      )}
                    </p>
                  ) : post.codeSnippet?.code ? (
                    <div
                      style={{
                        background: "rgba(10,10,13,0.65)",
                        borderRadius: "8px",
                        padding: "0.45rem 0.6rem",
                        height: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.6rem",
                          color: "var(--accent-green)",
                          marginBottom: "0.2rem",
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {post.codeSnippet.language || "code"}
                      </div>
                      <pre
                        style={{
                          fontSize: "0.67rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.45,
                          margin: 0,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {String(post.codeSnippet.code).slice(0, 210)}
                      </pre>
                    </div>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-dim)",
                          fontStyle: "italic",
                        }}
                      >
                        No description
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.27rem",
                      flexWrap: "wrap",
                      flexShrink: 0,
                    }}
                  >
                    {post.tags.slice(0, 4).map((tag, ti) => (
                      <span
                        key={ti}
                        style={{
                          fontSize: "0.58rem",
                          background: "rgba(168,85,247,0.1)",
                          color: "var(--accent-purple)",
                          border: "1px solid rgba(168,85,247,0.18)",
                          borderRadius: "999px",
                          padding: "0.08rem 0.45rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    paddingTop: "0.45rem",
                    borderTop: "1px solid var(--border-subtle)",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 20 20"
                      fill="#f87171"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {post.likeCount || 0}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 20 20"
                      fill="var(--accent-green)"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {post.commentCount || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arc guide */}
        <svg
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "none",
            opacity: 0.12,
          }}
          width="900"
          height="44"
          viewBox="0 0 900 44"
        >
          <path
            d="M 0 38 Q 450 0 900 38"
            fill="none"
            stroke="var(--accent-green)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.38rem",
          marginTop: "0.65rem",
        }}
      >
        {base.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === activeDot ? "20px" : "6px",
              height: "6px",
              borderRadius: "999px",
              background:
                i === activeDot ? "var(--accent-green)" : "var(--border-hover)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              transition: "width 300ms var(--ease-expo),background 300ms",
            }}
          />
        ))}
      </div>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.65rem",
          color: "var(--text-dim)",
          marginTop: "0.5rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "var(--font-body)",
        }}
      >
        auto-scrolling · drag to explore
      </p>
    </div>
  );
};

const FeaturesSection = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const features = [
    {
      icon: (
        <svg
          width="22"
          height="22"
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
      ),
      title: "Code Snippets",
      desc: "Post code with full syntax highlighting across 20+ languages. Get peer feedback instantly.",
      color: "green",
      accent: "rgba(185,244,61,0.12)",
      border: "rgba(185,244,61,0.15)",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
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
      ),
      title: "Dev Network",
      desc: "Follow developers, discover talent, and find collaborators for your next project.",
      color: "purple",
      accent: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.15)",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
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
      ),
      title: "Smart Feed",
      desc: "Personalized feed based on who you follow, with tags and trending topics surfaced.",
      color: "green",
      accent: "rgba(185,244,61,0.12)",
      border: "rgba(185,244,61,0.15)",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
      title: "Image Posts",
      desc: "Showcase your projects and UI designs visually. Rich media embeds built in.",
      color: "purple",
      accent: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.15)",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
      ),
      title: "Tag System",
      desc: "Organize and discover posts by technology, topic, or interest with #tags.",
      color: "green",
      accent: "rgba(185,244,61,0.12)",
      border: "rgba(185,244,61,0.15)",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      title: "Mentions",
      desc: "@mention teammates and collaborators directly inside any post or comment.",
      color: "purple",
      accent: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.15)",
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        padding: "3rem 1.5rem 5rem",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "2.5rem" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            color: "var(--text-dim)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Core Features
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(1.5rem,3vw,2.2rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          Everything devs need,{" "}
          <span className="text-gradient-green">nothing they don't</span>
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "1rem",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${f.border}`,
              borderRadius: "20px",
              padding: "1.75rem",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 500ms ${i * 80}ms ease,transform 500ms ${i * 80}ms var(--ease-expo)`,
              cursor: "default",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                f.color === "green"
                  ? "0 12px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(185,244,61,0.2)"
                  : "0 12px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(168,85,247,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = visible
                ? "translateY(0)"
                : "translateY(24px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "100px",
                height: "100px",
                background: f.accent,
                borderRadius: "0 20px 0 100%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                width: "44px",
                height: "44px",
                background: f.accent,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.1rem",
                color:
                  f.color === "green"
                    ? "var(--accent-green)"
                    : "var(--accent-purple)",
                border: `1px solid ${f.border}`,
              }}
            >
              {f.icon}
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
              {f.title}
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const LeftSidebar = ({ user }) => {
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      label: "Profile",
      href: user?.username
        ? `/profile/${user.username.toLowerCase()}`
        : "/profile",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];
  const trendingTags = [
    "javascript",
    "react",
    "python",
    "typescript",
    "nodejs",
    "golang",
    "rust",
    "algorithms",
  ];
  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        position: "sticky",
        top: "96px",
        height: "fit-content",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "0.75rem",
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              transition: "background 200ms,color 200ms",
              marginBottom: "0.15rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span style={{ color: "var(--accent-green)", opacity: 0.8 }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
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
            fontSize: "0.82rem",
            color: "var(--text-primary)",
            marginBottom: "0.85rem",
            letterSpacing: "-0.01em",
          }}
        >
          Trending Tags
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {trendingTags.map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag}`}
              style={{ textDecoration: "none" }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: "0.72rem",
                  background: "rgba(168,85,247,0.08)",
                  color: "var(--accent-purple)",
                  border: "1px solid rgba(168,85,247,0.15)",
                  borderRadius: "999px",
                  padding: "0.2rem 0.55rem",
                  transition: "background 200ms",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(168,85,247,0.18)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(168,85,247,0.08)")
                }
              >
                #{tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

const RightSidebar = () => (
  <aside
    style={{
      width: "240px",
      flexShrink: 0,
      position: "sticky",
      top: "96px",
      height: "fit-content",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    }}
  >
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
          fontSize: "0.82rem",
          color: "var(--text-primary)",
          marginBottom: "0.85rem",
          letterSpacing: "-0.01em",
        }}
      >
        Activity
      </p>
      {[
        {
          label: "Developers Online",
          value: "1.2k",
          icon: "◉",
          color: "#b9f43d",
        },
        { label: "Posts Today", value: "342", icon: "◈", color: "#a855f7" },
        { label: "Code Snippets", value: "128", icon: "⌘", color: "#b9f43d" },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem 0",
            borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none",
          }}
        >
          <span
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span style={{ color: s.color, fontSize: "0.7rem" }}>{s.icon}</span>
            {s.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.85rem",
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
          "linear-gradient(135deg,rgba(185,244,61,0.06) 0%,rgba(168,85,247,0.06) 100%)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.82rem",
          color: "var(--text-primary)",
          marginBottom: "0.65rem",
          letterSpacing: "-0.01em",
        }}
      >
        Explore
      </p>
      {[
        { label: "Search Developers", href: "/search?q=react" },
        { label: "Browse Tags", href: "/tag/javascript" },
        { label: "Edit Profile", href: "/profile/edit" },
      ].map((link) => (
        <Link
          key={link.label}
          to={link.href}
          style={{
            display: "block",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            padding: "0.35rem 0",
            transition: "color 200ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--accent-green)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          → {link.label}
        </Link>
      ))}
    </div>
  </aside>
);

function useInfiniteScroll(fetchFn, enabled) {
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

  const load = useCallback(
    async (pageNum) => {
      if (loadingRef.current || !hasMoreRef.current || !enabled) return;
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
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;
    setPosts([]);
    setHasMore(true);
    setError("");
    pageRef.current = 1;
    hasMoreRef.current = true;
    seenIds.current = new Set();
    load(1);
  }, [fetchFn, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled || !loaderRef.current) return;
    const sentinel = loaderRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          pageRef.current += 1;
          load(pageRef.current);
        }
      },
      { threshold: 0.1, rootMargin: "300px" },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [enabled, load]);

  return { posts, setPosts, loading, error, hasMore, loaderRef };
}

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
        You're all caught up ✓
      </p>
    )}
  </div>
);

const HomePage = () => {
  const { isAuthenticated, user, loading: authLoading, token } = useAuth();
  const [pageVisible, setPageVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [carouselPosts, setCarouselPosts] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCarouselLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/posts/global?pageNumber=1`,
        );
        if (!cancelled) {
          const raw = res.data.posts || res.data || [];
          const sorted = [...raw].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          setCarouselPosts(sorted.slice(0, 20));
        }
      } catch {
        if (!cancelled) setCarouselPosts([]);
      } finally {
        if (!cancelled) setCarouselLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchAuthFeed = useCallback(
    async (pageNum) => {
      const res = await axios.get(
        `${API_BASE_URL}/posts?pageNumber=${pageNum}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data.posts || [];
    },
    [token],
  );

  const fetchGlobalFeed = useCallback(async (pageNum) => {
    const res = await axios.get(
      `${API_BASE_URL}/posts/global?pageNumber=${pageNum}`,
    );
    return res.data.posts || [];
  }, []);

  const feedEnabled = !authLoading;
  const activeFetch = isAuthenticated ? fetchAuthFeed : fetchGlobalFeed;

  const {
    posts,
    setPosts,
    loading: feedLoading,
    error: feedError,
    hasMore,
    loaderRef,
  } = useInfiniteScroll(activeFetch, feedEnabled);

  const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev]);
  const handlePostDelete = async (postId) => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };
  const handlePostUpdated = (updated) =>
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));

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

  if (isAuthenticated && user) {
    return (
      <div
        style={{
          opacity: pageVisible ? 1 : 0,
          transform: pageVisible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 400ms ease,transform 400ms var(--ease-expo)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem 4rem",
            display: "flex",
            gap: "1.5rem",
            alignItems: "flex-start",
          }}
        >
          <div className="devlink-sidebar-left">
            <LeftSidebar user={user} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
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
            <div
              style={{
                opacity: pageVisible ? 1 : 0,
                transform: pageVisible ? "translateY(0)" : "translateY(12px)",
                transition:
                  "opacity 400ms 100ms ease,transform 400ms 100ms var(--ease-expo)",
              }}
            >
              <CreatePost onPostCreated={handlePostCreated} />
            </div>
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
                  fontSize: "1.05rem",
                  color: "var(--text-primary)",
                }}
              >
                Your Feed
              </h2>
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
                Live
              </span>
            </div>
            {feedError && (
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
                {feedError}
              </div>
            )}
            {posts.length === 0 && !feedLoading && !feedError && (
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px dashed var(--border-card)",
                  borderRadius: "var(--radius-lg)",
                  padding: "3rem 2rem",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
                  Your feed is quiet. Follow developers or create your first
                  post!
                </p>
              </div>
            )}
            <div>
              {posts.map((post, i) => (
                <div
                  key={post._id}
                  style={{
                    opacity: pageVisible ? 1 : 0,
                    transform: pageVisible
                      ? "translateY(0)"
                      : "translateY(16px)",
                    transition: `opacity 400ms ${Math.min(200 + i * 50, 700)}ms ease,transform 400ms ${Math.min(200 + i * 50, 700)}ms var(--ease-expo)`,
                  }}
                >
                  <PostItem
                    post={post}
                    onEdit={setEditingPost}
                    onDelete={handlePostDelete}
                  />
                </div>
              ))}
            </div>
            <ScrollLoader
              loading={feedLoading}
              hasMore={hasMore}
              loaderRef={loaderRef}
            />
          </div>
          <div className="devlink-sidebar-right">
            <RightSidebar />
          </div>
        </div>
        <style>{`.devlink-sidebar-left,.devlink-sidebar-right{display:block;}@media(max-width:1100px){.devlink-sidebar-right{display:none;}}@media(max-width:768px){.devlink-sidebar-left{display:none;}}`}</style>
        {editingPost && (
          <EditPostModal
            postToEdit={editingPost}
            onClose={() => setEditingPost(null)}
            onPostUpdated={handlePostUpdated}
          />
        )}
      </div>
    );
  }

  /* ── UNAUTHENTICATED LANDING ── */
  return (
    <div
      style={{
        opacity: pageVisible ? 1 : 0,
        transform: pageVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 500ms ease,transform 500ms var(--ease-expo)",
      }}
    >
      {/* Hero — pulls up behind the fixed navbar so the glow fills the full top */}
      <section
        style={{
          position: "relative",
          overflow: "visible",
          padding: "5rem 1.5rem 2rem",
          marginTop: "-80px",
          paddingTop: "calc(80px + 5rem)",
          textAlign: "center",
        }}
      >
        {/* Green neon glow — anchored to top of viewport, behind navbar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            background:
              "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(185,244,61,0.13) 0%, rgba(185,244,61,0.05) 40%, transparent 65%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "820px",
            margin: "0 auto",
          }}
        >
          {/* Badge */}
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

          <h1
            className="hero-display animate-stagger-1"
            style={{
              fontSize: "clamp(2.8rem,7vw,5.5rem)",
              marginBottom: "1.5rem",
            }}
          >
            DevLink{" "}
            <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>*</span>
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
            Where developers connect, share code, and build the future together.
            Post, collaborate, and grow your network.
          </p>

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

          <div className="animate-stagger-4">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Live from the community
            </p>
          </div>
        </div>
      </section>

      <div className="animate-stagger-4">
        {carouselLoading ? (
          <div
            style={{
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
        ) : carouselPosts.length >= 2 ? (
          <ArcCarousel posts={carouselPosts} />
        ) : (
          <div
            style={{
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
              fontSize: "0.85rem",
              fontStyle: "italic",
            }}
          >
            Be the first to post on DevLink!
          </div>
        )}
      </div>

      <FeaturesSection />

      {editingPost && (
        <EditPostModal
          postToEdit={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}
    </div>
  );
};

export default HomePage;
