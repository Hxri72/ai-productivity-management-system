import { create } from "zustand";
import api from "../api/axios";

const useAnalyticsStore = create((set) => ({
  overview: null,
  productivity: [],
  categories: [],
  priorities: [],
  trends: [],
  accuracy: [],
  productiveDay: [],
  isLoading: false,

  fetchOverview: async () => {
    try {
      const { data } = await api.get("/analytics/overview");
      set({ overview: data.data.overview });
    } catch {
      // silent
    }
  },

  fetchProductivity: async (days = 7) => {
    try {
      const { data } = await api.get("/analytics/productivity", {
        params: { days },
      });
      set({ productivity: data.data.productivity });
    } catch {
      // silent
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get("/analytics/categories");
      set({ categories: data.data.categories });
    } catch {
      // silent
    }
  },

  fetchPriorities: async () => {
    try {
      const { data } = await api.get("/analytics/priorities");
      set({ priorities: data.data.priorities });
    } catch {
      // silent
    }
  },

  fetchTrends: async () => {
    try {
      const { data } = await api.get("/analytics/trends");
      set({ trends: data.data.trends });
    } catch {
      // silent
    }
  },

  fetchAccuracy: async () => {
    try {
      const { data } = await api.get("/analytics/accuracy");
      set({ accuracy: data.data.accuracy });
    } catch {
      // silent
    }
  },

  fetchProductiveDay: async () => {
    try {
      const { data } = await api.get("/analytics/productive-day");
      set({ productiveDay: data.data.days });
    } catch {
      // silent
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    const store = useAnalyticsStore.getState();
    await Promise.all([
      store.fetchOverview(),
      store.fetchProductivity(7),
      store.fetchCategories(),
      store.fetchPriorities(),
      store.fetchTrends(),
      store.fetchProductiveDay(),
    ]);
    set({ isLoading: false });
  },
}));

export default useAnalyticsStore;
