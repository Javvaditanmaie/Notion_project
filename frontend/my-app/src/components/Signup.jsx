import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../style/signup.css"; 

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const getSignupError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please use a different one.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password sign-up is not enabled. Please contact support.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
};
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Signup successful ✅");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(getSignupError(error.code));
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h2 className="signup-title">Create an Account</h2>

        <div className="mb-4">
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="mb-6">
          <label className="input-label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" className="signup-button">Sign Up</button>

        {message && <p className="signup-message">{message}</p>}

        <p className="signup-footer">
          Already have an account?{" "}
          <a href="/login" className="signup-link">Login</a>
        </p>
      </form>
    </div>
  );
}
