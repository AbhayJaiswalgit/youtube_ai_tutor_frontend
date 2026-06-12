import React, { useState } from "react";
import { api } from "@tutor/api";

export default function ExtAuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = isLogin
        ? await api.login({ email, password })
        : await api.register({ name, email, password });

      const userData = {
        user_id: response.data.user_id,
        name: response.data.name,
      };

      // CRITICAL: Extension saves to chrome.storage
      chrome.storage.local.set(
        {
          jwtToken: response.data.access_token,
          userData: userData,
        },
        () => {
          onAuthSuccess(userData);
          onClose();
        },
      );
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed.");
    }
  };

  return (
    <div className="ext-modal-overlay" onClick={onClose}>
      <div className="ext-auth-card" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: "16px", textAlign: "center" }}>
          {isLogin ? "Sign In" : "Create Account"}
        </h3>
        {error && (
          <div
            style={{
              color: "#ff6b6b",
              fontSize: "12px",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--input-bg)",
                color: "var(--text-main)",
              }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: "var(--input-bg)",
              color: "var(--text-main)",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--border-color)",
              background: "var(--input-bg)",
              color: "var(--text-main)",
            }}
          />
          <button
            type="submit"
            style={{
              background: "var(--btn-primary)",
              color: "white",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "12px",
            color: "var(--btn-primary)",
            cursor: "pointer",
          }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </div>
      </div>
    </div>
  );
}
