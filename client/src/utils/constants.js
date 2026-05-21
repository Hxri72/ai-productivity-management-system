export const TASK_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
];

export const TASK_STATUSES = [
  { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-700" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "archived", label: "Archived", color: "bg-purple-100 text-purple-700" },
];

export const TASK_CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "study", label: "Study" },
  { value: "personal", label: "Personal" },
  { value: "health", label: "Health" },
  { value: "finance", label: "Finance" },
  { value: "other", label: "Other" },
];

export const getPriorityConfig = (priority) =>
  TASK_PRIORITIES.find((p) => p.value === priority) || TASK_PRIORITIES[1];

export const getStatusConfig = (status) =>
  TASK_STATUSES.find((s) => s.value === status) || TASK_STATUSES[0];

export const getCategoryConfig = (category) =>
  TASK_CATEGORIES.find((c) => c.value === category) || TASK_CATEGORIES[2];
