import { Request, Response } from "express";
import { asyncHandler } from "../middlewares";
import Notification from "../models/Notification.model";
import { AppError } from "../utils/appError";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { unreadOnly } = req.query;
  const filter: any = { userId: req.user._id };

  if (unreadOnly === "true") {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    status: "success",
    message: "Notifications retrieved successfully",
    data: { notifications, unreadCount },
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new AppError("You don't have access to this notification", 403);
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    status: "success",
    message: "Notification marked as read",
    data: { notification },
  });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    throw new AppError("You don't have access to this notification", 403);
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  });
});

