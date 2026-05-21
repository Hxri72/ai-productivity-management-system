import TaskCard from "./TaskCard";
import useTaskStore from "../../stores/taskStore";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const TaskList = ({ onEdit }) => {
  const { tasks, meta, isLoading, fetchTasks, updateTaskStatus, deleteTask } =
    useTaskStore();

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(taskId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-400 text-lg">No tasks found</p>
        <p className="text-gray-400 text-sm mt-1">
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={handleDelete}
            onStatusChange={updateTaskStatus}
          />
        ))}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {(meta.page - 1) * meta.limit + 1}-
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchTasks(meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <span className="flex items-center px-3 text-sm text-gray-600">
              {meta.page} / {meta.totalPages}
            </span>
            <button
              onClick={() => fetchTasks(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
