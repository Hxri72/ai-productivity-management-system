import OpenAI from "openai";
import mongoose from "mongoose";
import Task from "../models/Task.js";
import AiLog from "../models/AiLog.js";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { TASK_STATUS } from "../utils/constants.js";

// Initialize OpenAI client
const openai = env.OPENAI_API_KEY && env.OPENAI_API_KEY !== "your_openai_api_key_here"
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

// GPT-4o-mini pricing (per 1M tokens)
const PRICING = { input: 0.15, output: 0.6 };

const estimateCost = (promptTokens, completionTokens) => {
  return (
    (promptTokens / 1_000_000) * PRICING.input +
    (completionTokens / 1_000_000) * PRICING.output
  );
};

// ─── FALLBACK: Rule-Based Scorer ─────────────────────────────────────────────
const calculateFallbackScore = (task) => {
  let score = 5;

  // Deadline urgency
  if (task.dueDate) {
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) score += 3;        // overdue
    else if (diffHours < 24) score += 2;  // due within 24h
    else if (diffHours < 72) score += 1;  // due within 3 days
  }

  // Priority boost
  if (task.priority === "urgent") score += 2;
  else if (task.priority === "high") score += 1;

  // Quick win bonus
  if (task.estimatedMinutes && task.estimatedMinutes <= 30) score += 1;

  return Math.min(Math.max(score, 1), 10); // clamp 1-10
};

const generateFallbackReasoning = (task, score) => {
  const parts = [];

  if (task.dueDate) {
    const diffHours = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60);
    if (diffHours < 0) parts.push("This task is overdue");
    else if (diffHours < 24) parts.push("Due within 24 hours");
    else if (diffHours < 72) parts.push("Due within 3 days");
  }

  if (task.priority === "urgent" || task.priority === "high") {
    parts.push(`Marked as ${task.priority} priority`);
  }

  if (task.estimatedMinutes && task.estimatedMinutes <= 30) {
    parts.push(`Quick task (~${task.estimatedMinutes} min)`);
  }

  return parts.length > 0
    ? parts.join(". ") + "."
    : "Standard priority task with no immediate deadline.";
};

// ─── AI: Prioritize Tasks ────────────────────────────────────────────────────
export const prioritizeTasks = async (userId) => {
  const tasks = await Task.find({
    userId,
    status: { $in: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS] },
  }).lean();

  if (tasks.length === 0) {
    return { tasks: [], fallbackUsed: false, message: "No pending tasks to prioritize" };
  }

  // Try OpenAI first, fallback to rule-based
  if (openai) {
    try {
      return await prioritizeWithAI(userId, tasks);
    } catch (error) {
      const statusCode = error.status || error.statusCode || "unknown";
      const errorType = error.type || error.code || "unknown";
      logger.warn(`OpenAI call failed [${statusCode} ${errorType}]: ${error.message}`);

      // If rate limited, log the retry-after header
      if (error.status === 429) {
        const retryAfter = error.headers?.["retry-after"] || "unknown";
        logger.warn(`Rate limited — retry after ${retryAfter}s`);
      }

      return await prioritizeWithFallback(userId, tasks, true, error.message);
    }
  }

  return await prioritizeWithFallback(userId, tasks, false);
};

