import { useEffect, useState } from "react";
import { supabase } from "./supabase"; 
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState(new Set()); 
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // --- NEW: Modal & Form State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    roll_number: "",
    phone_number: "",
    department: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/"); return; }
    setUserId(user.id);

    // 1. Fetch Approved Events
    const { data: eventsData } = await supabase
      .from("events")
      .select(`*, societies ( name )`)
      .eq("status", "approved")
      .order('event_date', { ascending: true });
    setEvents(eventsData || []);

    // 2. Fetch My Registrations
    const { data: regData } = await supabase
      .from("registrations")
      .select("event_id")
      .eq("student_id", user.id);
    
    if (regData) {
      setMyRegistrations(new Set(regData.map(r => r.event_id)));
    }
    setLoading(false);
  };

  // --- ACTION: Open Registration Form ---
  const openRegistrationForm = (event) => {
    setSelectedEvent(event);
    setFormData({ ...formData, full_name: "", roll_number: "", phone_number: "", department: "" }); // Reset form
    setShowModal(true);
  };

  // --- ACTION: Submit Registration ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const { error } = await supabase.from("registrations").insert([{
      event_id: selectedEvent.id,
      student_id: userId,
      full_name: formData.full_name,
      roll_number: formData.roll_number,
      phone_number: formData.phone_number,
      department: formData.department
    }]);

    if (error) {
      alert("Registration failed: " + error.message);
    } else {
      alert("✅ Successfully Registered!");
      // Update local state
      const newSet = new Set(myRegistrations);
      newSet.add(selectedEvent.id);
      setMyRegistrations(newSet);
      setShowModal(false);
    }
  };

  // --- ACTION: Cancel Registration ---
  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) return;
    
    const { error } = await supabase
      .from("registrations")
      .delete()
      .match({ event_id: eventId, student_id: userId });

    if (error) alert(error.message);
    else {
      const newSet = new Set(myRegistrations);
      newSet.delete(eventId);
      setMyRegistrations(newSet);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  // Filter events for "My Upcoming Events" column
  const myUpcomingEvents = events.filter(e => myRegistrations.has(e.id));

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight">NED Event Feed</h1>
        <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-red-600">Logout</button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
        
        {/* --- LEFT COLUMN: Main Feed (70%) --- */}
        <div className="lg:w-3/4">
           <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Events</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const isRegistered = myRegistrations.has(event.id);
                return (
                  <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="h-48 bg-gray-200 relative">
                        {event.poster_url ? <img src={event.poster_url} className="w-full h-full object-cover"/> : <div className="flex h-full items-center justify-center text-3xl">📅</div>}
                        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-bold shadow">
                          {event.societies?.name}
                        </div>
                    </div>
                    <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
                           <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{event.event_date}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                        
                        {isRegistered ? (
                          <button 
                            onClick={() => handleCancelRegistration(event.id)}
                            className="w-full py-2 rounded-lg bg-green-100 text-green-700 border border-green-200 font-bold text-sm hover:bg-red-100 hover:text-red-600 hover:border-red-200 transition"
                          >
                            ✅ Registered (Click to Cancel)
                          </button>
                        ) : (
                          <button 
                            onClick={() => openRegistrationForm(event)}
                            className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition shadow-md"
                          >
                            Register Now
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* --- RIGHT COLUMN: My Schedule (30%) --- */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🗓️ My Schedule
            </h2>
            {myUpcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm italic">You haven't registered for any events yet.</p>
            ) : (
              <div className="space-y-4">
                {myUpcomingEvents.map(event => (
                  <div key={event.id} className="border-l-4 border-blue-500 pl-3 py-1">
                    <p className="font-bold text-sm text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.event_date} • {event.societies?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- MODAL: Registration Form --- */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-5">
              <h3 className="text-white font-bold text-lg">Register for {selectedEvent.title}</h3>
              <p className="text-blue-100 text-xs">Please fill in your details for the society.</p>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                 <input required type="text" className="w-full border rounded p-2" 
                   value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Roll Number</label>
                    <input required type="text" className="w-full border rounded p-2" placeholder="CS-22001"
                      value={formData.roll_number} onChange={e => setFormData({...formData, roll_number: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                    <input required type="tel" className="w-full border rounded p-2" placeholder="0300..."
                      value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
                 <select required className="w-full border rounded p-2 bg-white"
                   value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} >
                    <option value="">Select Dept...</option>
                    <option value="CS">Computer Science</option>
                    <option value="SE">Software Engineering</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                 </select>
               </div>

               <div className="flex gap-3 mt-6">
                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded">Cancel</button>
                 <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Submit</button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}