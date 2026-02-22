import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaGithub, FaGoogle } from "react-icons/fa";

const RegisterPage = () => {
  const {
    register,
    error: authError,
    clearErrors,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setSuccessMessage("Account created! Redirecting...");
      const timer = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => () => clearErrors(), [clearErrors]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError("");
    if (successMessage) setSuccessMessage("");
    if (authError) clearErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    if (authError) clearErrors();
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.username,
      });
    } catch (err) {
      console.error("Register error:", err);
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
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
            Join DevLink
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Build your developer presence
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
          {/* Messages */}
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
          {successMessage && (
            <div
              style={{
                background: "rgba(185,244,61,0.08)",
                border: "1px solid rgba(185,244,61,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                color: "var(--accent-green)",
                fontSize: "0.85rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <label className="input-label">Username *</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="devhero"
                  autoComplete="username"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
              <div>
                <label className="input-label">Display Name</label>
                <input
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Dev Hero"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>
            </div>
            <div>
              <label className="input-label">Email *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label className="input-label">Password *</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="input-field"
                placeholder="••••••••"
                style={{ fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label className="input-label">Confirm Password *</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                className="input-field"
                placeholder="••••••••"
                style={{ fontSize: "0.875rem" }}
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
              {authLoading ? "Creating account..." : "Create Account"}
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
              OR SIGN UP WITH
            </span>
            <hr
              style={{
                flex: 1,
                border: "none",
                borderTop: "1px solid var(--border-subtle)",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {[
              {
                href: `${import.meta.env.VITE_API_BASE_URL}/auth/github`,
                icon: <FaGithub size={16} />,
                label: "Continue with GitHub",
              },
              {
                href: `${import.meta.env.VITE_API_BASE_URL}/auth/google`,
                icon: <FaGoogle size={16} />,
                label: "Continue with Google",
              },
            ].map((btn) => (
              <a
                key={btn.label}
                href={btn.href}
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
                  transition:
                    "background 200ms, border-color 200ms, color 200ms",
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
                {btn.icon} {btn.label}
              </a>
            ))}
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
          Already a member?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--accent-green)",
              textDecoration: "none",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
