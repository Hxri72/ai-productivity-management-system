import mongoose from "mongoose";
import Task from "../models/Task.js";
import ApiError from "../utils/ApiError.js";
import { TASK_STATUS, ACTIVITY_ACTIONS } from "../utils/constants.js";
import { logActivity } from "./activity.service.js";

export const createTask = async (userId, taskData) => {
  const task = await Task.create({ ...taskData, userId });

  await logActivity({
    userId,
    action: ACTIVITY_ACTIONS.TASK_CREATED,
    entityType: "task",
    entityId: task._id,
    metadata: { title: task.title, priority: task.priority },
  });

  return task;
};

export const getTasks = async (userId, query = {}) => {
  const {
    status,
    priority,
    category,
    search,
    sort = "-createdAt",
    page = 1,
    limit = 20,
  } = query;

  const filter = { userId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) {
    // Escape regex special characters to prevent crashes
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  // Build sort object from string like "-createdAt" or "dueDate"
  const sortObj = {};
  if (sort.startsWith("-")) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
    Task.countDocuments(filter),
  ]);

  return {
    tasks,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getTaskById = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  return task;
};

export const updateTask = async (userId, taskId, updates) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const oldStatus = task.status;

  // Apply updates
  Object.assign(task, updates);

  // If status changed to completed, set completedAt
  if (updates.status === TASK_STATUS.COMPLETED && oldStatus !== TASK_STATUS.COMPLETED) {
    task.completedAt = new Date();
  }
  // If status changed from completed to something else, clear completedAt
  if (updates.status && updates.status !== TASK_STATUS.COMPLETED && oldStatus === TASK_STATUS.COMPLETED) {
    task.completedAt = null;
  }

  await task.save();

  // Log activity
  const action =
    task.status === TASK_STATUS.COMPLETED && oldStatus !== TASK_STATUS.COMPLETED
      ? ACTIVITY_ACTIONS.TASK_COMPLETED
      : ACTIVITY_ACTIONS.TASK_UPDATED;

  await logActivity({
    userId,
    action,
    entityType: "task",
    entityId: task._id,
    metadata: {
      title: task.title,
      ...(updates.status && { oldStatus, newStatus: updates.status }),
    },
  });

  return task;
};

export const updateTaskStatus = async (userId, taskId, status) => {
  return updateTask(userId, taskId, { status });
};

export const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await logActivity({
    userId,
    action: ACTIVITY_ACTIONS.TASK_DELETED,
    entityType: "task",
    entityId: task._id,
    metadata: { title: task.title },
  });

  return task;
};

export const getTaskStats = async (userId) => {
  const stats = await Task.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    todo: 0,
    in_progress: 0,
    completed: 0,
    archived: 0,
  };

  stats.forEach(({ _id, count }) => {
    result[_id] = count;
    result.total += count;
  });

  return result;
};
