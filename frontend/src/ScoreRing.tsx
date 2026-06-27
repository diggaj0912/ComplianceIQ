export function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score < 30 ? "#22c55e" : score < 60 ? "#f59e0b" : "#ef4444";
  const label = score < 30 ? "Excellent" : score < 60 ? "At Risk" : "Critical";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Compliance Score</p>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10"/>
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" style={{transition:"stroke-dashoffset 1s ease"}}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${score < 30 ? "bg-green-100 text-green-700" : score < 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{label}</span>
    </div>
  );
}
