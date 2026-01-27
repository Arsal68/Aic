import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your pages
import AuthForm from "./AuthForm";
import CreateEvent from "./CreateEvents"; 
import AdminDashboard from "./AdminDashboard";

function App() {
  // ❌ DO NOT put useNavigate() here. It will crash the app.
  // ❌ DO NOT put useEffect() here checking for login.
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;