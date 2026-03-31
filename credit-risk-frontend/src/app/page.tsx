// src/app/page.tsx
"use client";

import { useState } from "react";
import { predictRisk, PredictionResult } from "@/lib/api";
import { config, scaleFeatures } from "@/lib/config";
import RiskMeter       from "@/components/RiskMeter";
import FeatureBar      from "@/components/FeatureBar";
import APIStatusBanner from "@/components/APIStatusBanner";

type FormState = {
  limit_bal: number; sex: number; education: number;
  marriage: number;  age: number;
  pay_0: number; pay_2: number; pay_3: number;
  pay_4: number; pay_5: number; pay_6: number;
  bill1: number; bill2: number; bill3: number;
  bill4: number; bill5: number; bill6: number;
  pay_a1: number; pay_a2: number; pay_a3: number;
  pay_a4: number; pay_a5: number; pay_a6: number;
};

const DEFAULT_FORM: FormState = {
  limit_bal: 200000, sex: 2, education: 2, marriage: 2, age: 35,
  pay_0: -1, pay_2: -1, pay_3: -1, pay_4: -1, pay_5: -1, pay_6: -1,
  bill1: 50000, bill2: 48000, bill3: 45000,
  bill4: 43000, bill5: 41000, bill6: 40000,
  pay_a1: 5000, pay_a2: 5000, pay_a3: 5000,
  pay_a4: 5000, pay_a5: 5000, pay_a6: 5000,
};

