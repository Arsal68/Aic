import React, { useState, useEffect } from "react";
import { supabase } from "./supabase"; 
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");

  const [loginInput, setLoginInput] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 1. AUTO-LOGIN CHECK (Persistence) ---
  useEffect(() => {
    const checkSession = async () => {
      // Check Fake Admin Flag
      if (localStorage.getItem("nep_admin_bypass")) {
        navigate("/admin-dashboard", { replace: true });
        return;
      }

      // Check Real User Session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        
        if (profile) redirectUser(profile.role);
      }
    };
    checkSession();
  }, [navigate]);

  // Helper to handle navigation cleanly
  const redirectUser = (role) => {
    if (role === "society") navigate("/society-dashboard", { replace: true });
    else if (role === "admin") navigate("/admin-dashboard", { replace: true });
    else navigate("/student-dashboard", { replace: true });
  };

  const handleSignup = async () => {
    // 🛡️ SECURITY: Clear any ghost admin flags
    localStorage.removeItem("nep_admin_bypass");
    
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([{
        id: user.id,
        fullname,
        email,
        username,
        role,
      }]);

      if (profileError) {
        setError(profileError.message);
      } else {
        alert("Signup successful! You can now login.");
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    // --- 🔴 BACKDOOR ADMIN LOGIN ---
    if (loginInput === "admin" && password === "admin") {
      localStorage.setItem("nep_admin_bypass", "true"); 
      navigate("/admin-dashboard", { replace: true }); // Fix Back Button
      return;
    }

    // --- 🟢 REAL USER LOGIN ---
    // 🛡️ SECURITY: Clear any ghost admin flags
    localStorage.removeItem("nep_admin_bypass");
    
    setError("");
    setLoading(true);

    try {
      let loginEmail = loginInput;
      if (!loginInput.includes("@")) {
        const { data } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", loginInput)
          .single();

        if (data) loginEmail = data.email;
        else throw new Error("Username not found.");
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw new Error("Failed to fetch user profile.");

      // Use the helper with replace: true
      redirectUser(profile.role);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) handleLogin(e);
    else handleSignup();
  };

  const inputClasses = "px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg font-sans">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {!isLogin && (
          <>
            <input type="text" placeholder="Full Name" value={fullname} onChange={(e) => setFullname(e.target.value)} required className={inputClasses} />
            <input type="email" placeholder="Email (Cloud Email)" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className={inputClasses} />
          </>
        )}

        {isLogin && (
          <input type="text" placeholder="Email or Username" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} required className={inputClasses} />
        )}

        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />

        {!isLogin && (
          <>
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} />
            <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClasses} cursor-pointer`}>
              <option value="student">Student</option>
              <option value="society">Society</option>
            </select>
          </>
        )}

        <button type="submit" disabled={loading} className={`mt-4 py-3 rounded-lg font-semibold text-white shadow-md transition ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4 text-center font-medium whitespace-pre-line">{error}</p>}

      <p className="mt-6 text-center text-gray-600 text-sm">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button onClick={() => { setError(""); setIsLogin(!isLogin); }} className="text-red-600 underline cursor-pointer font-semibold">
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}