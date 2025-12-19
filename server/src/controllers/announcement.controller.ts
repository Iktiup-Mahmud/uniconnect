import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Announcement from "../models/Announcement.model";
import Course from "../models/Course.model";
import Club from "../models/Club.model";
import { AppError } from "../utils/appError";

export const getAllAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, clubId, targetAudience } = req.query;
  const filter: any = {};

  if (courseId) filter.courseId = courseId;
  if (clubId) filter.clubId = clubId;
  if (targetAudience) filter.targetAudience = targetAudience;

  // Filter by user role
  if (req.user?.role === "student") {
    const studentCourses = await getStudentCourses(req.user._id);
    const studentClubs = await getStudentClubs(req.user._id);
    filter.$or = [
      { targetAudience: "all" },
      { targetAudience: "students" },
      { courseId: { $in: studentCourses } },
      { clubId: { $in: studentClubs } },
    ];
  } else if (req.user?.role === "faculty") {
    filter.$or = [
      { targetAudience: "all" },
      { targetAudience: "faculty" },
      { author: req.user._id },
    ];
  }

  const announcements = await Announcement.find(filter)
    .populate("author", "name username avatar")
    .populate("courseId", "code name")
    .populate("clubId", "name")
    .sort({ isPinned: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Announcements retrieved successfully",
    data: { announcements },
  });
});

async function getStudentCourses(userId: any) {
  const courses = await Course.find({ students: userId }).select("_id");
  return courses.map((c) => c._id);
}

async function getStudentClubs(userId: any) {
  const clubs = await Club.find({ members: userId }).select("_id");
  return clubs.map((c) => c._id);
}

export const getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate("author", "name username avatar")
    .populate("courseId", "code name")
    .populate("clubId", "name");

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Announcement retrieved successfully",
    data: { announcement },
  });
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, targetAudience, courseId, clubId, isPinned, attachments } = req.body;

  // Verify permissions
  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Only course instructor can create announcements", 403);
    }
  }

  if (clubId) {
    const club = await Club.findById(clubId);
    if (!club) {
      throw new AppError("Club not found", 404);
    }
    if (
      club.organizer.toString() !== req.user._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Only club organizer can create announcements", 403);
    }
  }

  if (req.user?.role !== "admin" && req.user?.role !== "faculty" && !courseId && !clubId) {
    throw new AppError("Only admin and faculty can create general announcements", 403);
  }

  const announcement = await Announcement.create({
    title,
    content,
    author: req.user._id,
    targetAudience: targetAudience || "all",
    courseId,
    clubId,
    isPinned: isPinned || false,
    attachments: attachments || [],
  });

  await announcement.populate("author", "name username avatar");

  res.status(201).json({
    status: "success",
    message: "Announcement created successfully",
    data: { announcement },
  });
});

export const updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  if (
    announcement.author.toString() !== req.user._id.toString() &&
    req.user?.role !== "admin"
  ) {
    throw new AppError("Only author can update announcement", 403);
  }

  const { title, content, isPinned, attachments } = req.body;

  if (title) announcement.title = title;
  if (content !== undefined) announcement.content = content;
  if (isPinned !== undefined) announcement.isPinned = isPinned;
  if (attachments !== undefined) announcement.attachments = attachments;

  await announcement.save();
  await announcement.populate("author", "name username avatar");

  res.status(200).json({
    status: "success",
    message: "Announcement updated successfully",
    data: { announcement },
  });
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  if (
    announcement.author.toString() !== req.user._id.toString() &&
    req.user?.role !== "admin"
  ) {
    throw new AppError("Only author can delete announcement", 403);
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Announcement deleted successfully",
  });
});

