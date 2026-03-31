"use client";

import { JSX, useEffect, useState } from "react";
import { checkHealth, ApiHealth } from "@/lib/api";
import { config } from "@/lib/config";

type Status = "loading" | "waking" | "live" | "offline";

export default function APIStatusBanner() {
  const [status,  setStatus]  = useState<Status>("loading");
  const [health,  setHealth]  = useState<ApiHealth | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start      = Date.now();
    const wakingTimer = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "waking" : s));
    }, 4000);
    const ticker = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    checkHealth()
      .then((h) => { setHealth(h); setStatus("live"); })
      .catch(()  => setStatus("offline"))
      .finally(() => { clearTimeout(wakingTimer); clearInterval(ticker); });

    return () => { clearTimeout(wakingTimer); clearInterval(ticker); };
  }, []);

  const banners: Record<Status, JSX.Element> = {
    loading: (
      <span className="text-xs bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full animate-pulse">
        ⏳ Connecting to API...
      </span>
    ),
    waking: (
      <span className="text-xs bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full">
        ☕ Waking up Render server... ({elapsed}s)
      </span>
    ),
    live: (
      <span className="text-xs bg-green-100 text-green-700 px-4 py-1.5 rounded-full">
        🟢 API Live · {health?.model_loaded ? "✅ Model Loaded" : "❌ Model Missing"} · {health?.dataset}
      </span>
    ),
    offline: (
      <span className="text-xs bg-red-100 text-red-600 px-4 py-1.5 rounded-full">
        🔴 API Offline —{" "}
        {config.renderDocsUrl && (
          <a href={config.renderDocsUrl} target="_blank" rel="noreferrer"
            className="underline">
            Check Render
          </a>
        )}
      </span>
    ),
  };

  return banners[status];
}