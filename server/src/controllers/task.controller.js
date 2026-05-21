import * as taskService from "../services/task.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user._id, req.body);
    res
      .status(201)
      .json(new ApiResponse(201, "Task created successfully", { task }));
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { tasks, meta } = await taskService.getTasks(req.user._id, req.query);
    const response = new ApiResponse(200, "Tasks fetched successfully", { tasks });
    response.meta = meta;
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.user._id, req.params.id);
    res.json(new ApiResponse(200, "Task fetched successfully", { task }));
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.user._id,
      req.params.id,
      req.body
    );
    res.json(new ApiResponse(200, "Task updated successfully", { task }));
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(
      req.user._id,
      req.params.id,
      req.body.status
    );
    res.json(new ApiResponse(200, "Task status updated", { task }));
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.user._id, req.params.id);
    res.json(new ApiResponse(200, "Task deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req, res, next) => {
  try {
    const stats = await taskService.getTaskStats(req.user._id);
    res.json(new ApiResponse(200, "Task stats fetched", { stats }));
  } catch (error) {
    next(error);
  }
};
