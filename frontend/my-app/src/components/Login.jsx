import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../style/login.css"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const getErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
};
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential=await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Get Firebase ID token
    const firebaseToken = await user.getIdToken();
    console.log("Firebase Token:", firebaseToken);
      navigate("/dashboard");
    } catch (err) {
      setMessage(getErrorMessage(err.code));
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login to Your Account</h2>

        {message && <p className="login-message">{message}</p>}

        <div className="mb-4">
          <label className="input-label">Email</label>
          <input
            className="input-field"
            type="email"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="input-label">Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">Login</button>

        <p className="signup-text">
          Don’t have an account?{" "}
          <a href="/signup" className="signup-link">Sign up</a>
        </p>
      </form>
    </div>
  );
}
