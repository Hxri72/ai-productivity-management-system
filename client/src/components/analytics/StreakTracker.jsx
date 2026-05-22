import { HiOutlineFire, HiOutlineTrendingUp, HiOutlineCheck, HiOutlineExclamation } from "react-icons/hi";

const StreakTracker = ({ overview }) => {
  if (!overview) return null;

  const cards = [
    {
      label: "Current Streak",
      value: `${overview.streak} day${overview.streak !== 1 ? "s" : ""}`,
      icon: HiOutlineFire,
      color: overview.streak > 0 ? "text-orange-500" : "text-gray-400",
      bg: overview.streak > 0 ? "bg-orange-50" : "bg-gray-50",
    },
    {
      label: "Completion Rate",
      value: `${overview.completionRate}%`,
      icon: HiOutlineTrendingUp,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Completed Today",
      value: overview.completedToday,
      icon: HiOutlineCheck,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Overdue",
      value: overview.overdue,
      icon: HiOutlineExclamation,
      color: overview.overdue > 0 ? "text-red-500" : "text-gray-400",
      bg: overview.overdue > 0 ? "bg-red-50" : "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StreakTracker;
