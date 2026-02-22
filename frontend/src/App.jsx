import { useEffect } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

const AuthStateWatcher = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && location.pathname === "/auth/callback") {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-1)",
          color: "var(--text-secondary)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <AuthStateWatcher />
        <main style={{ flexGrow: 1 }}>
          <AppRoutes />
        </main>
        <footer
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "1.5rem 2rem",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--text-dim)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()}{" "}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--accent-green)",
            }}
          >
            DevLink
          </span>
          <span style={{ color: "var(--text-muted)" }}>
            {" "}
            — All rights reserved.
          </span>
        </footer>
      </div>
    </Router>
  );
}

export default App;
