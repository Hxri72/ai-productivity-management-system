import useAuthStore from "../stores/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: "0", color: "bg-blue-50 text-blue-700" },
          { label: "Completed", value: "0", color: "bg-green-50 text-green-700" },
          { label: "In Progress", value: "0", color: "bg-yellow-50 text-yellow-700" },
          { label: "AI Suggestions", value: "0", color: "bg-purple-50 text-purple-700" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color} inline-block px-2 py-1 rounded-lg`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-500">
          Welcome, <span className="font-semibold text-gray-800">{user?.name}</span>!
          Your productivity dashboard will come alive as you add tasks.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
