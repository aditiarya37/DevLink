import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const ResetPasswordPage = () => {
  const { token: resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/resetpassword/${resetToken}`,
        { password },
      );
      setMessage(
        response.data.message || "Password reset successfully! Redirecting...",
      );
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The link may be expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "#f87171",
            marginBottom: "1rem",
          }}
        >
          Invalid Reset Link
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          This password reset link is missing or invalid.
        </p>
        <Link
          to="/forgot-password"
          style={{
            color: "var(--accent-green)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Request a new link →
        </Link>
      </div>
    );
  }

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
      <div style={{ width: "100%", maxWidth: "420px" }}>
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              marginBottom: "0.5rem",
            }}
          >
            Reset Password
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Enter your new password below
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {message && (
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
              {message}
            </div>
          )}
          {error && (
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
              {error}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label className="input-label">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: "0.7rem",
                fontSize: "0.9rem",
                width: "100%",
                justifyContent: "center",
                marginTop: "0.25rem",
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            to="/login"
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--accent-green)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
