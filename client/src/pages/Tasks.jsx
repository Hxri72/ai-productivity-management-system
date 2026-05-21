import { useState, useEffect } from "react";
import { HiOutlinePlus } from "react-icons/hi";
import useTaskStore from "../stores/taskStore";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskList from "../components/tasks/TaskList";
import TaskForm from "../components/tasks/TaskForm";
import toast from "react-hot-toast";

const Tasks = () => {
  const { fetchTasks, fetchStats, createTask, updateTask, stats } =
    useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    // fetchTasks is handled by TaskFilters on mount
    fetchStats();
  }, [fetchStats]);

  const handleCreate = async (data) => {
    try {
      await createTask(data);
      toast.success("Task created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
      throw error;
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateTask(editingTask._id, data);
      toast.success("Task updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
      throw error;
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stats.total} total, {stats.completed} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <HiOutlinePlus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <TaskFilters />
      </div>

      {/* Task List */}
      <TaskList onEdit={handleEdit} />

      {/* Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Tasks;
