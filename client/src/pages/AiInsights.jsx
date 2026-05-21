import { useState, useEffect } from "react";
import {
  HiOutlineSparkles,
  HiOutlineRefresh,
  HiOutlineLightBulb,
  HiOutlineChip,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";
import useAiStore from "../stores/aiStore";
import AiSuggestions from "../components/ai/AiSuggestions";
import PriorityBadge from "../components/ai/PriorityBadge";
import { getPriorityConfig, getStatusConfig } from "../utils/constants";
import { getRelativeTime, isOverdue } from "../utils/formatDate";
import toast from "react-hot-toast";

const AiInsights = () => {
  const {
    prioritizedTasks,
    recommendation,
    suggestedTasks,
    logs,
    logsSummary,
    isPrioritizing,
    isRecommending,
    isLoadingLogs,
    fallbackUsed,
    prioritizeTasks,
    getRecommendations,
    fetchLogs,
  } = useAiStore();

  const [activeTab, setActiveTab] = useState("insights");

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePrioritize = async () => {
    try {
      const result = await prioritizeTasks();
      toast.success(result.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Prioritization failed");
    }
  };

  const handleRecommend = async () => {
    try {
      await getRecommendations();
      toast.success("Recommendations generated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get recommendations");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Insights</h1>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handlePrioritize}
          disabled={isPrioritizing}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            {isPrioritizing ? (
              <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <HiOutlineSparkles className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">Prioritize Tasks</p>
            <p className="text-xs text-gray-500 mt-0.5">
              AI scores all pending tasks from 1-10
            </p>
          </div>
        </button>

        <button
          onClick={handleRecommend}
          disabled={isRecommending}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all text-left disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            {isRecommending ? (
              <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            ) : (
              <HiOutlineLightBulb className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">Get Recommendations</p>
            <p className="text-xs text-gray-500 mt-0.5">
              AI suggests what to work on next
            </p>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: "insights", label: "Insights" },
          { key: "scores", label: "Task Scores" },
          { key: "logs", label: "AI Logs" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "insights" && (
        <>
          {recommendation ? (
            <AiSuggestions
              recommendation={recommendation}
              suggestedTasks={suggestedTasks}
              fallbackUsed={fallbackUsed}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <HiOutlineLightBulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Click "Get Recommendations" to get AI-powered suggestions
              </p>
            </div>
          )}
        </>
      )}

      {activeTab === "scores" && (
        <div className="bg-white rounded-xl border border-gray-200">
          {prioritizedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <HiOutlineSparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Click "Prioritize Tasks" to score your pending tasks
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {prioritizedTasks.map((task, index) => {
                const priority = getPriorityConfig(task.priority);
                const status = getStatusConfig(task.status);
                const overdue =
                  isOverdue(task.dueDate) && task.status !== "completed";

                return (
                  <div
                    key={task._id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <span className="text-lg font-bold text-gray-300 w-6 text-right">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${priority.color}`}
                        >
                          {priority.label}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                        {task.dueDate && (
                          <span
                            className={`text-xs ${
                              overdue ? "text-red-500" : "text-gray-400"
                            }`}
                          >
                            {getRelativeTime(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <PriorityBadge
                        score={task.aiPriority?.score}
                        reasoning={task.aiPriority?.reasoning}
                      />
                      {task.aiPriority?.reasoning && (
                        <p className="text-xs text-gray-400 mt-1 max-w-48 truncate">
                          {task.aiPriority.reasoning}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineChip className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">Total API Calls</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {logsSummary.totalCalls}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineRefresh className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">Total Tokens</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {logsSummary.totalTokens.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <HiOutlineCurrencyDollar className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">Est. Cost</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                ${logsSummary.totalCost.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {isLoadingLogs ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">No AI logs yet</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Tokens
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Latency
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 capitalize">{log.requestType}</td>
                      <td className="px-4 py-3">
                        {log.fallbackUsed ? (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Fallback
                          </span>
                        ) : log.success ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            AI
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {(log.promptTokens + log.completionTokens).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {log.latencyMs}ms
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInsights;
