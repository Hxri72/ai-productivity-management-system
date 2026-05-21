import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { z } from "zod";
import { TASK_STATUS, TASK_PRIORITY, TASK_CATEGORIES } from "../utils/constants.js";

const router = Router();

// All task routes are protected
router.use(auth);

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().default(""),
  priority: z
    .enum(Object.values(TASK_PRIORITY))
    .optional()
    .default(TASK_PRIORITY.MEDIUM),
  category: z.enum(TASK_CATEGORIES).optional().default("personal"),
  tags: z.array(z.string().max(30)).max(10).optional().default([]),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().positive().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(Object.values(TASK_PRIORITY)).optional(),
  status: z.enum(Object.values(TASK_STATUS)).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().positive().optional().nullable(),
  actualMinutes: z.number().min(0).optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(Object.values(TASK_STATUS)),
});

// Routes
router.get("/stats", taskController.getTaskStats);
router.get("/", taskController.getTasks);
router.post("/", validate(createTaskSchema), taskController.createTask);
router.get("/:id", taskController.getTaskById);
router.patch("/:id", validate(updateTaskSchema), taskController.updateTask);
router.patch("/:id/status", validate(updateStatusSchema), taskController.updateTaskStatus);
router.delete("/:id", taskController.deleteTask);

export default router;
