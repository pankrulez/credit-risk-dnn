const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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