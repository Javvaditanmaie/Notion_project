// src/pages/DashboardLanding.jsx

import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import React, { useEffect } from "react";
export default function DashboardLanding() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser]);


  return (
    <div className="fixed inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 flex flex-col justify-center items-center px-4">
      <div className="text-center text-white">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to CollabWrite ✨</h1>
        <p className="text-lg mb-8">Real-time collaborative document editing with secure access control.</p>
      </div>
      {/* Video Section */}
      <div className="w-full max-w-4xl mb-8 rounded-xl overflow-hidden shadow-lg">
        <video autoPlay muted loop playsInline className="w-full rounded-xl">
  <source src="/assets/landingpage.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

      </div>
      <div className="flex gap-6">
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
        >
          Sign Up
        </button>
      </div>

      <footer className="absolute bottom-4 text-white text-sm">
        © {new Date().getFullYear()} CollabWrite | Built with 💜
      </footer>
    </div>
  );
}
