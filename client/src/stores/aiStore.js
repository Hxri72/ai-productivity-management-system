import { create } from "zustand";
import api from "../api/axios";

const useAiStore = create((set) => ({
  prioritizedTasks: [],
  recommendation: "",
  suggestedTasks: [],
  logs: [],
  logsSummary: { totalCost: 0, totalTokens: 0, totalCalls: 0 },
  isPrioritizing: false,
  isRecommending: false,
  isLoadingLogs: false,
  fallbackUsed: false,

  prioritizeTasks: async () => {
    set({ isPrioritizing: true });
    try {
      const { data } = await api.post("/ai/prioritize");
      set({
        prioritizedTasks: data.data.tasks,
        fallbackUsed: data.data.fallbackUsed,
        isPrioritizing: false,
      });
      return data;
    } catch (error) {
      set({ isPrioritizing: false });
      throw error;
    }
  },

  getRecommendations: async () => {
    set({ isRecommending: true });
    try {
      const { data } = await api.post("/ai/suggest");
      set({
        recommendation: data.data.recommendation,
        suggestedTasks: data.data.suggestedTasks,
        fallbackUsed: data.data.fallbackUsed,
        isRecommending: false,
      });
      return data;
    } catch (error) {
      set({ isRecommending: false });
      throw error;
    }
  },

  fetchLogs: async (page = 1) => {
    set({ isLoadingLogs: true });
    try {
      const { data } = await api.get("/ai/logs", { params: { page } });
      set({
        logs: data.data.logs,
        logsSummary: data.data.summary,
        isLoadingLogs: false,
      });
    } catch {
      set({ isLoadingLogs: false });
    }
  },
}));

export default useAiStore;
