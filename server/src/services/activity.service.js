import Activity from "../models/Activity.js";

export const logActivity = async ({
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}) => {
  await Activity.create({ userId, action, entityType, entityId, metadata });
};

export const getUserActivities = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({ userId }),
  ]);

  return {
    activities,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