const prioritizeWithAI = async (userId, tasks) => {
  const startTime = Date.now();

  // Build compact task list for prompt (save tokens)
  const taskSummary = tasks.map((t, i) => ({
    id: i,
    title: t.title,
    priority: t.priority,
    category: t.category,
    status: t.status,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : null,
    estimatedMin: t.estimatedMinutes || null,
  }));

  const systemPrompt = `You are a productivity prioritization assistant. Given a user's pending tasks, assign each task a priority score from 1-10 and a brief reasoning (1 sentence).

Rules:
- Overdue tasks get higher scores
- Tasks due within 24 hours get boosted
- Tasks with shorter estimated times get slight preference (quick wins)
- Higher manual priority (urgent > high > medium > low) should be respected
- Return ONLY valid JSON array, no markdown, no explanation

Output format:
[{"id": 0, "score": 8, "reasoning": "Due tomorrow, quick 30min task"}]`;

  const userPrompt = `Current date: ${new Date().toISOString().split("T")[0]}
Tasks: ${JSON.stringify(taskSummary)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const latencyMs = Date.now() - startTime;
  const usage = response.usage || {};
  const rawOutput = response.choices[0]?.message?.content || "[]";

  // Parse AI response
  let aiScores;
  try {
    // Strip markdown code fences if present
    const cleaned = rawOutput.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    aiScores = JSON.parse(cleaned);
  } catch {
    logger.error("Failed to parse AI response, using fallback");
    // Log the failed attempt
    await AiLog.create({
      userId,
      requestType: "prioritize",
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalCost: estimateCost(usage.prompt_tokens || 0, usage.completion_tokens || 0),
      inputSummary: userPrompt.slice(0, 500),
      outputSummary: rawOutput.slice(0, 1000),
      latencyMs,
      success: false,
      fallbackUsed: true,
    });
    return await prioritizeWithFallback(userId, tasks, true);
  }

  // Update tasks with AI scores
  const bulkOps = [];
  for (const aiItem of aiScores) {
    const task = tasks[aiItem.id];
    if (!task) continue;

    bulkOps.push({
      updateOne: {
        filter: { _id: task._id },
        update: {
          $set: {
            "aiPriority.score": aiItem.score,
            "aiPriority.reasoning": aiItem.reasoning,
            "aiPriority.lastCalculated": new Date(),
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }

  // Log AI usage
  await AiLog.create({
    userId,
    requestType: "prioritize",
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalCost: estimateCost(usage.prompt_tokens || 0, usage.completion_tokens || 0),
    inputSummary: userPrompt.slice(0, 500),
    outputSummary: rawOutput.slice(0, 1000),
    latencyMs,
    success: true,
    fallbackUsed: false,
  });

  // Fetch updated tasks
  const updatedTasks = await Task.find({
    userId,
    status: { $in: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS] },
  })
    .sort({ "aiPriority.score": -1 })
    .lean();

  return {
    tasks: updatedTasks,
    fallbackUsed: false,
    message: `${aiScores.length} tasks prioritized by AI`,
    tokensUsed: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
  };
};

const prioritizeWithFallback = async (userId, tasks, wasAIAttempted, errorReason = null) => {
  const startTime = Date.now();

  const bulkOps = tasks.map((task) => {
    const score = calculateFallbackScore(task);
    const reasoning = generateFallbackReasoning(task, score);

    return {
      updateOne: {
        filter: { _id: task._id },
        update: {
          $set: {
            "aiPriority.score": score,
            "aiPriority.reasoning": reasoning,
            "aiPriority.lastCalculated": new Date(),
          },
        },
      },
    };
  });

  await Task.bulkWrite(bulkOps);

  // Log fallback usage
  await AiLog.create({
    userId,
    requestType: "prioritize",
    promptTokens: 0,
    completionTokens: 0,
    totalCost: 0,
    inputSummary: errorReason ? `AI error: ${errorReason.slice(0, 300)}` : `Fallback scoring for ${tasks.length} tasks`,
    outputSummary: "Rule-based scoring applied",
    latencyMs: Date.now() - startTime,
    success: true,
    fallbackUsed: true,
  });

  const updatedTasks = await Task.find({
    userId,
    status: { $in: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS] },
  })
    .sort({ "aiPriority.score": -1 })
    .lean();

  return {
    tasks: updatedTasks,
    fallbackUsed: true,
    message: wasAIAttempted
      ? `AI unavailable — ${tasks.length} tasks scored with rule-based fallback`
      : `${tasks.length} tasks scored with rule-based engine (no API key configured)`,
  };
};

// ─── AI: Smart Recommendations ───────────────────────────────────────────────
export const getRecommendations = async (userId) => {
  const tasks = await Task.find({
    userId,
    status: { $in: [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS] },
  }).lean();

  if (tasks.length === 0) {
    return {
      recommendation: "You have no pending tasks. Great job — you're all caught up!",
      suggestedTasks: [],
      fallbackUsed: false,
    };
  }

  if (openai) {
    try {
      return await recommendWithAI(userId, tasks);
    } catch (error) {
      const statusCode = error.status || error.statusCode || "unknown";
      logger.warn(`OpenAI recommendation failed [${statusCode}]: ${error.message}`);
      return recommendWithFallback(tasks);
    }
  }

  return recommendWithFallback(tasks);
};

const recommendWithAI = async (userId, tasks) => {
  const startTime = Date.now();

  const taskSummary = tasks.map((t) => ({
    title: t.title,
    priority: t.priority,
    category: t.category,
    status: t.status,
    dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : null,
    estimatedMin: t.estimatedMinutes || null,
    aiScore: t.aiPriority?.score || null,
  }));

  const systemPrompt = `You are a productivity coach. Based on the user's current tasks, provide:
1. A brief recommendation paragraph (2-3 sentences) about what they should focus on now and why
2. Pick the top 3 tasks they should work on next, in order

Return ONLY valid JSON:
{"recommendation": "Your advice here", "topTasks": ["task title 1", "task title 2", "task title 3"]}`;

  const userPrompt = `Current time: ${new Date().toISOString()}
Day: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}
Pending tasks: ${JSON.stringify(taskSummary)}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  const latencyMs = Date.now() - startTime;
  const usage = response.usage || {};
  const rawOutput = response.choices[0]?.message?.content || "{}";

  let parsed;
  try {
    const cleaned = rawOutput.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    logger.error("Failed to parse AI recommendation");
    await AiLog.create({
      userId,
      requestType: "recommend",
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalCost: estimateCost(usage.prompt_tokens || 0, usage.completion_tokens || 0),
      inputSummary: userPrompt.slice(0, 500),
      outputSummary: rawOutput.slice(0, 1000),
      latencyMs,
      success: false,
      fallbackUsed: true,
    });
    return recommendWithFallback(tasks);
  }

  // Match suggested task titles to actual tasks
  const suggestedTasks = (parsed.topTasks || [])
    .map((title) => tasks.find((t) => t.title === title))
    .filter(Boolean);

  await AiLog.create({
    userId,
    requestType: "recommend",
    promptTokens: usage.prompt_tokens || 0,
    completionTokens: usage.completion_tokens || 0,
    totalCost: estimateCost(usage.prompt_tokens || 0, usage.completion_tokens || 0),
    inputSummary: userPrompt.slice(0, 500),
    outputSummary: rawOutput.slice(0, 1000),
    latencyMs,
    success: true,
    fallbackUsed: false,
  });

  return {
    recommendation: parsed.recommendation || "Focus on your highest priority tasks first.",
    suggestedTasks,
    fallbackUsed: false,
    tokensUsed: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
  };
};

