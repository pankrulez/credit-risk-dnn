// src/lib/api.ts
import { config } from "./config";

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

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 65000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delayMs = 3000
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options);
      if (res.ok || res.status < 500) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
  throw new Error("All retries exhausted");
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${config.apiUrl}${config.apiPrefix}${path}`;

  const res = await fetchWithRetry(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Non-JSON response (${res.status}). ` +
      `Preview: ${text.slice(0, 100)}`
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const checkHealth  = (): Promise<ApiHealth>        => apiFetch("/health");
export const getFeatures  = (): Promise<{ features: string[] }> => apiFetch("/features");
export const predictRisk  = (p: PredictionPayload): Promise<PredictionResult> =>
  apiFetch("/predict", { method: "POST", body: JSON.stringify(p) });