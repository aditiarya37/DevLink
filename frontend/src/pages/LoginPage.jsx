import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const {
    login,
    error: authError,
    clearErrors,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => () => clearErrors(), [clearErrors]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError("");
    if (authError) clearErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (authError) clearErrors();
    if (!formData.emailOrUsername || !formData.password) {
      setFormError("Please fill in all fields.");
      return;
    }
    try {
      await login(formData);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              width: "44px",
              height: "44px",
              background: "var(--accent-green)",
              borderRadius: "12px",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0d"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "2rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "0.5rem",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Sign in to your DevLink account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Error */}
          {(formError || authError) && (
            <div
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                color: "#f87171",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              {formError || authError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="input-label">Email or Username</label>
              <input
                name="emailOrUsername"
                type="text"
                value={formData.emailOrUsername}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
                autoComplete="username"
              />
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label className="input-label">Password</label>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "0.72rem",
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
                  Forgot?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="btn-primary"
              style={{
                marginTop: "0.25rem",
                padding: "0.7rem",
                fontSize: "0.9rem",
                width: "100%",
                justifyContent: "center",
              }}
            >
              {authLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1.5rem 0",
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
                fontSize: "0.72rem",
                color: "var(--text-dim)",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              OR CONTINUE WITH
            </span>
            <hr
              style={{
                flex: 1,
                border: "none",
                borderTop: "1px solid var(--border-subtle)",
              }}
            />
          </div>

          {/* OAuth */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <OAuthButton
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/github`}
              icon={<FaGithub size={16} />}
              label="Continue with GitHub"
            />
            <OAuthButton
              href={`${import.meta.env.VITE_API_BASE_URL}/auth/google`}
              icon={<FaGoogle size={16} />}
              label="Continue with Google"
            />
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
          }}
        >
          No account?{" "}
          <Link
            to="/register"
            style={{
              color: "var(--accent-green)",
              textDecoration: "none",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Join DevLink
          </Link>
        </p>
      </div>
    </div>
  );
};

const OAuthButton = ({ href, icon, label }) => (
  <a
    href={href}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.65rem",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--border-card)",
      borderRadius: "var(--radius-md)",
      padding: "0.65rem",
      color: "var(--text-secondary)",
      fontSize: "0.875rem",
      fontFamily: "var(--font-body)",
      fontWeight: 500,
      textDecoration: "none",
      transition: "background 200ms, border-color 200ms, color 200ms",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
      e.currentTarget.style.borderColor = "var(--border-hover)";
      e.currentTarget.style.color = "var(--text-primary)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      e.currentTarget.style.borderColor = "var(--border-card)";
      e.currentTarget.style.color = "var(--text-secondary)";
    }}
  >
    {icon}
    {label}
  </a>
);

export default LoginPage;
