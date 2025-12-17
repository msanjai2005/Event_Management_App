import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaUser,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaShareAlt,
  FaHeart,
  FaRegHeart,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTicketAlt,
  FaUsers as FaUsersSolid,
  FaComment,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaTag,
} from "react-icons/fa";
import {
  FaCalendarDay,
  FaLocationDot,
  FaUserGroup,
  FaClipboardCheck,
} from "react-icons/fa6";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { backendurl, user, getAllEvents } = useContext(AppContext);
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [attendees, setAttendees] = useState([]);
  const [isRSVPed, setIsRSVPed] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const isCreator = user?._id === event?.createdBy?._id;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        axios.defaults.withCredentials = true;
        
        const res = await axios.get(`${backendurl}/api/events/${eventId}`);
        
        if (res.data.success) {
          const eventData = res.data.event;
          setEvent(eventData);
          
          const full = eventData.capacity && eventData.attendeesCount >= eventData.capacity;
          setIsFull(full);
          
          if (user) {
            await checkUserRSVP(eventId, user._id);
          }
          
          if (activeTab === "attendees") {
            await fetchEventAttendees(eventId);
          }
        } else {
          toast.error("Event not found");
          navigate("/events");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load event details");
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, user, activeTab]);

  const checkUserRSVP = async (eventId, userId) => {
    try {
      const res = await axios.get(`${backendurl}/api/rsvp/check/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setIsRSVPed(res.data.isRSVPed || false);
    } catch (error) {
      console.log("RSVP check endpoint not available");
    }
  };

  const fetchEventAttendees = async (eventId) => {
    try {
      const res = await axios.get(`${backendurl}/api/events/${eventId}/attendees`);
      if (res.data.success) {
        setAttendees(res.data.attendees || []);
        
        if (user && res.data.attendees) {
          const userRSVPed = res.data.attendees.some(attendee => 
            attendee._id === user._id || attendee.userId === user._id
          );
          setIsRSVPed(userRSVPed);
        }
      }
    } catch (error) {
      console.error("Fetch attendees error:", error);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      toast.error("Please login to join events");
      navigate("/login");
      return;
    }

    if (isFull) {
      toast.error("Event is full");
      return;
    }

    try {
      setIsJoining(true);
      const res = await axios.post(`${backendurl}/api/rsvp/${eventId}`);
      
      if (res.data.success) {
        setIsRSVPed(true);
        
        setEvent(prev => ({
          ...prev,
          attendeesCount: (prev.attendeesCount || 0) + 1
        }));
        
        const newFull = event.capacity && 
                       (event.attendeesCount + 1) >= event.capacity;
        setIsFull(newFull);
        
        await fetchEventAttendees(eventId);
        
        toast.success("Successfully joined the event!");
      } else {
        toast.error(res.data.message || "Failed to join event");
      }
    } catch (error) {
      console.error("RSVP error:", error);
      toast.error(error.response?.data?.message || "Failed to join event");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancelRSVP = async () => {
    if (!user) return;

    try {
      setIsLeaving(true);
      const res = await axios.delete(`${backendurl}/api/rsvp/${eventId}`);
      
      if (res.data.success) {
        setIsRSVPed(false);
        
        setEvent(prev => ({
          ...prev,
          attendeesCount: Math.max(0, (prev.attendeesCount || 1) - 1)
        }));
        
        setIsFull(false);
        
        await fetchEventAttendees(eventId);
        
        toast.success("Successfully left the event");
      } else {
        toast.error(res.data.message || "Failed to leave event");
      }
    } catch (error) {
      console.error("Cancel RSVP error:", error);
      toast.error(error.response?.data?.message || "Failed to leave event");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await axios.delete(`${backendurl}/api/events/${eventId}`);
      
      if (res.data.success) {
        toast.success("Event deleted successfully");
        await getAllEvents();
        navigate("/events");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeEvent = async () => {
    if (!user) {
      toast.error("Please login to like events");
      return;
    }

    try {
      const res = await axios.post(`${backendurl}/api/events/${eventId}/like`);
      
      if (res.data.success) {
        setIsLiked(!isLiked);
        setEvent(prev => ({
          ...prev,
          likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1
        }));
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleShareEvent = () => {
    const eventUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: eventUrl,
      });
    } else {
      navigator.clipboard.writeText(eventUrl)
        .then(() => toast.success("Event link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link"));
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isUpcoming: date > new Date()
    };
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "attendees") {
      fetchEventAttendees(eventId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/events" className="text-blue-600 hover:text-blue-800 font-medium">
          Back to Events
        </Link>
      </div>
    );
  }

  const { date: eventDate, time: eventTime, isUpcoming } = formatDateTime(event.date);
  const availableSpots = event.capacity ? event.capacity - (event.attendeesCount || 0) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Events
          </button>
          
          <div className="flex items-center gap-2">
            {isUpcoming ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Upcoming
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                Past Event
              </span>
            )}
            
            {isFull && isUpcoming && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Full
              </span>
            )}
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
          <img
            src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
            alt={event.title}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                {event.category && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                    {event.category}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">{event.title}</h1>
              <div className="flex items-center text-lg text-gray-200">
                <FaUser className="mr-2" />
                Hosted by <span className="font-semibold ml-1">{event.createdBy?.name || "Event Organizer"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  <button
                    onClick={() => handleTabChange("details")}
                    className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "details"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaClipboardCheck className="inline mr-2" />
                    Details
                  </button>
                  <button
                    onClick={() => handleTabChange("attendees")}
                    className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "attendees"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaUserGroup className="inline mr-2" />
                    Attendees ({event.attendeesCount || 0})
                  </button>
                  <button
                    onClick={() => handleTabChange("discussion")}
                    className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "discussion"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FaComment className="inline mr-2" />
                    Discussion
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-4">About This Event</h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {event.description || "No description provided for this event."}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Event Schedule</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <FaCalendarDay className="text-blue-500 mr-3" />
                            <div>
                              <p className="font-medium">Date</p>
                              <p className="text-sm text-gray-600">{eventDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="text-blue-500 mr-3" />
                            <div>
                              <p className="font-medium">Time</p>
                              <p className="text-sm text-gray-600">{eventTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <FaLocationDot className="text-blue-500 mr-3" />
                            <div>
                              <p className="font-medium">Venue</p>
                              <p className="text-sm text-gray-600">{event.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 text-lg">What to Know</h4>
                        <ul className="space-y-3">
                          <li className="flex items-center">
                            <FaTicketAlt className="text-green-500 mr-3" />
                            <span className="text-gray-700">
                              {event.ticketPrice ? `Ticket: $${event.ticketPrice}` : "Free Entry"}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <FaUsersSolid className="text-blue-500 mr-3" />
                            <span className="text-gray-700">
                              Capacity: {event.capacity ? `${event.attendeesCount || 0}/${event.capacity}` : "Unlimited"}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <FaTag className="text-purple-500 mr-3" />
                            <span className="text-gray-700">
                              Category: {event.category || "General"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "attendees" && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-4">Event Attendees</h3>
                      <p className="text-gray-600 mb-4">
                        {event.attendeesCount || 0} people are attending this event
                        {event.capacity && isUpcoming && (
                          <span className="ml-2 font-medium">
                            ({availableSpots} spots remaining)
                          </span>
                        )}
                      </p>
                    </div>

                    {attendees.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {attendees.map((attendee, index) => (
                          <div 
                            key={attendee._id || index} 
                            className="bg-gray-50 rounded-lg p-4 flex items-center hover:bg-gray-100 transition-colors"
                          >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <span className="font-bold text-blue-600 text-lg">
                                {attendee.name?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{attendee.name || "Attendee"}</p>
                              {attendee.email && (
                                <p className="text-sm text-gray-500 truncate max-w-37.5">
                                  {attendee.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FaUserGroup className="text-4xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg mb-2">No attendees yet</p>
                        <p className="text-gray-400">Be the first to join this event!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "discussion" && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Event Discussion</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <FaComment className="text-4xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Discussion feature coming soon!</p>
                      <p className="text-sm text-gray-400">
                        Connect with other attendees, ask questions, and share updates.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">About the Organizer</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-blue-600">
                    {event.createdBy?.name?.charAt(0)?.toUpperCase() || 'O'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">{event.createdBy?.name || "Event Organizer"}</h4>
                  <p className="text-gray-600 mb-4">Event Host & Coordinator</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {event.createdBy?.email && (
                      <span className="flex items-center text-gray-500">
                        <FaEnvelope className="mr-2" />
                        {event.createdBy.email}
                      </span>
                    )}
                    {event.createdBy?.phone && (
                      <span className="flex items-center text-gray-500">
                        <FaPhone className="mr-2" />
                        {event.createdBy.phone}
                      </span>
                    )}
                    {event.createdBy?.website && (
                      <a 
                        href={event.createdBy.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FaGlobe className="mr-2" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {event.attendeesCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Attending</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {event.likesCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <FaCalendarAlt className="text-blue-500 mt-1 mr-3 shrink-0" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-600">{eventDate} at {eventTime}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-500 mt-1 mr-3 shrink-0" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaUsers className="text-blue-500 mt-1 mr-3 shrink-0" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-gray-600">
                      {event.capacity 
                        ? `${event.attendeesCount || 0}/${event.capacity} spots filled`
                        : "Unlimited capacity"
                      }
                    </p>
                    {event.capacity && isUpcoming && availableSpots > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {availableSpots} spots available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {!isCreator ? (
                  <>
                    {isRSVPed ? (
                      <button
                        onClick={handleCancelRSVP}
                        disabled={isLeaving || !isUpcoming}
                        className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                          isLeaving ? 'opacity-70 cursor-not-allowed' : ''
                        } ${!isUpcoming ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                      >
                        {isLeaving ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                            Leaving...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle />
                            Leave Event
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleRSVP}
                        disabled={isJoining || !isUpcoming || isFull}
                        className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                          isJoining ? 'opacity-70 cursor-not-allowed' : ''
                        } ${!isUpcoming || isFull ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {isJoining ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Joining...
                          </>
                        ) : (
                          <>
                            <FaTicketAlt />
                            {isFull ? 'Event Full' : 'Join Event'}
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to={`/events/${event._id}/edit`}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEdit />
                      Edit Event
                    </Link>
                    
                    <button
                      onClick={handleDeleteEvent}
                      disabled={isDeleting}
                      className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FaTrash />
                          Delete Event
                        </>
                      )}
                    </button>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleLikeEvent}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLiked ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                    Like
                  </button>

                  <button
                    onClick={handleShareEvent}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShareAlt />
                    Share
                  </button>
                </div>
              </div>

              {!isUpcoming && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <FaExclamationTriangle className="mr-2 shrink-0" />
                    This event has already taken place.
                  </p>
                </div>
              )}

              {isFull && isUpcoming && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-800 flex items-center">
                    <FaExclamationTriangle className="mr-2 shrink-0" />
                    This event has reached maximum capacity.
                  </p>
                </div>
              )}

              {isRSVPed && isUpcoming && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center">
                    <FaCheckCircle className="mr-2 shrink-0" />
                    You are attending this event!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;