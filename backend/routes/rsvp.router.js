import express from "express";
import {
  rsvpEvent,
  cancelRsvp,
  checkRSVP,
  getUserRSVPs,
  getEventRSVPStats,
} from "../controllers/rsvp.controller.js";
import { VerifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:eventId", VerifyToken, rsvpEvent);
router.delete("/:eventId", VerifyToken, cancelRsvp);
router.get("/check/:eventId", VerifyToken, checkRSVP);
router.get("/user/my-rsvps", VerifyToken, getUserRSVPs);
router.get("/:eventId/stats", VerifyToken, getEventRSVPStats);

export default router;
