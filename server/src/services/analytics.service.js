import mongoose from "mongoose";
import Task from "../models/Task.js";
import Activity from "../models/Activity.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ─── Overview Stats ──────────────────────────────────────────────────────────
export const getOverview = async (userId) => {
  const uid = toObjectId(userId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [statusStats, todayCompleted, overdueTasks, streakData] =
    await Promise.all([
      // Task counts by status
      Task.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Tasks completed today
      Task.countDocuments({
        userId,
        status: "completed",
        completedAt: { $gte: todayStart },
      }),

      // Overdue tasks
      Task.countDocuments({
        userId,
        status: { $in: ["todo", "in_progress"] },
        dueDate: { $lt: now, $ne: null },
      }),

      // Streak: consecutive days with completions
      getStreak(userId),
    ]);

  const stats = { total: 0, todo: 0, in_progress: 0, completed: 0, archived: 0 };
  statusStats.forEach(({ _id, count }) => {
    stats[_id] = count;
    stats.total += count;
  });

  // Completion rate
  const completionRate =
    stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

  return {
    ...stats,
    completedToday: todayCompleted,
    overdue: overdueTasks,
    streak: streakData,
    completionRate,
  };
};

// ─── Productivity (daily completions for last N days) ────────────────────────
export const getProductivity = async (userId, { days = 7 } = {}) => {
  const uid = toObjectId(userId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const data = await Task.aggregate([
    {
      $match: {
        userId: uid,
        status: "completed",
        completedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
        count: { $sum: 1 },
        totalMinutes: { $sum: { $ifNull: ["$actualMinutes", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days with 0
  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const found = data.find((item) => item._id === dateStr);
    result.push({
      date: dateStr,
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      count: found?.count || 0,
      minutes: found?.totalMinutes || 0,
    });
  }

  return result;
};

// ─── Category Distribution ───────────────────────────────────────────────────
export const getCategoryDistribution = async (userId) => {
  const uid = toObjectId(userId);

  return Task.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ─── Priority Distribution ───────────────────────────────────────────────────
export const getPriorityDistribution = async (userId) => {
  const uid = toObjectId(userId);

  return Task.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
  ]);
};

// ─── Completion Trends (weekly for last 4 weeks) ────────────────────────────
export const getTrends = async (userId) => {
  const uid = toObjectId(userId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);
  startDate.setHours(0, 0, 0, 0);

  const data = await Task.aggregate([
    {
      $match: {
        userId: uid,
        status: "completed",
        completedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%U",
            date: "$completedAt",
          },
        },
        count: { $sum: 1 },
        avgMinutes: { $avg: { $ifNull: ["$actualMinutes", 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return data.map((item) => ({
    week: item._id,
    count: item.count,
    avgMinutes: Math.round(item.avgMinutes || 0),
  }));
};

// ─── Estimation Accuracy ────────────────────────────────────────────────────
export const getEstimationAccuracy = async (userId) => {
  const uid = toObjectId(userId);

  const data = await Task.aggregate([
    {
      $match: {
        userId: uid,
        status: "completed",
        estimatedMinutes: { $gt: 0 },
        actualMinutes: { $gt: 0 },
      },
    },
    {
      $project: {
        title: 1,
        estimated: "$estimatedMinutes",
        actual: "$actualMinutes",
        accuracy: {
          $round: [
            {
              $multiply: [
                { $divide: ["$actualMinutes", "$estimatedMinutes"] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { accuracy: 1 } },
    { $limit: 20 },
  ]);

  return data;
};

// ─── Most Productive Day of Week ─────────────────────────────────────────────
export const getProductiveDay = async (userId) => {
  const uid = toObjectId(userId);

  return Task.aggregate([
    { $match: { userId: uid, status: "completed", completedAt: { $ne: null } } },
    {
      $group: {
        _id: { $dayOfWeek: "$completedAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// ─── Streak Calculator ──────────────────────────────────────────────────────
const getStreak = async (userId) => {
  const uid = toObjectId(userId);

  // Get distinct completion dates, sorted newest first
  const completionDates = await Task.aggregate([
    {
      $match: {
        userId: uid,
        status: "completed",
        completedAt: { $ne: null },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 60 },
  ]);

  if (completionDates.length === 0) return 0;

  const dates = completionDates.map((d) => d._id);
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Streak must include today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = (curr - prev) / 86400000;

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
