import { useEffect, useState } from "react";
import { supabase } from "./supabase"; // Check path
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]); // <--- NEW
  
  // Form State
  const [newSocietyName, setNewSocietyName] = useState("");
  const [selectedSociety, setSelectedSociety] = useState(""); 

  useEffect(() => {
    // 1. Fetch all data needed for the dashboard
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchSocieties(), fetchPendingEvents()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "society")
      .is("society_id", null);
    setUsers(data || []);
  };

  const fetchSocieties = async () => {
    const { data } = await supabase.from("societies").select("*");
    setSocieties(data || []);
  };

  // --- NEW: Fetch events that need approval ---
  const fetchPendingEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        societies ( name )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
      
    if (error) console.error("Error fetching events:", error);
    setPendingEvents(data || []);
  };

  // ACTION: Approve or Reject Event
  const handleEventAction = async (eventId, newStatus) => {
    const { error } = await supabase
      .from("events")
      .update({ status: newStatus })
      .eq("id", eventId);

    if (error) alert(error.message);
    else {
      // Refresh the list to remove the handled event
      fetchPendingEvents();
    }
  };

  // ACTION: Create Society
  const handleCreateSociety = async (e) => {
    e.preventDefault();
    if (!newSocietyName) return;
    const { error } = await supabase.from("societies").insert([{ name: newSocietyName }]);
    if (error) alert(error.message);
    else {
      setNewSocietyName("");
      fetchSocieties();
    }
  };

  // ACTION: Link User
  const handleLinkUser = async (userId) => {
    if (!selectedSociety) return alert("Select a society first.");
    const { error } = await supabase
      .from("profiles")
      .update({ society_id: selectedSociety })
      .eq("id", userId);
    if (error) alert(error.message);
    else fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button 
            onClick={() => navigate("/")} 
            className="text-red-600 font-semibold hover:underline"
          >
            Logout
          </button>
        </div>

        {/* SECTION 1: EVENT APPROVAL (The New Part) */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
            📅 Pending Event Proposals
          </h2>
          
          {pendingEvents.length === 0 ? (
            <p className="text-gray-500 italic">No pending events to review.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-400">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {event.societies?.name || "Unknown Society"}
                    </span>
                    <span className="text-xs text-gray-400">{event.event_date}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => handleEventAction(event.id, "approved")}
                      className="flex-1 bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleEventAction(event.id, "rejected")}
                      className="flex-1 bg-red-100 text-red-600 py-2 rounded font-semibold hover:bg-red-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* SECTION 2: USER & SOCIETY MANAGEMENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Create Society */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">🏢 Add New Society</h2>
            <form onSubmit={handleCreateSociety} className="flex gap-2">
              <input 
                type="text" 
                className="border p-2 rounded w-full" 
                placeholder="e.g. Debating Society"
                value={newSocietyName}
                onChange={(e) => setNewSocietyName(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                Add
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {societies.map(soc => (
                <span key={soc.id} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border">
                  {soc.name}
                </span>
              ))}
            </div>
          </div>

          {/* Approve Users */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-orange-600">👤 Pending Society Accounts</h2>
            {users.length === 0 ? (
               <p className="text-gray-400 italic">All users are assigned.</p>
            ) : (
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="border p-3 rounded-lg bg-gray-50">
                    <p className="font-bold text-sm">{user.fullname}</p>
                    <p className="text-xs text-gray-500 mb-2">{user.email}</p>
                    <div className="flex gap-2">
                      <select 
                        className="border p-1 rounded text-sm w-full"
                        onChange={(e) => setSelectedSociety(e.target.value)}
                      >
                        <option value="">Select Society...</option>
                        {societies.map(soc => (
                          <option key={soc.id} value={soc.id}>{soc.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleLinkUser(user.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}