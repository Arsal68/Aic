import React, { useState } from "react";
import {  
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Homepage = () => {
  const [activeNav, setActiveNav] = useState("dashboard");

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
    console.log(`Navigated to: ${navItem}`);
    // You can add routing logic here later
  };

  const featuredEvents = [
    {
      title: "NED Tech Fiesta 2024",
      description: "Registration closes this Friday. Win prizes up to PKR 50k.",
      image: "technical",
      buttonText: "Register Now",
      category: "TECHNICAL",
    },
    {
      title: "Annual Mushaira Night",
      description: "An evening of classical poetry. Main Auditorium.",
      image: "cultural",
      buttonText: "Get Tickets",
      category: "CULTURAL",
    },
  ];

  const registeredEvents = [
    {
      date: "12",
      month: "OCT",
      title: "Web Dev Bootcamp",
      details: "Cisco Lab - 09:00 AM",
      status: "CONFIRMED",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      date: "15",
      month: "OCT",
      title: "Inter-Departmental Football",
      details: "NED Sports Ground - 04:00 PM",
      status: "UPCOMING",
      statusColor: "bg-orange-100 text-orange-700",
    },
  ];

  const societies = [
    {
      name: "Literary and Publiciation Society.",
      members: "239 Members",
      color: "bg-orange-100",
      icon: "../src/assets/lps.png",
    },
    {
      name: "Ned Adventure Society",
      members: "159 Members",
      color: "bg-green-100",
      icon: "../src/assets/nas.png",
    },
  ];

  const categories = [
    { name: "All Categories", active: true, color: "bg-blue-500 text-white" },
    { name: "Technical", icon: "</>" },
    { name: "Cultural", icon: "🎭" },
    { name: "Sports", icon: "⚽" },
    { name: "Social", icon: "🤝" },
  ];

  const date = new Date();
  const currentMonth = date.toLocaleString('default', { month: 'long' });
  const currentYear = date.getFullYear();
  const currentDate = date.getDate();

  const calendarDays = [
    { date: 28, faded: true },
    { date: 29, faded: true },
    { date: 30, faded: true },
    { date: 31, faded: true },
    { date: 1 },
    { date: 2 },
    { date: 3 },
    { date: 4 },
    { date: 5 },
    { date: 6 },
    { date: 7 },
    { date: 8 },
    { date: 9 },
    { date: 10 },
    { date: 11 },
    { date: 12 },
    { date: 13 },
    { date: 14 },
    { date: 15 },
    { date: 16 },
    { date: 17 },
    { date: 18 },
    { date: 19 },
    { date: 20 },
    { date: 21 },
    { date: 22 },
    { date: 23 },
    { date: 24 },
    { date: 25 },
    { date: 26 },
    { date: 27 },
    { date: 28 },
    { date: 29 },
    { date: 30 },
    { date: 31 },
  ].map(day => ({
    ...day,
    current: day.date === currentDate && !day.faded
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">NEDConnect</h1>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg"></div>
            <div>
              <p className="text-xs font-semibold">NED University</p>
              <p className="text-xs text-gray-500">STUDENT PORTAL</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick("dashboard")}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left transition-all duration-200 cursor-pointer ${
                activeNav === "dashboard"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <div className={`rounded-sm transition-colors ${
                  activeNav === "dashboard" ? "bg-blue-600" : "bg-gray-400"
                }`}></div>
                <div className={`rounded-sm transition-colors ${
                  activeNav === "dashboard" ? "bg-blue-600" : "bg-gray-400"
                }`}></div>
                <div className={`rounded-sm transition-colors ${
                  activeNav === "dashboard" ? "bg-blue-600" : "bg-gray-400"
                }`}></div>
                <div className={`rounded-sm transition-colors ${
                  activeNav === "dashboard" ? "bg-blue-600" : "bg-gray-400"
                }`}></div>
              </div>
              <span className="font-medium">Dashboard</span>
            </button>            
            <button
              onClick={() => handleNavClick("societies")}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left transition-all duration-200 cursor-pointer ${
                activeNav === "societies"
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <Users className={`w-5 h-5 transition-colors ${
                activeNav === "societies" ? "text-blue-600" : "text-gray-600"
              }`} />
              <span>Societies</span>
            </button>            
          </div>
        </nav>

        
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        {/* <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, societies, or workshops"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Dashboard</span>
              <span className="text-sm text-gray-600">Events</span>
              <span className="text-sm text-gray-600">Societies</span>
              <span className="text-sm text-gray-600">Portal</span>              
            </div>
          </div>
        </header> */}

        {/* Content */}
        <div className="p-8">
          <div className="flex gap-8">
            {/* Left Column */}
            <div className="flex-1">
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Welcome back, </h2>
                <p className="text-gray-600">
                  You have many amazing events scheduled for this week. Stay ahead!
                </p>
              </div>

              {/* Featured Events */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Featured Events</h3>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {featuredEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200"
                    >
                      <div
                        className={`h-48 relative ${idx === 0 ? "bg-gradient-to-br from-teal-600 to-teal-800" : "bg-gradient-to-br from-amber-50 to-orange-50"}`}
                      >
                        {idx === 0 ? (
                          <div className="p-6 text-white">
                            <div className="absolute top-4 right-4">
                              <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                TECHNICAL
                              </span>
                            </div>
                            <div className="absolute bottom-6 left-6">
                              <h4 className="text-2xl font-bold mb-2">
                                TECHNICAL
                                <br />
                                COMPETITION
                              </h4>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 flex items-center justify-center h-full">
                            <div className="text-6xl">🌿</div>
                            <div className="ml-4">
                              <p className="text-4xl font-serif text-orange-300">
                                cultic
                              </p>
                              <p className="text-4xl font-serif text-orange-300">
                                even
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h4 className="font-bold text-lg mb-2">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {event.description}
                        </p>
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
                          {event.buttonText}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="mb-6">
                <div className="flex space-x-3">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        cat.active
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {cat.icon && <span className="mr-2">{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* My Registered Events */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">My Registered Events</h3>
                  <a href="#" className="text-blue-600 text-sm font-medium">
                    View all schedule
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {registeredEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                      <div className="flex">
                        <div className="text-center mr-4">
                          <p className="text-xs text-gray-500 font-semibold">
                            {event.month}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {event.date}
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold">{event.title}</h4>
                            <button className="text-gray-400">⋮</button>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {event.details}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${event.statusColor}`}
                          >
                            ● {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80">
              {/* Calendar */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{currentMonth} {currentYear}</h3>
                  <div className="flex space-x-2">
                    <button className="p-1">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
                    <div
                      key={day}
                      className="text-xs text-center text-gray-500 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => (
                    <button
                      key={idx}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors ${
                        day.current 
                          ? "bg-blue-600 text-white font-bold"
                          : day.faded
                            ? "text-gray-300"
                            : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {day.date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newly Formed Societies */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="font-bold mb-4">Newly Formed Societies</h3>
                <div className="space-y-4">
                  {societies.map((society, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 ${society.color} rounded-lg flex items-center justify-center text-xl`}
                      >
                        <img src={society.icon} alt="" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{society.name}</p>
                        <p className="text-xs text-gray-500">
                          {society.members}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;