const API_URL =
  process.env.NODE_ENV === "production"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PredictionPayload {
  features: number[];
  threshold?: number;
}

export interface PredictionResult {
  risk_probability: number;
  risk_label: "HIGH RISK" | "LOW RISK";
  risk_score: number;
  top_attention_features: Record<string, number>;
  threshold_used: number;
  model_version: string;
}

export interface ApiHealth {
  status: string;
  model_loaded: boolean;
  n_features: number;
  dataset: string;
}

// ── Fetch with timeout helper ──────────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 60000       // 60s — enough for Render cold start
): Promise<Response> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ── Retry with exponential backoff ─────────────────────────────────────────
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 3000
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, 60000);
      if (res.ok || res.status < 500) return res;   // don't retry 4xx
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      const isLast = attempt === retries;
      if (isLast) throw err;
      console.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw new Error("All retries exhausted");
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_URL}/api${path}`;   // → /api/predict in prod, http://localhost:8000/api/predict in dev
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function checkHealth(): Promise<ApiHealth> {
  const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("API health check failed");
  return res.json();
}

export async function predictRisk(
  payload: PredictionPayload
): Promise<PredictionResult> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Prediction failed");
  }
  return res.json();
}