import React from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function ProtectedRoute({ role, children }) {
  const [loading, setLoading] = React.useState(true);
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !profile) {
        setAuthorized(false);
      } else {
        setAuthorized(role ? profile.role === role : true);
      }
      setLoading(false);
    }

    checkAuth();
  }, [role]);

  if (loading) return <div>Loading...</div>;

  if (!authorized) return <Navigate to="/auth" replace />;

  return children;
}
