import { Router } from "express";
import {
  getPortfolio,
  createOrUpdatePortfolio,
  deletePortfolio,
} from "../controllers/portfolio.controller";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:userId", optionalAuth, getPortfolio);
router.post("/", authenticate, createOrUpdatePortfolio);
router.put("/", authenticate, createOrUpdatePortfolio);
router.delete("/", authenticate, deletePortfolio);

export default router;

