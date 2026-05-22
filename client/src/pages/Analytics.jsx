import { useEffect, useState } from "react";
import useAnalyticsStore from "../stores/analyticsStore";
import ProductivityChart from "../components/analytics/ProductivityChart";
import TaskDistribution from "../components/analytics/TaskDistribution";
import PriorityChart from "../components/analytics/PriorityChart";
import StreakTracker from "../components/analytics/StreakTracker";

const Analytics = () => {
  const {
    overview,
    productivity,
    categories,
    priorities,
    trends,
    productiveDay,
    isLoading,
    fetchAll,
    fetchProductivity,
  } = useAnalyticsStore();

  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    fetchProductivity(days);
  }, [days, fetchProductivity]);

  const dayNames = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bestDay = productiveDay?.[0];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { label: "7 days", value: 7 },
            { label: "14 days", value: 14 },
            { label: "30 days", value: 30 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                days === opt.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Streak & Overview Cards */}
      <div className="mb-6">
        <StreakTracker overview={overview} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductivityChart data={productivity} />
        <TaskDistribution data={categories} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PriorityChart data={priorities} />

        {/* Most Productive Day */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Most Productive Day
          </h3>
          {bestDay ? (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-5xl font-bold text-indigo-600">
                {dayNames[bestDay._id]}
              </p>
              <p className="text-gray-500 mt-2">
                {bestDay.count} tasks completed on{" "}
                {dayNames[bestDay._id]}s
              </p>
              {productiveDay.length > 1 && (
                <div className="mt-4 w-full space-y-2">
                  {productiveDay.map((d) => (
                    <div
                      key={d._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {dayNames[d._id]}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{
                              width: `${(d.count / bestDay.count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-500 w-6 text-right">
                          {d.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              Complete tasks to see your most productive day
            </p>
          )}
        </div>
      </div>

      {/* Weekly Trends */}
      {trends.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Trends</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trends.map((week) => (
              <div
                key={week.week}
                className="text-center p-3 bg-gray-50 rounded-lg"
              >
                <p className="text-xs text-gray-400">Week {week.week.split("-")[1]}</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {week.count}
                </p>
                <p className="text-xs text-gray-500">tasks completed</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
