import { Router } from "express";
import {
  getAllEvents,
  getEventById,
  createEvent,
  rsvpEvent,
  cancelRsvp,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuth, getAllEvents);
router.get("/:id", optionalAuth, getEventById);
router.post("/", authenticate, createEvent);
router.post("/:id/rsvp", authenticate, rsvpEvent);
router.post("/:id/cancel-rsvp", authenticate, cancelRsvp);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);

export default router;

