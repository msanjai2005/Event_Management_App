import Event from "../models/event.model.js";
import RSVP from "../models/rsvp.model.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js"


export const createEvent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { title, description, date, location, capacity,ticketPrice } = req.body;
    
    if (!title || !date || !location) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Title, date, and location are required",
      });
    }
    
    let imageUrl = null;
    
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "eventify/events",
        }
      );
      imageUrl = uploadResponse.secure_url;
    }
    
    const event = await Event.create(
      [
        {
          title: title.trim(),
          description: description?.trim() || "",
          date,
          location: location.trim(),
          capacity: capacity ? parseInt(capacity) : null,
          image: imageUrl,
          createdBy: req.user._id,
          attendeesCount: 0,
          likesCount: 0,
        },
      ],
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: event[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Create event error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


export const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = "date",
      upcomingOnly = "false",
      userId,
    } = req.query;
    
    const query = {};
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (upcomingOnly === "true") {
      query.date = { $gte: new Date() };
    }
    
    if (userId) {
      query.createdBy = userId;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case "date-desc":
        sort = { date: -1 };
        break;
      case "title":
        sort = { title: 1 };
        break;
      case "capacity":
        sort = { capacity: -1 };
        break;
      case "attendees":
        sort = { attendeesCount: -1 };
        break;
      default:
        sort = { date: 1 }; // Default: upcoming first
    }
    
    // Execute query with pagination
    const [events, totalEvents] = await Promise.all([
      Event.find(query)
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(query),
    ]);
    
    // Get RSVP status for authenticated user
    if (req.user) {
      const eventIds = events.map((event) => event._id);
      const userRSVPs = await RSVP.find({
        userId: req.user._id,
        eventId: { $in: eventIds },
      });
      
      const rsvpMap = {};
      userRSVPs.forEach((rsvp) => {
        rsvpMap[rsvp.eventId.toString()] = true;
      });
      
      events.forEach((event) => {
        event.isRSVPed = !!rsvpMap[event._id.toString()];
      });
    }
    
    res.json({
      success: true,
      events,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalEvents / limitNum),
        totalEvents,
        hasNextPage: pageNum * limitNum < totalEvents,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
    });
  }
};


export const getSingleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name email phone website")
      .lean();
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    if (req.user) {
      const rsvp = await RSVP.findOne({
        userId: req.user._id,
        eventId: event._id,
      });
      event.isRSVPed = !!rsvp;
      event.isCreator = event.createdBy._id.toString() === req.user._id.toString();
    }
    
    event.isFull = event.capacity && event.attendeesCount >= event.capacity;
    event.isUpcoming = new Date(event.date) > new Date();
    
    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get single event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
    });
  }
};


export const updateEvent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const eventId = req.params.id;
    const updateData = { ...req.body };
    
    // Find event and verify ownership
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }
    
    // Handle image upload if new image provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (event.image) {
        const publicId = event.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`eventify/events/${publicId}`);
      }
      
      // Upload new image
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "eventify/events",
        }
      );
      updateData.image = uploadResponse.secure_url;
    }
    
    // Parse numeric fields
    if (updateData.capacity) updateData.capacity = parseInt(updateData.capacity);
    if (updateData.ticketPrice) updateData.ticketPrice = parseFloat(updateData.ticketPrice);
    
    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true, session }
    ).populate("createdBy", "name email");
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Update event error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to update event",
    });
  }
};


export const deleteEvent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    if (event.createdBy.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }
    
    if (event.image) {
      const publicId = event.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`eventify/events/${publicId}`);
    }
    
    await RSVP.deleteMany({ eventId }).session(session);
    
    await Event.findByIdAndDelete(eventId).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
    });
  }
};


export const getEventAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    const rsvps = await RSVP.find({ eventId })
      .populate("userId", "name email profilePicture")
      .sort({ createdAt: -1 });
    
    const attendees = rsvps.map((rsvp) => ({
      _id: rsvp.userId._id,
      name: rsvp.userId.name,
      email: rsvp.userId.email,
      profilePicture: rsvp.userId.profilePicture,
      rsvpDate: rsvp.createdAt,
    }));
    
    res.json({
      success: true,
      attendees,
      total: attendees.length,
    });
  } catch (error) {
    console.error("Get attendees error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendees",
    });
  }
};


export const likeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    event.likesCount = (event.likesCount || 0) + 1;
    await event.save();
    
    res.json({
      success: true,
      message: "Event liked",
      likesCount: event.likesCount,
    });
  } catch (error) {
    console.error("Like event error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like event",
    });
  }
};


export const getRelatedEvents = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const currentEvent = await Event.findById(eventId);
    if (!currentEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    const relatedEvents = await Event.find({
      _id: { $ne: eventId },
      $or: [
        { category: currentEvent.category },
        { location: { $regex: currentEvent.location, $options: "i" } },
        { createdBy: currentEvent.createdBy },
      ],
      date: { $gte: new Date() },
    })
      .limit(4)
      .populate("createdBy", "name")
      .sort({ date: 1 });
    
    res.json({
      success: true,
      events: relatedEvents,
    });
  } catch (error) {
    console.error("Get related events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related events",
    });
  }
};


export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const events = await Event.find({ createdBy: userId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (error) {
    console.error("Get my events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your events",
    });
  }
};


export const searchEvents = async (req, res) => {
  try {
    const { q, category, location, dateFrom, dateTo } = req.query;
    
    const query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    const events = await Event.find(query)
      .populate("createdBy", "name")
      .limit(20)
      .sort({ date: 1 });
    
    res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (error) {
    console.error("Search events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search events",
    });
  }
};