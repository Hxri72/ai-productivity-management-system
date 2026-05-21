import mongoose from "mongoose";
import { ACTIVITY_ACTIONS } from "../utils/constants.js";

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: Object.values(ACTIVITY_ACTIONS),
    required: true,
  },
  entityType: {
    type: String,
    enum: ["task", "user"],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound indexes for analytics queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, action: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
