import React, { useState } from "react";
import { supabase } from "./supabase/supabase";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);

  // Signup state
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");

  // Common login/signup state
  const [loginInput, setLoginInput] = useState(""); // email OR username for login
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
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
    if (!user) {
      setError("Signup failed or email confirmation pending.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id,
        fullname,
        email,
        username,
        role,
      },
    ]);

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    alert("Signup successful! You can now login.");
    setLoading(false);
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    let loginEmail = loginInput;

    if (!loginInput.includes("@")) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("username", loginInput)
        .single();

      if (error || !data) {
        setError("Username not found.");
        setLoading(false);
        return;
      }

      if (data.role !== role) {
        setError("User role mismatch.");
        setLoading(false);
        return;
      }

      loginEmail = data.email;
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", loginInput)
        .single();

      if (error || !data) {
        setError("Email not found.");
        setLoading(false);
        return;
      }

      if (data.role !== role) {
        setError("User role mismatch.");
        setLoading(false);
        return;
      }
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    alert("Login successful!");
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) handleLogin();
    else handleSignup();
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg font-sans">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
        {isLogin ? "Welcome Back" : "Create Account"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col">
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              className={inputClasses}
            />
            <input
              type="email"
              placeholder="Email (Cloud Email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClasses}
            />
          </>
        )}

        {isLogin && (
          <input
            type="text"
            placeholder="Email or Username"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
            className={inputClasses}
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClasses}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={inputClasses}
          />
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`${inputClasses} cursor-pointer`}
        >
          <option value="student">Student</option>
          <option value="society">Society</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`mt-4 py-3 rounded-lg font-semibold text-white shadow-md transition-colors duration-300 ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      {error && (
        <p className="text-red-600 mt-4 text-center font-medium whitespace-pre-line">
          {error}
        </p>
      )}

      <p className="mt-6 text-center text-gray-600 text-sm">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setError("");
            setIsLogin(!isLogin);
          }}
          className="text-red-600 underline cursor-pointer font-semibold"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}

const inputClasses =
  "px-4 py-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
