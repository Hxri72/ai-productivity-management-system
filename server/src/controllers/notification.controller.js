import * as notificationService from "../services/notification.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getNotifications = async (req, res, next) => {
  try {
    const { notifications, unreadCount, meta } =
      await notificationService.getNotifications(req.user._id, req.query);
    const response = new ApiResponse(200, "Notifications fetched", {
      notifications,
      unreadCount,
    });
    response.meta = meta;
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.user._id, req.params.id);
    res.json(new ApiResponse(200, "Notification marked as read"));
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user._id);
    res.json(new ApiResponse(200, "All notifications marked as read"));
  } catch (error) {
    next(error);
  }
};

export const checkDeadlines = async (req, res, next) => {
  try {
    const count = await notificationService.generateDeadlineReminders(
      req.user._id
    );
    res.json(
      new ApiResponse(200, `${count} new deadline reminder(s) generated`, {
        newReminders: count,
      })
    );
  } catch (error) {
    next(error);
  }
};
