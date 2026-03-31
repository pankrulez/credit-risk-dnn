"use client";

import { useEffect, useState } from "react";
import { checkHealth, ApiHealth } from "@/lib/api";

export default function APIStatusBanner() {
  const [health, setHealth]   = useState<ApiHealth | null>(null);
  const [error,  setError]    = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth()
      .then(setHealth)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
      ⏳ Connecting to API...
    </span>
  );

  if (error) return (
    <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
      🔴 API Offline — Check Render deployment
    </span>
  );

  return (
    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
      🟢 API Live · Model: {health?.model_loaded ? "✅ Loaded" : "❌ Not loaded"} · {health?.dataset}
    </span>
  );
}