import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authApi.login(username, password);
      setAuth(response.user, response.token);
      navigate("/admin");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(180deg, #E8F0FF 0%, #F5F9FF 50%, #FFFFFF 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className="bg-white rounded-2xl p-8 shadow-xl"
          style={{ border: "1px solid #e2e8f0" }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              to="/"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#1a1a1a",
                textDecoration: "none",
              }}
            >
              KDS Soccer
            </Link>
            <h1
              className="mt-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "24px",
                color: "#1a1a1a",
              }}
            >
              Admin Login
            </h1>
            <p
              className="mt-2"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#718096",
              }}
            >
              Sign in to manage the tournament
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 rounded-lg text-center"
              style={{
                backgroundColor: "#FEE2E2",
                color: "#DC2626",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#1a1a1a",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  border: "1px solid #e2e8f0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                }}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#1a1a1a",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  border: "1px solid #e2e8f0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                }}
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: "#1a1a1a",
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#FFFFFF",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#4a5568",
                textDecoration: "none",
              }}
              className="hover:opacity-70 transition-opacity"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
