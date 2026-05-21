import * as aiService from "../services/ai.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const prioritizeTasks = async (req, res, next) => {
  try {
    const result = await aiService.prioritizeTasks(req.user._id);
    res.json(
      new ApiResponse(200, result.message, {
        tasks: result.tasks,
        fallbackUsed: result.fallbackUsed,
        tokensUsed: result.tokensUsed || 0,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const result = await aiService.getRecommendations(req.user._id);
    res.json(
      new ApiResponse(200, "Recommendations generated", {
        recommendation: result.recommendation,
        suggestedTasks: result.suggestedTasks,
        fallbackUsed: result.fallbackUsed,
        tokensUsed: result.tokensUsed || 0,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const getAiLogs = async (req, res, next) => {
  try {
    const { logs, summary, meta } = await aiService.getAiLogs(
      req.user._id,
      req.query
    );
    const response = new ApiResponse(200, "AI logs fetched", { logs, summary });
    response.meta = meta;
    res.json(response);
  } catch (error) {
    next(error);
  }
};
