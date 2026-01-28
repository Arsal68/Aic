import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import { 
  Users, LogOut, LayoutDashboard, ChevronLeft, ChevronRight,
  Users2, Award, Target, Calendar, MapPin, Clock, Search
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data States
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [allSocieties, setAllSocieties] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // UI States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/login");

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setUserProfile(profile);

    const { data: eventsData } = await supabase.from("events").select(`*, societies ( name, id )`).eq("status", "approved").order('event_date', { ascending: true });
    setEvents(eventsData || []);
    setFilteredEvents(eventsData || []);

    const { data: regData } = await supabase.from("registrations").select(`*, events (*)`).eq("student_id", user.id);
    setMyRegistrations(regData || []);

    // Fetch Societies with Profile (username) and Event count
    const { data: socData } = await supabase.from("societies").select(`*, profiles (username), events (count)`);
    setAllSocieties(socData || []);
    setLoading(false);
  };

  useEffect(() => {
    let result = events;
    if (selectedCategory !== "All Categories") result = result.filter(e => e.event_type === selectedCategory);
    if (selectedDate) result = result.filter(e => e.event_date === selectedDate);
    setFilteredEvents(result);
  }, [selectedCategory, selectedDate, events]);

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/"); };

  // Calendar logic
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const hasEvent = events.some(e => e.event_date === dateStr);
      days.push(
        <button key={d} onClick={() => setSelectedDate(isSelected ? null : dateStr)}
          className={`h-8 w-8 flex items-center justify-center text-xs rounded-lg transition relative ${isSelected ? "bg-blue-600 text-white font-bold" : "text-gray-600 hover:bg-blue-50"} ${hasEvent && !isSelected ? "text-blue-600 font-extrabold" : ""}`}>
          {d} {hasEvent && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>}
        </button>
      );
    }
    return days;
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-sans text-gray-500">Loading Student Portal...</div>;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">N</div>
            <h1 className="font-bold text-lg">NEDConnect</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveNav("dashboard")} className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left transition ${activeNav === "dashboard" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
            <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
          </button>
          <button onClick={() => setActiveNav("societies")} className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left transition ${activeNav === "societies" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
            <Users className="w-5 h-5" /><span>Societies</span>
          </button>
          <button onClick={handleLogout} className="flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left text-red-500 hover:bg-red-50 mt-auto">
            <LogOut className="w-5 h-5" /><span>Logout</span>
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-64 overflow-auto">
        {activeNav === "dashboard" ? (
          <div className="p-8 flex gap-8">
            {/* FEED SECTION */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-gray-900 font-asset">Welcome, {userProfile?.fullname?.split(' ')[0]}</h2>
                <p className="text-gray-600">Discover what's happening at NED University.</p>
              </div>

              {/* FILTERS */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-3">
                  {["All Categories", "Technical", "Cultural", "Sports", "Social"].map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-700 border hover:bg-gray-50"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* EVENT GRID */}
              <div className="grid grid-cols-2 gap-6">
                {filteredEvents.map((event) => {
                   const socName = event.societies?.name || "Society";
                   const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(socName)}&background=random&color=fff`;
                   return (
                    <div 
                      key={event.id} 
                      onClick={() => { setSelectedEvent(event); setShowDetailModal(true); }} 
                      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer flex space-x-4 group"
                    >
                      <div className="text-center border-r pr-4 min-w-[60px]">
                        <p className="text-xs font-bold text-blue-600 uppercase">{new Date(event.event_date).toLocaleString('default', { month: 'short' })}</p>
                        <p className="text-3xl font-black text-gray-900 group-hover:text-blue-600">{new Date(event.event_date).getDate()}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 leading-tight mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-500 mb-3">{event.venue} • {event.start_time}</p>
                        <div className="flex items-center gap-2">
                           <img src={avatar} className="w-4 h-4 rounded-full" />
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{socName}</span>
                        </div>
                      </div>
                    </div>
                   );
                })}
              </div>
            </div>

            {/* SIDEBAR WIDGETS */}
            <div className="w-80 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4 font-bold">
                  <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <div className="flex gap-1"><button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><ChevronLeft size={16}/></button><button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><ChevronRight size={16}/></button></div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-gray-400 mb-2 text-center uppercase tracking-widest">{["S","M","T","W","T","F","S"].map(d=><span key={d}>{d}</span>)}</div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CalendarIcon size={18} className="text-blue-600" /> My Schedule</h3>
                <div className="space-y-4">
                  {myRegistrations.length === 0 ? <p className="text-xs text-gray-400 italic">No registrations yet.</p> : 
                    myRegistrations.slice(0, 4).map(reg => (
                    <div key={reg.id} className="flex items-center space-x-3 border-b pb-3 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <div className="flex-1 truncate"><p className="text-sm font-bold text-gray-800 truncate">{reg.events?.title}</p><p className="text-[10px] text-gray-500">{reg.events?.event_date}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SOCIETIES UI (MATCHING YOUR REQUEST) */
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-8 py-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Societies</h1>
              <p className="text-gray-600">Join the communities that drive the campus culture.</p>
            </header>

            <div className="p-8">
              {/* STATS BAR */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                  <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Total</p><p className="text-3xl font-bold">{allSocieties.length}</p></div>
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                  <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Members</p><p className="text-3xl font-bold">1.2k</p></div>
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><Users2 size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                  <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Events</p><p className="text-3xl font-bold">{events.length}</p></div>
                  <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Award size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                  <div><p className="text-xs text-gray-500 font-bold uppercase mb-1">Literature</p><p className="text-3xl font-bold">2</p></div>
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Target size={24}/></div>
                </div>
              </div>

              {/* SOCIETY GRID */}
              <div className="grid grid-cols-3 gap-6">
                {allSocieties.map(soc => (
                  <div key={soc.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition flex flex-col group">
                    <div className="h-32 bg-gray-50 border-b flex items-center justify-center relative">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition">
                        {soc.name[0]}
                      </div>
                      <span className="absolute top-3 right-3 bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">Official</span>
                    </div>
                    <div className="p-6 flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-1">{soc.name}</h3>
                      <p className="text-xs text-blue-400 font-bold mb-3">@{soc.profiles?.[0]?.username || "society"}</p>
                      <p className="text-xs text-gray-500 leading-relaxed italic mb-6">Promoting excellence, creativity, and student leadership through quality events and workshops.</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setActiveNav("dashboard"); setFilteredEvents(events.filter(e => e.society_id === soc.id)); }} className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">View Events</button>
                        <button className="flex-1 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50">Join</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIXED MODAL (Moved outside the ml-64 to ensure it centers correctly) */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="h-32 bg-blue-600 p-6 flex items-end">
              <h2 className="text-2xl font-bold text-white leading-tight">{selectedEvent.title}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm"><CalendarIcon size={16} className="text-blue-500"/> {selectedEvent.event_date}</div>
                <div className="flex items-center gap-2 text-gray-600 text-sm"><Clock size={16} className="text-blue-500"/> {selectedEvent.start_time} - {selectedEvent.end_time || "TBA"}</div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm"><MapPin size={16} className="text-blue-500"/> {selectedEvent.venue}</div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedEvent.description}</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowDetailModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition">Close</button>
                {myRegistrations.some(r => r.event_id === selectedEvent.id) ? (
                  <button className="flex-1 py-3 bg-green-100 text-green-700 font-bold rounded-xl">Registered ✓</button>
                ) : (
                  <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">Register Now</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component or inline Icon Helper
const CalendarIconSmall = (props) => <CalendarIcon {...props} />;

export default StudentDashboard;