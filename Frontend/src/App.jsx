import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage"; // Import your new Landing Page
import AuthForm from "./AuthForm";
import CreateEvent from "./CreateEvents";
import StudentDashboard from "./StudentDashboard"; 
import AdminDashboard from "./AdminDashboard";
import SocietyDashboard from "./SocietyDashboard";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Root is now the Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Login is its own explicit route */}
        <Route path="/login" element={<AuthForm />} />

        {/* Protected Society Routes */}
        <Route element={<ProtectedRoute allowedRole="society" />}>
          <Route path="/society-dashboard" element={<SocietyDashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Protected Admin Route */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;