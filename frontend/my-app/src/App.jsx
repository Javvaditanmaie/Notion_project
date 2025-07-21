import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./components/Editor.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import DashboardLanding from "./pages/DashboardLanding";

import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/editor/:id" element={<Editor />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doc/:docId"
            element={
              <PrivateRoute>
                <Editor />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/documents/:id"
            element={
              <PrivateRoute>
                <DocumentPage />
              </PrivateRoute>
            }
          /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
