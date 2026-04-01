// src/lib/config.ts

function requireEnv(key: string, fallback?: string): string {
  const val = process.env[key] || fallback;
  if (!val && process.env.NODE_ENV === "production") {
    console.warn(`[Config] Missing env var: ${key}`);
  }
  return val ?? "";
}

function parseJsonEnv<T>(key: string, fallback: T): T {
  try {
    const raw = process.env[key];
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    console.error(`[Config] Failed to parse JSON env var: ${key}`);
    return fallback;
  }
}

export const config = {
  // ── API ─────────────────────────────────────────────────────────────
  // In production:  "" + "/backend" → Vercel rewrites → Render
  // In development: "http://localhost:8000" + "" → direct
  hfModelUrl: requireEnv("NEXT_PUBLIC_HF_MODEL_URL", ""),
  
  apiUrl:
    process.env.NODE_ENV === "production"
      ? ""
      : requireEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000"),

  // /backend in prod, empty in dev (dev calls Render directly)
  apiPrefix:
    process.env.NODE_ENV === "production" ? "/backend" : "",

  renderDocsUrl: requireEnv(
    "NEXT_PUBLIC_RENDER_DOCS_URL",
    "http://localhost:8000/docs"
  ),

  // ── App ──────────────────────────────────────────────────────────────
  appTitle:   requireEnv("NEXT_PUBLIC_APP_TITLE",           "Credit Risk Assessor"),
  githubUrl:  requireEnv("NEXT_PUBLIC_GITHUB_URL",           ""),
  threshold:  parseFloat(requireEnv("NEXT_PUBLIC_DECISION_THRESHOLD", "0.4")),

  // ── Feature scaling ──────────────────────────────────────────────────
  featureMeans: parseJsonEnv<number[]>("NEXT_PUBLIC_FEATURE_MEANS", []),
  featureStds:  parseJsonEnv<number[]>("NEXT_PUBLIC_FEATURE_STDS",  []),

  featureNames: [
    "LIMIT_BAL","SEX","EDUCATION","MARRIAGE","AGE",
    "PAY_0","PAY_2","PAY_3","PAY_4","PAY_5","PAY_6",
    "BILL_AMT1","BILL_AMT2","BILL_AMT3","BILL_AMT4","BILL_AMT5","BILL_AMT6",
    "PAY_AMT1","PAY_AMT2","PAY_AMT3","PAY_AMT4","PAY_AMT5","PAY_AMT6",
  ] as const,

  // ── Vercel system vars ───────────────────────────────────────────────
  deploymentUrl: process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000",
  environment:   process.env.VERCEL_ENV  ?? "development",
  commitSha:    (process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7),
  isProduction:  process.env.VERCEL_ENV === "production",
} as const;

export function scaleFeatures(raw: number[]): number[] {
  const { featureMeans: means, featureStds: stds } = config;
  if (!means.length || !stds.length) {
    console.warn("[Config] Feature means/stds missing — sending unscaled");
    return raw;
  }
  return raw.map((v, i) => (v - means[i]) / (stds[i] + 1e-8));
}