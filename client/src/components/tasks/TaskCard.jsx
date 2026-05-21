import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineCalendar,
} from "react-icons/hi";
import { getPriorityConfig, getStatusConfig } from "../../utils/constants";
import { getRelativeTime, isOverdue } from "../../utils/formatDate";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const overdue = isOverdue(task.dueDate) && task.status !== "completed";

  const nextStatus = {
    todo: "in_progress",
    in_progress: "completed",
    completed: "todo",
  };

  return (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow ${
        overdue ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`font-medium text-gray-800 truncate ${
              task.status === "completed" ? "line-through text-gray-400" : ""
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityConfig.color}`}
            >
              {priorityConfig.label}
            </span>

            <button
              onClick={() =>
                task.status !== "archived" &&
                onStatusChange(task._id, nextStatus[task.status] || "todo")
              }
              className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity ${statusConfig.color}`}
            >
              {statusConfig.label}
            </button>

            <span className="text-xs text-gray-400 capitalize">
              {task.category}
            </span>

            {task.dueDate && (
              <span
                className={`text-xs flex items-center gap-1 ${
                  overdue ? "text-red-500 font-medium" : "text-gray-400"
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

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit"
          >
            <HiOutlinePencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
