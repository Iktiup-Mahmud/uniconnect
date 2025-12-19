import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Course from "../models/Course.model";
import { AppError } from "../utils/appError";

export const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
  const { semester, year } = req.query;
  const filter: any = {};

  if (semester) filter.semester = semester;
  if (year) filter.year = parseInt(year as string);

  // Students see only their enrolled courses, faculty see their courses, admin sees all
  if (req.user?.role === "student") {
    filter.students = req.user._id;
  } else if (req.user?.role === "faculty") {
    filter.instructor = req.user._id;
  }

  const courses = await Course.find(filter)
    .populate("instructor", "name username avatar")
    .populate("students", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Courses retrieved successfully",
    data: { courses },
  });
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id)
    .populate("instructor", "name username avatar email")
    .populate("students", "name username avatar")
    .populate("announcements");

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  // Check access
  const isStudent = course.students.some(
    (s: any) => s._id.toString() === req.user?._id?.toString()
  );
  const isInstructor = course.instructor.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === "admin";

  if (!isStudent && !isInstructor && !isAdmin) {
    throw new AppError("You don't have access to this course", 403);
  }

  res.status(200).json({
    status: "success",
    message: "Course retrieved successfully",
    data: { course },
  });
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== "faculty" && req.user?.role !== "admin") {
    throw new AppError("Only faculty can create courses", 403);
  }

  const { code, name, description, semester, year } = req.body;

  const course = await Course.create({
    code,
    name,
    description,
    instructor: req.user._id,
    semester,
    year,
    students: [],
    materials: [],
    announcements: [],
    assignments: [],
  });

  await course.populate("instructor", "name username avatar");

  res.status(201).json({
    status: "success",
    message: "Course created successfully",
    data: { course },
  });
});

export const enrollInCourse = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== "student") {
    throw new AppError("Only students can enroll in courses", 403);
  }

  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.students.includes(req.user._id)) {
    throw new AppError("You are already enrolled in this course", 400);
  }

  course.students.push(req.user._id);
  await course.save();

  res.status(200).json({
    status: "success",
    message: "Enrolled in course successfully",
    data: { course },
  });
});

export const addCourseMaterial = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.instructor.toString() !== req.user?._id?.toString() && req.user?.role !== "admin") {
    throw new AppError("Only instructor can add materials", 403);
  }

  const { title, type, url, description } = req.body;
  course.materials.push({ title, type, url, description, uploadedAt: new Date() });
  await course.save();

  res.status(200).json({
    status: "success",
    message: "Material added successfully",
    data: { course },
  });
});

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.instructor.toString() !== req.user?._id?.toString() && req.user?.role !== "admin") {
    throw new AppError("Only instructor can create assignments", 403);
  }

  const { title, description, dueDate, maxScore } = req.body;
  course.assignments.push({
    title,
    description,
    dueDate: new Date(dueDate),
    maxScore: maxScore || 100,
    submissions: [],
  });
  await course.save();

  res.status(201).json({
    status: "success",
    message: "Assignment created successfully",
    data: { course },
  });
});

export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== "student") {
    throw new AppError("Only students can submit assignments", 403);
  }

  const { courseId, assignmentIndex } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const assignment = course.assignments[parseInt(assignmentIndex)];
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  const existingSubmission = assignment.submissions.find(
    (s: any) => s.studentId.toString() === req.user._id.toString()
  );

  const { fileUrl, text } = req.body;

  if (existingSubmission) {
    existingSubmission.fileUrl = fileUrl;
    existingSubmission.text = text;
    existingSubmission.submittedAt = new Date();
  } else {
    assignment.submissions.push({
      studentId: req.user._id,
      fileUrl,
      text,
      submittedAt: new Date(),
    });
  }

  await course.save();

  res.status(200).json({
    status: "success",
    message: "Assignment submitted successfully",
    data: { course },
  });
});

