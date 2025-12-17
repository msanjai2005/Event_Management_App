import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaImage,
  FaUpload,
  FaArrowLeft,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";

const EditEvent = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { backendurl } = useContext(AppContext);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    category: "General",
    ticketPrice: "",
  });

  const [originalImage, setOriginalImage] = useState(null);
  const [image, setImage] = useState(null); // New image file
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        axios.defaults.withCredentials = true;

        const res = await axios.get(`${backendurl}/api/events/${eventId}`);

        if (res.data.success && res.data.event) {
          const eventData = res.data.event;
          setEvent(eventData);

          const eventDate = new Date(eventData.date);
          const formattedDate = eventDate.toISOString().split("T")[0];
          const formattedTime = eventDate.toTimeString().slice(0, 5);

          setFormData({
            title: eventData.title || "",
            description: eventData.description || "",
            date: formattedDate,
            time: formattedTime,
            location: eventData.location || "",
            capacity: eventData.capacity?.toString() || "",
            category: eventData.category || "General",
            ticketPrice: eventData.ticketPrice?.toString() || "",
          });

          if (eventData.image) {
            setOriginalImage(eventData.image);
            setImagePreview(eventData.image);
          }
        } else {
          toast.error("Event not found");
          navigate("/events");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load event data");
        navigate("/events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, backendurl, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (error) {
      setError("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(originalImage || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      axios.defaults.withCredentials = true;

      if (!formData.title.trim() || !formData.date || !formData.location) {
        setError("Please fill in all required fields (Title, Date, Location)");
        setIsSaving(false);
        return;
      }

      if (formData.capacity && parseInt(formData.capacity) < 1) {
        setError("Capacity must be at least 1");
        setIsSaving(false);
        return;
      }

      const eventData = new FormData();

      eventData.append("title", formData.title.trim());
      eventData.append("description", formData.description.trim());
      eventData.append("category", formData.category);

      const eventDateTime = formData.time
        ? `${formData.date}T${formData.time}:00`
        : `${formData.date}T00:00:00`;
      eventData.append("date", eventDateTime);

      eventData.append("location", formData.location.trim());

      if (formData.capacity) {
        eventData.append("capacity", formData.capacity);
      }

      if (formData.ticketPrice) {
        eventData.append("ticketPrice", formData.ticketPrice);
      }

      if (image) {
        eventData.append("image", image);
      } else if (!imagePreview && originalImage) {
        eventData.append("image", "");
      }

      console.log("Updating event with data:");
      for (let [key, value] of eventData.entries()) {
        console.log(key, value);
      }

      const res = await axios.put(
        `${backendurl}/api/events/${eventId}`,
        eventData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        toast.success("Event updated successfully!");
        
        navigate(`/events/${eventId}`);
        
      } else {
        setError(res.data.message || "Failed to update event");
      }
    } catch (error) {
      console.error("Update error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update event"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      axios.defaults.withCredentials = true;

      const res = await axios.delete(`${backendurl}/api/events/${eventId}`);

      if (res.data.success) {
        toast.success("Event deleted successfully");
        navigate("/events");
      } else {
        alert("Failed to delete event: " + res.data.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete event: " + (error.response?.data?.message || error.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    if (event) {
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toISOString().split("T")[0];
      const formattedTime = eventDate.toTimeString().slice(0, 5);

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: formattedDate,
        time: formattedTime,
        location: event.location || "",
        capacity: event.capacity?.toString() || "",
        category: event.category || "General",
        ticketPrice: event.ticketPrice?.toString() || "",
      });

      setImage(null);
      setImagePreview(originalImage || null);
      setError("");
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Back to Event
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Reset Changes
            </button>
            
            <button
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <FaTrash />
              {isDeleting ? "Deleting..." : "Delete Event"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSave className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Edit Event</h1>
            <p className="text-gray-500 mt-2">Update your event information</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Event Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full max-h-64 object-cover rounded-lg mx-auto mb-4"
                    />
                    <div className="flex justify-center gap-3">
                      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                        <FaUpload />
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isSaving}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <FaImage className="text-blue-500 text-2xl" />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
                        Upload a new event image
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        PNG, JPG or WebP up to 5MB
                      </p>
                      <label className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        <FaUpload className="mr-2" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isSaving}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Enter event title"
                disabled={isSaving}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                disabled={isSaving}
              >
                <option value="General">General</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Festival">Festival</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-32 resize-none"
                placeholder="Describe your event..."
                disabled={isSaving}
                maxLength={1000}
              />
              <p className="text-gray-500 text-xs mt-2 text-right">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={minDate}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Enter event location"
                  disabled={isSaving}
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Maximum Capacity
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUsers className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Leave empty for unlimited"
                    disabled={isSaving}
                    min="1"
                    max="10000"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Current attendees: {event?.attendeesCount || 0}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 text-lg"
                disabled={isSaving}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg ${
                  isSaving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating Event...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FaSave />
                    Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>* Required fields. Events must be scheduled at least one day in advance.</p>
          <p className="mt-1">Note: Capacity cannot be lower than current number of attendees ({event?.attendeesCount || 0}).</p>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;