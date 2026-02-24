import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationList from "./NotificationList";
import { motion } from "framer-motion";

/**
 * Navbar
 *
 * Props:
 * expandOnScroll {boolean} — when true (used by GlobalFeedPage) the pill
 * does NOT collapse on scroll; instead it stretches to full viewport width
 * and loses its centered, pill shape to become a classic sticky top bar.
 * On every other page the default shrinking/centering behaviour is used.
 */
const Navbar = ({ expandOnScroll = false }) => {
  const {
    isAuthenticated,
    user,
    logout,
    loading: authLoading,
    unreadNotificationCount,
  } = useAuth();

  const navigate = useNavigate();

  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const notificationDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // We track the exact pixel width of the window (minus scrollbars)
  // so Framer Motion never has to guess or snap between % and px.
  const [clientWidth, setClientWidth] = useState(
    typeof document !== "undefined"
      ? document.documentElement.clientWidth
      : 1200,
  );

  useEffect(() => {
    const handleResize = () =>
      setClientWidth(document.documentElement.clientWidth);
    window.addEventListener("resize", handleResize);
    // Call once to ensure it's accurate if scrollbars are present
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        const bellBtn = document.getElementById("notifications-menu-button");
        if (bellBtn && !bellBtn.contains(event.target)) {
          setShowNotificationsDropdown(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // ─────────────────────────────────────────────────
  // THE SMOOTH, SYMMETRICAL ANIMATION
  // Duration is set to 0.6s for a deliberate, slower pace.
  // easeInOut guarantees expanding and collapsing take identical time and momentum.
  // ─────────────────────────────────────────────────
  const symmetricTween = {
    type: "tween",
    duration: 0.6,
    ease: "easeInOut",
  };

  if (authLoading && isAuthenticated === null) {
    return (
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(15,15,18,0)",
          padding: "1rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────
     expandOnScroll mode (GlobalFeedPage)
  ───────────────────────────────────────────────── */
  if (expandOnScroll) {
    const expandVariants = {
      top: {
        width: Math.min(1100, clientWidth - 32),
        borderRadius: "999px",
        backgroundColor: "rgba(22, 22, 26, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        boxShadow: "0 2px 16px rgba(0, 0, 0, 0.2)",
        padding: "0.75rem 1.5rem",
      },
      scrolled: {
        width: clientWidth - 40,
        borderRadius: "999px",
        backgroundColor: "rgba(15, 15, 18, 0.55)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderColor: "rgba(255, 255, 255, 0.12)",
        boxShadow:
          "0 8px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        padding: "0.6rem 1.75rem",
      },
    };

    const expandTransition = {
      width: symmetricTween,
      padding: symmetricTween,
      borderRadius: symmetricTween,
      backgroundColor: symmetricTween,
      borderColor: symmetricTween,
      boxShadow: symmetricTween,
    };

    const navState = scrolled ? "scrolled" : "top";

    return (
      <>
        <div
          style={{
            position: "fixed",
            top: "1rem",
            left: 0,
            right: 0,
            zIndex: 100,
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <motion.nav
            initial="top"
            animate={navState}
            variants={expandVariants}
            transition={expandTransition}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              borderStyle: "solid",
              borderWidth: "1px",
              pointerEvents: "all",
              willChange: "width, padding, background-color",
              boxSizing: "border-box",
            }}
          >
            <Logo />

            <motion.form
              onSubmit={handleSearchSubmit}
              // Animate the search box so it stretches slightly with the navbar
              animate={{
                maxWidth: scrolled ? 400 : 320,
              }}
              transition={symmetricTween}
              style={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
                margin: 0,
                padding: 0,
                willChange: "max-width",
              }}
              className="hidden-mobile"
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
            </motion.form>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <NavLink
                to="/"
                end
                style={({ isActive }) => ({
                  ...navLinkStyle,
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
                  <div
                    style={{ position: "relative" }}
                    ref={notificationDropdownRef}
                  >
                    <button
                      id="notifications-menu-button"
                      onClick={() => setShowNotificationsDropdown((p) => !p)}
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

                    {showNotificationsDropdown && (
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
                          zIndex: 200,
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
                                background: "rgba(185, 244, 61, 0.12)",
                                color: "var(--accent-green)",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                padding: "0.15rem 0.5rem",
                                borderRadius: "999px",
                                border: "1px solid rgba(185, 244, 61, 0.2)",
                              }}
                            >
                              {unreadNotificationCount} new
                            </span>
                          )}
                        </div>
                        <NotificationList
                          closeDropdown={() =>
                            setShowNotificationsDropdown(false)
                          }
                        />
                        <div
                          style={{
                            padding: "0.75rem",
                            borderTop: "1px solid var(--border-subtle)",
                            textAlign: "center",
                          }}
                        >
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotificationsDropdown(false)}
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              textDecoration: "none",
                              transition: "color 200ms",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.color = "var(--accent-green)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.color = "var(--text-muted)")
                            }
                          >
                            View all notifications →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  <NavLink
                    to={
                      user.username
                        ? `/profile/${user.username.toLowerCase()}`
                        : "/profile"
                    }
                    style={({ isActive }) => ({
                      ...navLinkStyle,
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

                  <button
                    onClick={handleLogout}
                    style={{
                      ...navLinkStyle,
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
                      ...navLinkStyle,
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
                      ...navLinkStyle,
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
          </motion.nav>
        </div>

        <div style={{ height: "80px" }} />

        <style>{`
          @media (max-width: 640px) {
            .hidden-mobile { display: none !important; }
          }
        `}</style>
      </>
    );
  }

  /* ─────────────────────────────────────────────────
     Default mode (all other pages)
  ───────────────────────────────────────────────── */
  const navState = scrolled ? "scrolled" : "top";

  const navVariants = {
    top: {
      width: Math.min(1100, clientWidth - 32),
      backgroundColor: "rgba(22, 22, 26, 0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 2px 16px rgba(0, 0, 0, 0.2)",
      padding: "0.75rem 1.5rem",
    },
    scrolled: {
      width: Math.min(780, clientWidth - 32),
      backgroundColor: "rgba(15, 15, 18, 0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      padding: "0.45rem 1.25rem",
    },
  };

  const navTransition = {
    width: symmetricTween,
    padding: symmetricTween,
    backgroundColor: symmetricTween,
    borderColor: symmetricTween,
    boxShadow: symmetricTween,
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "1rem",
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <motion.nav
          initial={navState}
          animate={navState}
          variants={navVariants}
          transition={navTransition}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            borderStyle: "solid",
            borderWidth: "1px",
            borderRadius: "999px",
            pointerEvents: "all",
            willChange: "width, padding, background-color",
            boxSizing: "border-box",
          }}
        >
          <Logo />

          <motion.form
            onSubmit={handleSearchSubmit}
            animate={{
              maxWidth: scrolled ? 0 : 320,
              opacity: scrolled ? 0 : 1,
            }}
            transition={{
              maxWidth: symmetricTween,
              opacity: { duration: 0.3 },
            }}
            style={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
              margin: 0,
              padding: 0,
            }}
            className="hidden-mobile"
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search DevLink..."
              tabIndex={scrolled ? -1 : 0}
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
          </motion.form>

          {/* Right-side links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                ...navLinkStyle,
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
              })}
            >
              Home
            </NavLink>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <div
                  style={{ position: "relative" }}
                  ref={notificationDropdownRef}
                >
                  <button
                    id="notifications-menu-button"
                    onClick={() => setShowNotificationsDropdown((p) => !p)}
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

                  {showNotificationsDropdown && (
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
                        zIndex: 200,
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
                              background: "rgba(185, 244, 61, 0.12)",
                              color: "var(--accent-green)",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              padding: "0.15rem 0.5rem",
                              borderRadius: "999px",
                              border: "1px solid rgba(185, 244, 61, 0.2)",
                            }}
                          >
                            {unreadNotificationCount} new
                          </span>
                        )}
                      </div>
                      <NotificationList
                        closeDropdown={() =>
                          setShowNotificationsDropdown(false)
                        }
                      />
                      <div
                        style={{
                          padding: "0.75rem",
                          borderTop: "1px solid var(--border-subtle)",
                          textAlign: "center",
                        }}
                      >
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotificationsDropdown(false)}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            textDecoration: "none",
                            transition: "color 200ms",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "var(--accent-green)")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "var(--text-muted)")
                          }
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <NavLink
                  to={
                    user.username
                      ? `/profile/${user.username.toLowerCase()}`
                      : "/profile"
                  }
                  style={({ isActive }) => ({
                    ...navLinkStyle,
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

                <button
                  onClick={handleLogout}
                  style={{
                    ...navLinkStyle,
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
                    ...navLinkStyle,
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
                    ...navLinkStyle,
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
        </motion.nav>
      </div>

      <div style={{ height: "80px" }} />

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
};

/* ── Shared sub-components ── */

const navLinkStyle = {
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

const Logo = () => (
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
);

const BellIcon = () => (
  <svg
    width="18"
    height="18"
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

export default Navbar;
