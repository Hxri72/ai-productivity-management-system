import { create } from "zustand";
import api from "../api/axios";

const useTaskStore = create((set, get) => ({
  tasks: [],
  stats: { total: 0, todo: 0, in_progress: 0, completed: 0, archived: 0 },
  meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  filters: { status: "", priority: "", category: "", search: "", sort: "-createdAt" },
  isLoading: false,

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  fetchTasks: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = { page, limit: 20 };

      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;

      const { data } = await api.get("/tasks", { params });
      set({ tasks: data.data.tasks, meta: data.meta, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get("/tasks/stats");
      set({ stats: data.data.stats });
    } catch {
      // silent fail
    }
  },

  createTask: async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    const { fetchTasks, fetchStats } = get();
    await Promise.all([fetchTasks(), fetchStats()]);
    return data.data.task;
  },

  updateTask: async (taskId, updates) => {
    const { data } = await api.patch(`/tasks/${taskId}`, updates);
    const { fetchTasks, fetchStats } = get();
    await Promise.all([fetchTasks(get().meta.page), fetchStats()]);
    return data.data.task;
  },

  updateTaskStatus: async (taskId, status) => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    const { fetchTasks, fetchStats } = get();
    await Promise.all([fetchTasks(get().meta.page), fetchStats()]);
    return data.data.task;
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    const { fetchTasks, fetchStats } = get();
    await Promise.all([fetchTasks(get().meta.page), fetchStats()]);
  },
}));

export default useTaskStore;
