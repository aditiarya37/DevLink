import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationList from "./NotificationList";

const Navbar = () => {
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
  const [menuOpen, setMenuOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        const bellButton = document.getElementById("notifications-menu-button");
        if (bellButton && !bellButton.contains(event.target)) {
          setShowNotificationsDropdown(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (authLoading && isAuthenticated === null) {
    return (
      <nav style={navWrapperStyle(false)}>
        <div style={navInnerStyle}>
          <Logo />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Loading...
          </span>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ── COMPACT PILL NAVBAR (default) ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          padding: "1rem",
          pointerEvents: "none",
        }}
      >
        <nav
          style={{
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            background: scrolled
              ? "rgba(15, 15, 18, 0.92)"
              : "rgba(22, 22, 26, 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "999px",
            padding: "0.45rem 0.6rem 0.45rem 1.25rem",
            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: scrolled
              ? "0 8px 32px rgba(0, 0, 0, 0.4)"
              : "0 2px 16px rgba(0, 0, 0, 0.2)",
            width: "100%",
            maxWidth: "780px",
          }}
        >
          <Logo />

          {/* Search – hidden on small screens */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: "280px",
              display: "flex",
              gap: "0",
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

          {/* Right side controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {/* Home link */}
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
                    aria-label="Notifications"
                    aria-expanded={showNotificationsDropdown}
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

                {/* Profile link */}
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
                  to="/login"
                  style={{ ...navLinkStyle, color: "var(--text-muted)" }}
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
        </nav>
      </div>

      {/* Spacer for fixed navbar */}
      <div style={{ height: "80px" }} />

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
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

const navWrapperStyle = (scrolled) => ({
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "rgba(15, 15, 18, 0.9)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid var(--border-subtle)",
  padding: "1rem 1.5rem",
});

const navInnerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

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
};

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
