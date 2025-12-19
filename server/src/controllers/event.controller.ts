import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Event from "../models/Event.model";
import Club from "../models/Club.model";
import Course from "../models/Course.model";
import { AppError } from "../utils/appError";

export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const { category, clubId, courseId, upcoming } = req.query;
  const filter: any = { isPublic: true };

  if (category) filter.category = category;
  if (clubId) filter.clubId = clubId;
  if (courseId) filter.courseId = courseId;
  if (upcoming === "true") {
    filter.eventDate = { $gte: new Date() };
  }

  const events = await Event.find(filter)
    .populate("organizer", "name username avatar")
    .populate("clubId", "name")
    .populate("courseId", "code name")
    .sort({ eventDate: 1 });

  res.status(200).json({
    status: "success",
    message: "Events retrieved successfully",
    data: { events },
  });
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id)
    .populate("organizer", "name username avatar")
    .populate("attendees", "name username avatar")
    .populate("clubId", "name")
    .populate("courseId", "code name");

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Event retrieved successfully",
    data: { event },
  });
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, eventDate, location, category, clubId, courseId, maxAttendees, imageUrl } = req.body;

  // Verify permissions
  if (clubId) {
    const club = await Club.findById(clubId);
    if (!club) {
      throw new AppError("Club not found", 404);
    }
    if (
      club.organizer.toString() !== req.user._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Only club organizer can create events for this club", 403);
    }
  }

  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError("Course not found", 404);
    }
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AppError("Only course instructor can create events for this course", 403);
    }
  }

  const event = await Event.create({
    title,
    description,
    organizer: req.user._id,
    eventDate: new Date(eventDate),
    location,
    category,
    clubId,
    courseId,
    maxAttendees,
    imageUrl,
    attendees: [req.user._id],
    isPublic: true,
  });

  await event.populate("organizer", "name username avatar");

  // Add event to club if applicable
  if (clubId) {
    await Club.findByIdAndUpdate(clubId, { $push: { events: event._id } });
  }

  res.status(201).json({
    status: "success",
    message: "Event created successfully",
    data: { event },
  });
});

export const rsvpEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
    throw new AppError("Event is full", 400);
  }

  if (event.attendees.includes(req.user._id)) {
    throw new AppError("You are already registered for this event", 400);
  }

  event.attendees.push(req.user._id);
  await event.save();

  res.status(200).json({
    status: "success",
    message: "RSVP successful",
    data: { event },
  });
});

export const cancelRsvp = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  event.attendees = event.attendees.filter(
    (attendeeId: any) => attendeeId.toString() !== req.user._id.toString()
  );
  await event.save();

  res.status(200).json({
    status: "success",
    message: "RSVP cancelled successfully",
    data: { event },
  });
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user?.role !== "admin"
  ) {
    throw new AppError("Only organizer can update event", 403);
  }

  const { title, description, eventDate, location, category, maxAttendees, imageUrl } = req.body;

  if (title) event.title = title;
  if (description !== undefined) event.description = description;
  if (eventDate) event.eventDate = new Date(eventDate);
  if (location) event.location = location;
  if (category) event.category = category;
  if (maxAttendees !== undefined) event.maxAttendees = maxAttendees;
  if (imageUrl !== undefined) event.imageUrl = imageUrl;

  await event.save();
  await event.populate("organizer", "name username avatar");

  res.status(200).json({
    status: "success",
    message: "Event updated successfully",
    data: { event },
  });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user?.role !== "admin"
  ) {
    throw new AppError("Only organizer can delete event", 403);
  }

  await Event.findByIdAndDelete(req.params.id);

  // Remove from club if applicable
  if (event.clubId) {
    await Club.findByIdAndUpdate(event.clubId, { $pull: { events: event._id } });
  }

  res.status(200).json({
    status: "success",
    message: "Event deleted successfully",
  });
});

