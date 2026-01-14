import { Router } from "express";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  enrollInCourse,
  addCourseMaterial,
  createAssignment,
  submitAssignment,
} from "../controllers/course.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getAllCourses);
router.get("/:id", authenticate, getCourseById);
router.post("/", authenticate, createCourse);
router.post("/:id/enroll", authenticate, enrollInCourse);
router.post("/:id/materials", authenticate, addCourseMaterial);
router.post("/:id/assignments", authenticate, createAssignment);
router.post("/:courseId/assignments/:assignmentIndex/submit", authenticate, submitAssignment);

export default router;

