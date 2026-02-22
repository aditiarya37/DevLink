import React from "react";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  return (
    <div
      style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.25rem" }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "1.75rem",
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          marginBottom: "1rem",
        }}
      >
        Dashboard
      </h1>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {user ? (
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>
            Welcome back,{" "}
            <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>
              {user.displayName || user.username}
            </span>
            !
          </p>
        ) : (
          <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
            Loading user data...
          </p>
        )}
        <p
          style={{
            marginTop: "0.75rem",
            fontSize: "0.875rem",
            color: "var(--text-muted)",
          }}
        >
          This is a protected area.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
