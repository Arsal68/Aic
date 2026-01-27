import { useEffect, useState } from "react";
import { supabase } from "./supabase"; 
import { useNavigate } from "react-router-dom";

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [mySocietyName, setMySocietyName] = useState("");
  const [myEvents, setMyEvents] = useState([]); // Events created by THIS society
  const [allEvents, setAllEvents] = useState([]); // Feed of ALL approved events

  // View State (Tabs)
  const [activeTab, setActiveTab] = useState("my-events"); 

  useEffect(() => {
    fetchSocietyData();
  }, []);

  const fetchSocietyData = async () => {
    setLoading(true);
    
    // 1. Get Logged In User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/");

    // 2. Get Society ID linked to this user
    const { data: profile } = await supabase
      .from("profiles")
      .select("society_id, societies(name)")
      .eq("id", user.id)
      .single();

    if (!profile?.society_id) {
      alert("You are not linked to a society yet!");
      return navigate("/");
    }

    setMySocietyName(profile.societies?.name);

    // 3. Fetch "My Events" (History)
    const { data: myEventsData } = await supabase
      .from("events")
      .select("*")
      .eq("society_id", profile.society_id)
      .order("created_at", { ascending: false });

    setMyEvents(myEventsData || []);

    // 4. Fetch "Campus Feed" (Approved events from everyone)
    // We specifically select 'societies(name)' to show who posted it
    const { data: feedData } = await supabase
      .from("events")
      .select(`*, societies(name)`) 
      .eq("status", "approved")
      .order("event_date", { ascending: true });

    setAllEvents(feedData || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- Navbar --- */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800">NEDConnect</h1>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
            {mySocietyName}
          </p>
        </div>
        <div className="flex gap-4">
            <button 
              onClick={() => navigate("/create-event")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-md"
            >
            + New Event
            </button>
            <button onClick={handleLogout} className="text-red-600 text-sm font-medium hover:underline">
              Logout
            </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`pb-3 px-4 font-medium text-sm transition ${activeTab === 'my-events' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('my-events')}
          >
            My Proposals & History
          </button>
          <button 
            className={`pb-3 px-4 font-medium text-sm transition ${activeTab === 'feed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('feed')}
          >
            Campus Feed (Approved Events)
          </button>
        </div>

        {/* --- VIEW 1: MY EVENTS (History) --- */}
        {activeTab === 'my-events' && (
          <div>
            {myEvents.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-2">You haven't created any events yet.</p>
                    <button onClick={() => navigate("/create-event")} className="text-blue-600 font-bold hover:underline">Create your first event</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEvents.map((event) => (
                    <div key={event.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{event.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">📅 {event.event_date}</p>
                        
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            event.status === 'approved' ? 'bg-green-100 text-green-700' :
                            event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {event.status}
                        </span>
                    </div>
                    {event.poster_url && (
                        <img src={event.poster_url} alt="Poster" className="w-16 h-16 object-cover rounded bg-gray-100" />
                    )}
                    </div>
                ))}
                </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: CAMPUS FEED (Corrected to show Name) --- */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow overflow-hidden transition hover:shadow-lg">
                <div className="h-40 bg-gray-200">
                    {event.poster_url ? (
                      <img src={event.poster_url} className="w-full h-full object-cover"/> 
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-4xl">📅</div>
                    )}
                </div>
                <div className="p-4">
                    {/* 👇 This is the Society Name (Username) */}
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                         {event.societies?.name?.charAt(0) || "S"}
                       </div>
                       <p className="text-sm text-blue-800 font-bold">
                         {event.societies?.name || "Unknown Society"}
                       </p>
                    </div>
                    
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.event_date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}