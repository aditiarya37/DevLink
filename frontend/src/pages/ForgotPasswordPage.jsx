import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AuthCard = ({ children, title, subtitle, iconPath }) => (
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
            <path d={iconPath} />
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
          {title}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          {subtitle}
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
        {children}
      </div>
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          to="/login"
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            transition: "color 200ms",
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgotpassword`, {
        email,
      });
      setMessage(
        response.data.message ||
          "If an account with that email exists, a reset link has been sent.",
      );
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send a reset link"
      iconPath="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
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
          <label className="input-label">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
            autoComplete="email"
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
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
