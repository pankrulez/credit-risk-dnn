"use client";

interface Props {
  features: Record<string, number>;
}

export default function FeatureBar({ features }: Props) {
  const max = Math.max(...Object.values(features));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="font-semibold text-gray-700 mb-4">
        🧠 Top Influential Features
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(features).map(([name, score]) => (
          <div key={name}>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{name}</span>
              <span className="font-mono">{score.toFixed(4)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(score / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}