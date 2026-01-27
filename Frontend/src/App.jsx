import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all your pages
import AuthForm from "./AuthForm";
import CreateEvent from "./CreateEvents";
// import StudentDashboard from "./StudentDashboard"; // <--- This was missing!
import AdminDashboard from "./AdminDashboard";
import SocietyDashboard from "./SocietyDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Login/Signup Page (Home) */}
        <Route path="/" element={<AuthForm />} />

        {/* 2. Society Pages */}
        <Route path="/society-dashboard" element={<SocietyDashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />

        {/* 3. Student Page */}
        {/* <Route path="/student-dashboard" element={<StudentDashboard />} /> */}

        {/* 4. Admin Page */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;