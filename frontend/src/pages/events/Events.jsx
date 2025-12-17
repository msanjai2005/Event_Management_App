import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarCheck,
  FaExclamationCircle,
} from "react-icons/fa";

const Events = () => {
  const { backendurl, events, getAllEvents, isLoadingEvents,user } = useContext(AppContext);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(9);
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isCreator,setIsCreator]=useState(user?._id);

  const categories = [
    { id: "all", name: "All Events" },
    { id: "upcoming", name: "Upcoming" },
    { id: "past", name: "Past" },
    { id: "music", name: "Music" },
    { id: "sports", name: "Sports" },
    { id: "conference", name: "Conference" },
    { id: "workshop", name: "Workshop" },
    { id: "festival", name: "Festival" },
  ];

  useEffect(() => {
    if (events) {
      setFilteredEvents(events);
    }
  }, [events]);

  useEffect(() => {
    if (!events) return;

    let filtered = [...events];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title?.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "all") {
      if (selectedCategory === "upcoming") {
        filtered = filtered.filter(
          (event) => new Date(event.date) > new Date()
        );
      } else if (selectedCategory === "past") {
        filtered = filtered.filter(
          (event) => new Date(event.date) <= new Date()
        );
      } else {
        filtered = filtered.filter(
          (event) => event.category?.toLowerCase() === selectedCategory
        );
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date) - new Date(b.date);
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "title":
          return a.title?.localeCompare(b.title);
        case "capacity":
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [events, searchTerm, selectedCategory, sortBy]);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      setIsDeleting(eventId);
      axios.defaults.withCredentials = true;

      const res = await axios.delete(`${backendurl}/api/events/${eventId}`);

      if (res.data.success) {
        await getAllEvents();
      } else {
        alert("Failed to delete event: " + res.data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        "Failed to delete event: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString("en-US", options);
  };

  const isEventUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              All Events
            </h1>
            <p className="text-gray-600">
              Discover and join amazing events in your community
            </p>
          </div>
          <Link
            to="/create-event"
            className="mt-4 md:mt-0 inline-flex items-center justify-center bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaPlus className="mr-2" />
            Create New Event
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events by title, description, or location..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 hover:text-blue-600 mb-4"
          >
            <FaFilter className="mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {showFilters && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSortBy("date")}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                      sortBy === "date"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaSort className="mr-2" />
                    Date (Earliest)
                  </button>
                  <button
                    onClick={() => setSortBy("date-desc")}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                      sortBy === "date-desc"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaSort className="mr-2" />
                    Date (Latest)
                  </button>
                  <button
                    onClick={() => setSortBy("title")}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                      sortBy === "title"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaSort className="mr-2" />
                    Title
                  </button>
                  <button
                    onClick={() => setSortBy("capacity")}
                    className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${
                      sortBy === "capacity"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FaSort className="mr-2" />
                    Capacity
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSortBy("date");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {isLoadingEvents ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {filteredEvents.length} event
                {filteredEvents.length !== 1 ? "s" : ""}
                {searchTerm && (
                  <span className="ml-2">
                    for "<span className="font-medium">{searchTerm}</span>"
                  </span>
                )}
              </p>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {currentEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentEvents.map((event) => {
                  return (
                    <div
                      key={event._id}
                      className="bg-white rounded-xl shadow hover:shadow-lg transition"
                    >
                      <img
                        src={
                          event.image ||
                          "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                        }
                        alt={event.title}
                        className="h-44 w-full object-cover rounded-t-xl"
                      />

                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
                          {event.title}
                        </h3>

                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-500" />
                          {formatDate(event.date)} • {formatTime(event.date)}
                        </div>

                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <FaMapMarkerAlt className="text-blue-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <FaUsers className="text-blue-500" />
                          {event.attendeesCount || 0}/{event.capacity} attending
                        </div>

                        <div className="flex gap-3">
                          <Link
                            to={`/events/${event._id}`}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                          >
                            <FaEye />
                            View
                          </Link>

                          {isCreator === event?.createdBy?._id && (
                            <>
                              <Link
                                to={`/events/${event._id}/edit`}
                                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              >
                                <FaEdit />
                              </Link>

                              <button
                                onClick={() => handleDeleteEvent(event._id)}
                                className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaExclamationCircle className="text-blue-500 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  No events found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filters"
                    : "Be the first to create an event!"}
                </p>
                {!searchTerm && selectedCategory === "all" && (
                  <Link
                    to="/create-event"
                    className="inline-flex items-center bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                  >
                    <FaCalendarCheck className="mr-2" />
                    Create Your First Event
                  </Link>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft />
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
