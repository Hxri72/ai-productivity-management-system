import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "#9ca3af" },
  medium: { label: "Medium", color: "#3b82f6" },
  high: { label: "High", color: "#f97316" },
  urgent: { label: "Urgent", color: "#ef4444" },
};

const PriorityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">By Priority</h3>
        <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
      </div>
    );
  }

  // Ensure all priorities are represented in order
  const order = ["low", "medium", "high", "urgent"];
  const chartData = order.map((p) => {
    const found = data.find((item) => item._id === p);
    return {
      name: PRIORITY_CONFIG[p]?.label || p,
      total: found?.count || 0,
      completed: found?.completed || 0,
      color: PRIORITY_CONFIG[p]?.color || "#6b7280",
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">By Priority</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriorityChart;
