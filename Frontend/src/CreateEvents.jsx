import { useState, useEffect } from "react";
import { supabase } from "./supabase"; // Adjust path if needed
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();
  
  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [posterFile, setPosterFile] = useState(null);

  // System States
  const [societyId, setSocietyId] = useState(null);
  const [societyName, setSocietyName] = useState(""); // For display only
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. On Load: Identify the Society
  useEffect(() => {
    const fetchUserSociety = async () => {
      // Get logged in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch profile to get society_id
      // We join the 'societies' table to get the readable name
      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          society_id,
          societies ( name )
        `)
        .eq("id", user.id)
        .single();

      if (error || !profile?.society_id) {
        setMessage({ type: "error", text: "You are not linked to any Society account." });
      } else {
        setSocietyId(profile.society_id);
        // Access nested data from the join
        setSocietyName(profile.societies?.name || "Unknown Society");
      }
      setLoading(false);
    };

    fetchUserSociety();
  }, [navigate]);

  // 2. Handle Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      if (!societyId) throw new Error("Unauthorized: No Society ID found.");

      let posterUrl = null;

      // A. Upload Poster (if exists)
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${societyId}/${fileName}`; // Organize folders by society

        const { error: uploadError } = await supabase.storage
          .from('posters') // Ensure this bucket exists in Supabase
          .upload(filePath, posterFile);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: urlData } = supabase.storage
          .from('posters')
          .getPublicUrl(filePath);
        
        posterUrl = urlData.publicUrl;
      }

      // B. Insert Event into Database
      const { error: insertError } = await supabase
        .from("events")
        .insert([
          {
            title,
            description,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime, // Can be null based on your schema
            venue,
            poster_url: posterUrl,
            society_id: societyId, // AUTOMATICALLY LINKED
            status: "pending"      // Default status
          },
        ]);

      if (insertError) throw insertError;

      // C. Success
      setMessage({ type: "success", text: "Event submitted! Status is currently PENDING approval." });
      // Reset Form
      setTitle(""); setDescription(""); setEventDate(""); 
      setStartTime(""); setEndTime(""); setVenue(""); setPosterFile(null);

    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Checking Society Permissions...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl border border-gray-200">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create New Event</h2>
        
        {/* Read-Only Badge showing who is posting */}
        <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg inline-block text-sm font-semibold">
          Posting as: {societyName}
        </div>

        {message.text && (
          <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title</label>
            <input 
              className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="e.g. Annual Tech Symposium" 
              value={title} onChange={(e) => setTitle(e.target.value)} required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              rows="4"
              className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Event details..." 
              value={description} onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" className="mt-1 w-full border border-gray-300 p-3 rounded-lg" 
                value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" className="mt-1 w-full border border-gray-300 p-3 rounded-lg" 
                value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time (Optional)</label>
              <input type="time" className="mt-1 w-full border border-gray-300 p-3 rounded-lg" 
                value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input 
              className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="e.g. Main Auditorium" 
              value={venue} onChange={(e) => setVenue(e.target.value)} required 
            />
          </div>

          {/* Poster Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Poster (Image)</label>
            <input 
              type="file" accept="image/*"
              className="mt-1 w-full border border-gray-300 p-2 rounded-lg bg-gray-50"
              onChange={(e) => setPosterFile(e.target.files[0])} 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={submitting || !societyId} 
              className={`w-full text-white font-bold py-3 rounded-lg transition shadow-md 
                ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {submitting ? "Submitting..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}