const recommendWithFallback = (tasks) => {
  // Sort by: overdue first, then by priority weight, then by due date
  const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
  const sorted = [...tasks].sort((a, b) => {
    const aOverdue = a.dueDate && new Date(a.dueDate) < new Date() ? 1 : 0;
    const bOverdue = b.dueDate && new Date(b.dueDate) < new Date() ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;

    const aPriority = priorityWeight[a.priority] || 2;
    const bPriority = priorityWeight[b.priority] || 2;
    if (bPriority !== aPriority) return bPriority - aPriority;

    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    return 1;
  });

  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  const urgent = tasks.filter((t) => t.priority === "urgent" || t.priority === "high");

  let recommendation = "";
  if (overdue.length > 0) {
    recommendation = `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}. Focus on completing ${overdue.length === 1 ? "it" : "them"} first. `;
  }
  if (urgent.length > 0) {
    recommendation += `${urgent.length} task${urgent.length > 1 ? "s are" : " is"} marked as high or urgent priority. `;
  }
  recommendation += `Start with "${sorted[0].title}" as your next task.`;

  return {
    recommendation,
    suggestedTasks: sorted.slice(0, 3),
    fallbackUsed: true,
  };
};

// ─── AI Logs ─────────────────────────────────────────────────────────────────
export const getAiLogs = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AiLog.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    AiLog.countDocuments({ userId }),
  ]);

  // Calculate total cost
  const totalCost = await AiLog.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$totalCost" }, totalTokens: { $sum: { $add: ["$promptTokens", "$completionTokens"] } } } },
  ]);

  return {
    logs,
    summary: {
      totalCost: totalCost[0]?.total || 0,
      totalTokens: totalCost[0]?.totalTokens || 0,
      totalCalls: total,
    },
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
