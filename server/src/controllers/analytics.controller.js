import * as analyticsService from "../services/analytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getOverview = async (req, res, next) => {
  try {
    const overview = await analyticsService.getOverview(req.user._id);
    res.json(new ApiResponse(200, "Overview fetched", { overview }));
  } catch (error) {
    next(error);
  }
};

export const getProductivity = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const productivity = await analyticsService.getProductivity(req.user._id, {
      days: Math.min(days, 90),
    });
    res.json(new ApiResponse(200, "Productivity data fetched", { productivity }));
  } catch (error) {
    next(error);
  }
};

export const getCategoryDistribution = async (req, res, next) => {
  try {
    const categories = await analyticsService.getCategoryDistribution(
      req.user._id
    );
    res.json(new ApiResponse(200, "Category distribution fetched", { categories }));
  } catch (error) {
    next(error);
  }
};

export const getPriorityDistribution = async (req, res, next) => {
  try {
    const priorities = await analyticsService.getPriorityDistribution(
      req.user._id
    );
    res.json(new ApiResponse(200, "Priority distribution fetched", { priorities }));
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const trends = await analyticsService.getTrends(req.user._id);
    res.json(new ApiResponse(200, "Trends fetched", { trends }));
  } catch (error) {
    next(error);
  }
};

export const getEstimationAccuracy = async (req, res, next) => {
  try {
    const accuracy = await analyticsService.getEstimationAccuracy(req.user._id);
    res.json(new ApiResponse(200, "Estimation accuracy fetched", { accuracy }));
  } catch (error) {
    next(error);
  }
};

export const getProductiveDay = async (req, res, next) => {
  try {
    const days = await analyticsService.getProductiveDay(req.user._id);
    res.json(new ApiResponse(200, "Productive day fetched", { days }));
  } catch (error) {
    next(error);
  }
};
