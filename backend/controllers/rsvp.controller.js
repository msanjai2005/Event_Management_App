import mongoose from "mongoose";
import Event from "../models/event.model.js";
import RSVP from "../models/rsvp.model.js";


export const rsvpEvent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const userId = req.user._id;
    const eventId = req.params.eventId;
    
    session.startTransaction();
    
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    if (event.capacity && event.attendeesCount >= event.capacity) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }
    
    if (new Date(event.date) < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot RSVP to past events",
      });
    }
    
    const existingRSVP = await RSVP.findOne({
      userId,
      eventId,
    }).session(session);
    
    if (existingRSVP) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Already RSVP'd to this event",
      });
    }
    
    await RSVP.create(
      [
        {
          userId,
          eventId,
        },
      ],
      { session }
    );
    
    event.attendeesCount += 1;
    await event.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({
      success: true,
      message: "Successfully RSVP'd to event",
      attendeesCount: event.attendeesCount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("RSVP error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Already RSVP'd to this event",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to RSVP",
    });
  }
};


export const cancelRsvp = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const userId = req.user._id;
    const eventId = req.params.eventId;
    
    session.startTransaction();
    
    const rsvp = await RSVP.findOneAndDelete(
      {
        userId,
        eventId,
      },
      { session }
    );
    
    if (!rsvp) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "RSVP not found",
      });
    }
    
    await Event.findByIdAndUpdate(
      eventId,
      { $inc: { attendeesCount: -1 } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: "RSVP cancelled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Cancel RSVP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel RSVP",
    });
  }
};


export const checkRSVP = async (req, res) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.eventId;
    
    const rsvp = await RSVP.findOne({
      userId,
      eventId,
    });
    
    res.json({
      success: true,
      isRSVPed: !!rsvp,
      rsvpDate: rsvp?.createdAt,
    });
  } catch (error) {
    console.error("Check RSVP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check RSVP status",
    });
  }
};


export const getUserRSVPs = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const rsvps = await RSVP.find({ userId })
      .populate({
        path: "eventId",
        populate: {
          path: "createdBy",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });
    
    const events = rsvps.map((rsvp) => ({
      ...rsvp.eventId.toObject(),
      rsvpDate: rsvp.createdAt,
    }));
    
    res.json({
      success: true,
      events,
      total: events.length,
    });
  } catch (error) {
    console.error("Get user RSVPs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your RSVPs",
    });
  }
};


export const getEventRSVPStats = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    const totalRSVPs = await RSVP.countDocuments({ eventId });
    
    const rsvpsByDate = await RSVP.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    res.json({
      success: true,
      stats: {
        totalRSVPs,
        attendeesCount: event.attendeesCount,
        capacity: event.capacity,
        availableSpots: event.capacity ? event.capacity - event.attendeesCount : null,
        rsvpsByDate,
      },
    });
  } catch (error) {
    console.error("Get RSVP stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch RSVP statistics",
    });
  }
};