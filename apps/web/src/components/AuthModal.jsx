import React, { useState } from "react";
import { api } from "@tutor/api";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      let response;
      if (isLoginView) {
        // Execute login request via shared package
        response = await api.login({ email, password });
      } else {
        // Execute registration request
        response = await api.register({ name, email, password });
      }

      // Save token dynamically to localStorage so our interceptor finds it
      localStorage.setItem("jwtToken", response.data.access_token);
      localStorage.setItem(
        "userData",
        JSON.stringify({
          user_id: response.data.user_id,
          name: response.data.name,
        }),
      );

      // Bubble event up to primary controller orchestrator
      onAuthSuccess(response.data);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.detail ||
          "Authentication failed. Please try again.",
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <h3>{isLoginView ? "Welcome Back" : "Create Your Account"}</h3>
        <p>
          {isLoginView
            ? "Sign in to access your saved AI study sessions"
            : "Start tracking notes, quizzes, and videos"}
        </p>

        {errorMessage && (
          <div
            style={{
              color: "#ff6b6b",
              fontSize: "13px",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isLoginView ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div
          className="auth-toggle-link"
          onClick={() => {
            setIsLoginView(!isLoginView);
            setErrorMessage("");
          }}
        >
          {isLoginView
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </div>
      </div>
    </div>
  );
}
