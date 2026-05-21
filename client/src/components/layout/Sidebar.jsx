import { NavLink } from "react-router-dom";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLightBulb,
} from "react-icons/hi";

const navItems = [
  { to: "/dashboard", icon: HiOutlineHome, label: "Dashboard" },
  { to: "/tasks", icon: HiOutlineClipboardList, label: "Tasks" },
  { to: "/analytics", icon: HiOutlineChartBar, label: "Analytics" },
  { to: "/ai-suggest", icon: HiOutlineLightBulb, label: "AI Insights" },
  { to: "/settings", icon: HiOutlineCog, label: "Settings" },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-indigo-600">AI Productivity</h1>
        <p className="text-xs text-gray-400 mt-1">Manage. Prioritize. Achieve.</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
