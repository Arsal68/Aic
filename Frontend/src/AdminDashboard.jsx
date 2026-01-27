import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [users, setUsers] = useState([]);
  const [societies, setSocieties] = useState([]);
  
  // Form State
  const [newSocietyName, setNewSocietyName] = useState("");
  const [selectedSociety, setSelectedSociety] = useState(""); // ID of society to assign

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    // 1. Security Check: Are you an Admin?
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return navigate("/");

    // const { data: profile } = await supabase
    //   .from("profiles")
    //   .select("role")
    //   .eq("id", user.id)
    //   .single();

    // if (profile?.role !== "admin") {
    //   alert("Access Denied: You are not an Admin.");
    //   return navigate("/");
    // }

    // 2. Fetch Data
    fetchUsers();
    fetchSocieties();
  };

  const fetchUsers = async () => {
    // Fetch users who registered as 'society' but have NO society_id yet
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "society")
      .is("society_id", null);
    setUsers(data || []);
    setLoading(false);
  };

  const fetchSocieties = async () => {
    const { data } = await supabase.from("societies").select("*");
    setSocieties(data || []);
  };

  // ACTION 1: Create a New Society
  const handleCreateSociety = async (e) => {
    e.preventDefault();
    if (!newSocietyName) return;

    const { error } = await supabase.from("societies").insert([{ name: newSocietyName }]);

    if (error) alert(error.message);
    else {
      setNewSocietyName("");
      fetchSocieties(); // Refresh list
    }
  };

  // ACTION 2: Link a User to a Society
  const handleLinkUser = async (userId) => {
    if (!selectedSociety) return alert("Please select a society from the dropdown first.");

    const { error } = await supabase
      .from("profiles")
      .update({ society_id: selectedSociety })
      .eq("id", userId);

    if (error) alert(error.message);
    else {
      alert("User linked successfully!");
      fetchUsers(); // Refresh list to remove that user
    }
  };

  if (loading) return <div className="p-10 text-center">Verifying Admin Access...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: Create New Society */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-blue-700">1. Add New Society</h2>
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

          {/* List of Existing Societies */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Existing Societies:</h3>
            <div className="flex flex-wrap gap-2">
              {societies.map(soc => (
                <span key={soc.id} className="bg-gray-200 px-2 py-1 rounded text-xs">
                  {soc.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: Pending Society Approvals */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-orange-600">2. Pending Approvals</h2>
          <p className="text-sm text-gray-500 mb-4">These users signed up as "Society" but aren't linked yet.</p>

          {users.length === 0 ? (
             <p className="text-gray-400 italic">No pending users found.</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border p-3 rounded-lg flex flex-col gap-2 bg-gray-50">
                  <div>
                    <p className="font-bold">{user.fullname}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Dropdown to pick society */}
                    <select 
                      className="border p-1 rounded text-sm w-full"
                      onChange={(e) => setSelectedSociety(e.target.value)}
                    >
                      <option value="">-- Assign Society --</option>
                      {societies.map(soc => (
                        <option key={soc.id} value={soc.id}>{soc.name}</option>
                      ))}
                    </select>
                    
                    <button 
                      onClick={() => handleLinkUser(user.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}