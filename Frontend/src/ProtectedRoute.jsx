import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "./supabase";

export default function ProtectedRoute({ allowedRole }) {
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    // 1. Check for "Fake Admin" (Developer Backdoor)
    const isFakeAdmin = localStorage.getItem("nep_admin_bypass");
    if (allowedRole === "admin" && isFakeAdmin === "true") {
      setIsAllowed(true);
      setLoading(false);
      return;
    }

    // 2. Check Real Supabase Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return; // Not logged in
    }

    // 3. Check Role in Database
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile && profile.role === allowedRole) {
      setIsAllowed(true);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center">Checking access...</div>;

  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
}