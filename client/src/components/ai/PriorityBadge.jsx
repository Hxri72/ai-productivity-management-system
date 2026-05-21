const getScoreColor = (score) => {
  if (score >= 8) return "bg-red-100 text-red-700 border-red-200";
  if (score >= 6) return "bg-orange-100 text-orange-700 border-orange-200";
  if (score >= 4) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-green-100 text-green-700 border-green-200";
};

const PriorityBadge = ({ score, reasoning }) => {
  if (!score) return null;

  return (
    <div className="group relative inline-flex">
      <span
        className={`text-xs font-bold px-1.5 py-0.5 rounded border ${getScoreColor(score)}`}
      >
        AI: {score}/10
      </span>

      {reasoning && (
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-10">
          <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
            {reasoning}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityBadge;
