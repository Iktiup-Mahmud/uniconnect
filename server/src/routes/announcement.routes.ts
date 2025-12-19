import { Router } from "express";
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuth, getAllAnnouncements);
router.get("/:id", optionalAuth, getAnnouncementById);
router.post("/", authenticate, createAnnouncement);
router.put("/:id", authenticate, updateAnnouncement);
router.delete("/:id", authenticate, deleteAnnouncement);

export default router;

