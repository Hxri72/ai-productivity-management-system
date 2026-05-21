import { HiOutlineBell, HiOutlineLogout } from "react-icons/hi";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {user?.name || "User"}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <HiOutlineBell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-700">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
