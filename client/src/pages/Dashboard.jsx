import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineLightBulb,
  HiOutlinePlus,
} from "react-icons/hi";
import useAuthStore from "../stores/authStore";
import useTaskStore from "../stores/taskStore";
import { getPriorityConfig, getStatusConfig } from "../utils/constants";
import { getRelativeTime, isOverdue } from "../utils/formatDate";

const Dashboard = () => {
  const { user } = useAuthStore();
  const { stats, tasks, fetchStats, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchStats();
    fetchTasks(1);
  }, [fetchStats, fetchTasks]);

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: HiOutlineClipboardList,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-500",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: HiOutlineCheckCircle,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-500",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: HiOutlineClock,
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-500",
    },
    {
      label: "To Do",
      value: stats.todo,
      icon: HiOutlineLightBulb,
      color: "bg-purple-50 text-purple-700",
      iconColor: "text-purple-500",
    },
  ];

  // Show up to 5 most recent non-completed tasks
  const recentTasks = tasks
    .filter((t) => t.status !== "completed" && t.status !== "archived")
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}
            >
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Active Tasks</h2>
          <Link
            to="/tasks"
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <HiOutlinePlus className="w-4 h-4" />
            View All
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No active tasks</p>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:underline"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentTasks.map((task) => {
              const priority = getPriorityConfig(task.priority);
              const status = getStatusConfig(task.status);
              const overdue =
                isOverdue(task.dueDate) && task.status !== "completed";

              return (
                <div
                  key={task._id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${priority.color}`}
                    >
                      {priority.label}
                    </span>
                    <p className="text-sm text-gray-800 truncate">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {task.dueDate && (
                      <span
                        className={`text-xs ${
                          overdue ? "text-red-500 font-medium" : "text-gray-400"
                        }`}
                      >
                        {getRelativeTime(task.dueDate)}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Welcome */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
        <p className="text-gray-500">
          Welcome,{" "}
          <span className="font-semibold text-gray-800">{user?.name}</span>!
          {stats.total === 0
            ? " Start by creating your first task."
            : ` You have ${stats.todo + stats.in_progress} active tasks.`}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
