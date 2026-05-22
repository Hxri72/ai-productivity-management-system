import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import { NOTIFICATION_TYPES } from "../utils/constants.js";

export const getNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const markAsRead = async (userId, notificationId) => {
  await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true }
  );
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

// Generate deadline reminders for tasks due within 24 hours
export const generateDeadlineReminders = async (userId) => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcomingTasks = await Task.find({
    userId,
    status: { $in: ["todo", "in_progress"] },
    dueDate: { $gte: now, $lte: in24h },
  }).lean();

  const overdueTasks = await Task.find({
    userId,
    status: { $in: ["todo", "in_progress"] },
    dueDate: { $lt: now, $ne: null },
  }).lean();

  const notifications = [];

  // Check for existing reminders to avoid duplicates (last 24h)
  const recentReminders = await Notification.find({
    userId,
    type: NOTIFICATION_TYPES.DEADLINE,
    createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
  }).lean();

  const recentTaskIds = new Set(
    recentReminders.map((r) => r.relatedTask?.toString())
  );

  for (const task of upcomingTasks) {
    if (recentTaskIds.has(task._id.toString())) continue;
    notifications.push({
      userId,
      type: NOTIFICATION_TYPES.DEADLINE,
      title: "Deadline Approaching",
      message: `"${task.title}" is due within 24 hours`,
      relatedTask: task._id,
    });
  }

  for (const task of overdueTasks) {
    if (recentTaskIds.has(task._id.toString())) continue;
    notifications.push({
      userId,
      type: NOTIFICATION_TYPES.DEADLINE,
      title: "Task Overdue",
      message: `"${task.title}" is past its deadline`,
      relatedTask: task._id,
    });
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};