export default function Home() {
  const [form,      setForm]      = useState<FormState>(DEFAULT_FORM);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<PredictionResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [threshold, setThreshold] = useState(config.threshold);

  const setField = (key: keyof FormState, val: number) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── Reusable input components ──────────────────────────────────────────────
  const NumberInput = (
    key: keyof FormState,
    label: string,
    min: number,
    max: number,
    step = 1000
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <input
        type="number" min={min} max={max} step={step}
        value={form[key]}
        onChange={(e) => setField(key, Number(e.target.value))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-400
                   bg-white hover:border-gray-300 transition-colors"
      />
    </div>
  );

  const SelectInput = (
    key: keyof FormState,
    label: string,
    options: { value: number; label: string }[]
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={form[key]}
        onChange={(e) => setField(key, Number(e.target.value))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-400
                   bg-white hover:border-gray-300 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const raw = [
        form.limit_bal, form.sex,   form.education, form.marriage, form.age,
        form.pay_0,     form.pay_2, form.pay_3,     form.pay_4,
        form.pay_5,     form.pay_6,
        form.bill1,  form.bill2,  form.bill3,
        form.bill4,  form.bill5,  form.bill6,
        form.pay_a1, form.pay_a2, form.pay_a3,
        form.pay_a4, form.pay_a5, form.pay_a6,
      ];
      const data = await predictRisk({
        features:  scaleFeatures(raw),
        threshold,
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black text-gray-900">
            🏦 {config.appTitle}
          </h1>
          <p className="text-gray-500">
            Deep Neural Network · Attention-based Explainability · Taiwan Credit Dataset
          </p>
          <div className="flex justify-center items-center gap-3 flex-wrap">
            <APIStatusBanner />
            {config.githubUrl && (
              <a
                href={config.githubUrl}
                target="_blank" rel="noreferrer"
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5
                           rounded-full hover:bg-gray-200 transition-colors"
              >
                📁 GitHub
              </a>
            )}
            {config.renderDocsUrl && (
              <a
                href={config.renderDocsUrl}
                target="_blank" rel="noreferrer"
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5
                           rounded-full hover:bg-blue-100 transition-colors"
              >
                📄 API Docs
              </a>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Demographics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">
                👤 Demographics
              </h2>
              {NumberInput("limit_bal", "Credit Limit (NT$)", 10000, 800000, 10000)}
              {NumberInput("age",       "Age",                18,    75,     1)}
              {SelectInput("sex", "Gender", [
                { value: 1, label: "Male" },
                { value: 2, label: "Female" },
              ])}
              {SelectInput("education", "Education", [
                { value: 1, label: "Graduate School" },
                { value: 2, label: "University" },
                { value: 3, label: "High School" },
                { value: 4, label: "Other" },
              ])}
              {SelectInput("marriage", "Marital Status", [
                { value: 1, label: "Married" },
                { value: 2, label: "Single" },
                { value: 3, label: "Other" },
              ])}
            </div>

            {/* Repayment Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">
                📅 Repayment Status
              </h2>
              <p className="text-xs text-gray-400 -mt-2">
                -1 = Paid duly · 0 = Min paid · 1–9 = Months delayed
              </p>
              {NumberInput("pay_0", "September (latest)", -2, 9, 1)}
              {NumberInput("pay_2", "August",             -2, 9, 1)}
              {NumberInput("pay_3", "July",               -2, 9, 1)}
              {NumberInput("pay_4", "June",               -2, 9, 1)}
              {NumberInput("pay_5", "May",                -2, 9, 1)}
              {NumberInput("pay_6", "April",              -2, 9, 1)}
            </div>

            {/* Financials */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">
                💳 Bill & Payment (NT$)
              </h2>
              {NumberInput("bill1",  "Bill Statement Sep", 0, 1000000)}
              {NumberInput("bill2",  "Bill Statement Aug", 0, 1000000)}
              {NumberInput("bill3",  "Bill Statement Jul", 0, 1000000)}
              {NumberInput("bill4",  "Bill Statement Jun", 0, 1000000)}
              {NumberInput("bill5",  "Bill Statement May", 0, 1000000)}
              {NumberInput("bill6",  "Bill Statement Apr", 0, 1000000)}
              {NumberInput("pay_a1", "Amount Paid Sep",    0, 500000)}
              {NumberInput("pay_a2", "Amount Paid Aug",    0, 500000)}
              {NumberInput("pay_a3", "Amount Paid Jul",    0, 500000)}
              {NumberInput("pay_a4", "Amount Paid Jun",    0, 500000)}
              {NumberInput("pay_a5", "Amount Paid May",    0, 500000)}
              {NumberInput("pay_a6", "Amount Paid Apr",    0, 500000)}
            </div>
          </div>

          {/* Threshold + Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row items-center gap-5">
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Decision Threshold:{" "}
                  <span className="text-blue-600 font-bold">{threshold}</span>
                </label>
                <p className="text-xs text-gray-400">
                  Lower = more conservative (flags more applicants as risky)
                </p>
                <input
                  type="range" min={0.2} max={0.7} step={0.05}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0.2 (strict)</span>
                  <span>0.7 (lenient)</span>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 md:flex-none border border-gray-200 text-gray-600
                             font-medium px-6 py-3 rounded-xl hover:bg-gray-50
                             transition-colors"
                >
                  ↺ Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700
                             disabled:bg-blue-300 text-white font-bold px-8 py-3
                             rounded-xl transition-all"
                >
                  {loading ? "⏳ Analyzing..." : "🔍 Assess Risk"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-xl p-4 text-sm">
            <span className="font-semibold">⚠️ Error: </span>{error}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">📊 Assessment Result</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RiskMeter
                score={result.risk_score}
                label={result.risk_label}
                probability={result.risk_probability}
              />
              <FeatureBar features={result.top_attention_features} />
            </div>
            <p className="text-center text-xs text-gray-400">
              Model: {result.model_version} · Threshold used: {result.threshold_used}
              {config.commitSha !== "local" && ` · Build: ${config.commitSha}`}
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-gray-400 pt-4 border-t space-y-1">
          <p>
            {config.appTitle} · {config.environment} environment
          </p>
          <p>
            Built with Next.js · FastAPI · PyTorch · Deployed on Vercel + Render
          </p>
        </footer>

      </div>
    </main>
  );
}