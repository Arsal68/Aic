import { useEffect, useState } from "react";
import { supabase } from "./supabase"; 
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingSocieties, setPendingSocieties] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);

  useEffect(() => { 
    fetchAllData(); 
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    // 1. Fetch societies that are pending approval
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "society")
      .eq("status", "pending");
      
    // 2. Fetch events that are pending approval
    const { data: evs } = await supabase
      .from("events")
      .select("*, societies(name)")
      .eq("status", "pending");

    setPendingSocieties(profs || []);
    setPendingEvents(evs || []);
    setLoading(false);
  };

  const approveSociety = async (id) => {
    // This is the fix: It updates the status so the login logic lets them in
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) alert(error.message);
    else fetchAllData();
  };

  const rejectSociety = async (id) => {
    if (!window.confirm("Delete this registration request?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) fetchAllData();
  };

  const handleEventAction = async (eventId, newStatus) => {
    const { error } = await supabase
      .from("events")
      .update({ status: newStatus })
      .eq("id", eventId);

    if (error) alert(error.message);
    else fetchAllData();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => {
              localStorage.removeItem("nep_admin_bypass");
              supabase.auth.signOut();
              navigate("/login", { replace: true });
            }} 
            className="bg-white px-4 py-2 rounded text-red-600 font-bold border"
          >
            Logout
          </button>
        </div>

        {/* SECTION: SOCIETY REQUESTS */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-orange-600">👤 Pending Society Registrations</h2>
          <div className="grid gap-4">
            {pendingSocieties.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{s.fullname}</p>
                  <p className="text-sm text-gray-500">@{s.username} | {s.email}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => approveSociety(s.id)} 
                    className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
                  >
                    Approve Society
                  </button>
                  <button 
                    onClick={() => rejectSociety(s.id)} 
                    className="text-red-500 font-semibold px-3"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingSocieties.length === 0 && <p className="text-gray-400 italic">No pending society requests.</p>}
          </div>
        </section>

        {/* SECTION: EVENT PROPOSALS */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-blue-700">📅 Pending Event Proposals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
                <p className="text-xs font-bold text-blue-600 mb-1 uppercase">
                  {event.societies?.name}
                </p>
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEventAction(event.id, "approved")} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">
                    Approve Event
                  </button>
                  <button onClick={() => handleEventAction(event.id, "rejected")} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded font-bold">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}