import {
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineCalendar,
} from "react-icons/hi";
import { getPriorityConfig } from "../../utils/constants";
import { getRelativeTime, isOverdue } from "../../utils/formatDate";
import PriorityBadge from "./PriorityBadge";

const AiSuggestions = ({ recommendation, suggestedTasks, fallbackUsed }) => {
  return (
    <div className="space-y-4">
      {/* Recommendation */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <HiOutlineLightBulb className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800">AI Recommendation</h3>
              {fallbackUsed && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  Rule-based
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Tasks */}
      {suggestedTasks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5 text-purple-500" />
              Focus on These Next
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {suggestedTasks.map((task, index) => {
              const priority = getPriorityConfig(task.priority);
              const overdue =
                isOverdue(task.dueDate) && task.status !== "completed";

              return (
                <div
                  key={task._id}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
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

                      {task.aiPriority?.score && (
                        <PriorityBadge
                          score={task.aiPriority.score}
                          reasoning={task.aiPriority.reasoning}
                        />
                      )}

                      {task.dueDate && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            overdue ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          <HiOutlineCalendar className="w-3.5 h-3.5" />
                          {getRelativeTime(task.dueDate)}
                        </span>
                      )}

                      {task.estimatedMinutes && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          {task.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSuggestions;
