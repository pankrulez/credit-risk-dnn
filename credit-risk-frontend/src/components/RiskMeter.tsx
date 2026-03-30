"use client";

interface Props {
  score: number;       // 0-100
  label: string;
  probability: number;
}

export default function RiskMeter({ score, label, probability }: Props) {
  const isHigh  = label === "HIGH RISK";
  const color   = isHigh ? "bg-red-500" : "bg-green-500";
  const textCol = isHigh ? "text-red-600" : "text-green-600";
  const emoji   = isHigh ? "🔴" : "🟢";

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md">
      <p className={`text-2xl font-bold ${textCol}`}>{emoji} {label}</p>
      <p className="text-5xl font-black text-gray-800">{score}<span className="text-xl text-gray-400">/100</span></p>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${color} h-4 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-gray-500 text-sm">Default probability: <strong>{(probability * 100).toFixed(1)}%</strong></p>
    </div>
  );
}