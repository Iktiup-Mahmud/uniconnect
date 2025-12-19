import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Club from "../models/Club.model";
import { AppError } from "../utils/appError";

export const getAllClubs = asyncHandler(async (req: Request, res: Response) => {
  const { category, isActive } = req.query;
  const filter: any = {};

  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === "true";

  const clubs = await Club.find(filter)
    .populate("organizer", "name username avatar")
    .populate("members", "name username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Clubs retrieved successfully",
    data: { clubs },
  });
});

export const getClubById = asyncHandler(async (req: Request, res: Response) => {
  const club = await Club.findById(req.params.id)
    .populate("organizer", "name username avatar")
    .populate("members", "name username avatar")
    .populate("events");

  if (!club) {
    throw new AppError("Club not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Club retrieved successfully",
    data: { club },
  });
});

export const createClub = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.role !== "club_organizer" && req.user?.role !== "admin") {
    throw new AppError("Only club organizers can create clubs", 403);
  }

  const { name, description, category, imageUrl } = req.body;

  const club = await Club.create({
    name,
    description,
    organizer: req.user._id,
    category,
    imageUrl,
    members: [req.user._id],
    events: [],
    isActive: true,
  });

  await club.populate("organizer", "name username avatar");

  res.status(201).json({
    status: "success",
    message: "Club created successfully",
    data: { club },
  });
});

export const joinClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    throw new AppError("Club not found", 404);
  }

  if (!club.isActive) {
    throw new AppError("Club is not active", 400);
  }

  if (club.members.includes(req.user._id)) {
    throw new AppError("You are already a member of this club", 400);
  }

  club.members.push(req.user._id);
  await club.save();

  res.status(200).json({
    status: "success",
    message: "Joined club successfully",
    data: { club },
  });
});

export const leaveClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    throw new AppError("Club not found", 404);
  }

  if (club.organizer.toString() === req.user._id.toString()) {
    throw new AppError("Organizer cannot leave the club", 400);
  }

  club.members = club.members.filter(
    (memberId: any) => memberId.toString() !== req.user._id.toString()
  );
  await club.save();

  res.status(200).json({
    status: "success",
    message: "Left club successfully",
    data: { club },
  });
});

export const updateClub = asyncHandler(async (req: Request, res: Response) => {
  const club = await Club.findById(req.params.id);

  if (!club) {
    throw new AppError("Club not found", 404);
  }

  if (
    club.organizer.toString() !== req.user._id.toString() &&
    req.user?.role !== "admin"
  ) {
    throw new AppError("Only organizer can update club", 403);
  }

  const { name, description, category, imageUrl, isActive } = req.body;

  if (name) club.name = name;
  if (description !== undefined) club.description = description;
  if (category) club.category = category;
  if (imageUrl !== undefined) club.imageUrl = imageUrl;
  if (isActive !== undefined) club.isActive = isActive;

  await club.save();
  await club.populate("organizer", "name username avatar");

  res.status(200).json({
    status: "success",
    message: "Club updated successfully",
    data: { club },
  });
});

