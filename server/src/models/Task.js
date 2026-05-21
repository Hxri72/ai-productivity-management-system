import mongoose from "mongoose";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_CATEGORIES,
} from "../utils/constants.js";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    aiPriority: {
      score: { type: Number, min: 1, max: 10 },
      reasoning: String,
      suggestedDeadline: Date,
      lastCalculated: Date,
    },
    category: {
      type: String,
      enum: TASK_CATEGORIES,
      default: "personal",
    },
    tags: {
      type: [String],
      default: [],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedMinutes: {
      type: Number,
      min: 0,
      default: null,
    },
    actualMinutes: {
      type: Number,
      min: 0,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ userId: 1, category: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
