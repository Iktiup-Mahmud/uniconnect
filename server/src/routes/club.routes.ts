import { Router } from "express";
import {
  getAllClubs,
  getClubById,
  createClub,
  joinClub,
  leaveClub,
  updateClub,
} from "../controllers/club.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuth, getAllClubs);
router.get("/:id", optionalAuth, getClubById);
router.post("/", authenticate, createClub);
router.post("/:id/join", authenticate, joinClub);
router.post("/:id/leave", authenticate, leaveClub);
router.put("/:id", authenticate, updateClub);

export default router;

