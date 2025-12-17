import express from "express";
import multer from "multer";
import {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  likeEvent,
  getRelatedEvents,
  getMyEvents,
  searchEvents,
} from "../controllers/event.controller.js";
import { VerifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", getAllEvents);
router.get("/search", searchEvents); 
router.get("/:id", getSingleEvent);
router.get("/:id/related", getRelatedEvents);

router.post("/", VerifyToken, upload.single("image"), createEvent);
router.put("/:id", VerifyToken, upload.single("image"), updateEvent);
router.delete("/:id", VerifyToken, deleteEvent);

router.get("/user/my-events", VerifyToken, getMyEvents); 
router.get("/:id/attendees", VerifyToken, getEventAttendees);
router.post("/:id/like", VerifyToken, likeEvent);

export default router;