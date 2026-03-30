"use client";

import { useState } from "react";
import { predictRisk, PredictionResult } from "@/lib/api";
import RiskMeter from "@/components/RiskMeter";
import FeatureBar from "@/components/FeatureBar";

const MEANS = [167484,1.6,1.85,1.55,35.5,-0.02,-0.13,-0.17,-0.22,-0.27,-0.29,
               49179,47013,43263,40311,38871,36949,5663,5921,5226,4826,4799,5215];
const STDS  = [129747,0.49,0.79,0.52,9.2,1.12,1.20,1.20,1.17,1.14,1.15,
               73635,71173,67731,64332,60797,59554,16563,23040,17606,15666,15277,17777];

function scale(raw: number[]): number[] {
  return raw.map((v, i) => (v - MEANS[i]) / (STDS[i] + 1e-8));
}

export default function Home() {
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<PredictionResult | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.4);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    limit_bal: 200000, sex: 2, education: 2, marriage: 2, age: 35,
    pay_0: -1, pay_2: -1, pay_3: -1, pay_4: -1, pay_5: -1, pay_6: -1,
    bill1: 50000, bill2: 48000, bill3: 45000,
    bill4: 43000, bill5: 41000, bill6: 40000,
    pay_a1: 5000, pay_a2: 5000, pay_a3: 5000,
    pay_a4: 5000, pay_a5: 5000, pay_a6: 5000,
  });

  const field = (key: keyof typeof form, label: string, min: number,
                  max: number, step = 1000) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type="number" min={min} max={max} step={step}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const raw = [
        form.limit_bal, form.sex, form.education, form.marriage, form.age,
        form.pay_0, form.pay_2, form.pay_3, form.pay_4, form.pay_5, form.pay_6,
        form.bill1, form.bill2, form.bill3, form.bill4, form.bill5, form.bill6,
        form.pay_a1, form.pay_a2, form.pay_a3, form.pay_a4, form.pay_a5, form.pay_a6,
      ];
      const data = await predictRisk({ features: scale(raw), threshold });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900">🏦 Credit Risk Assessor</h1>
          <p className="text-gray-500 mt-2">
            Deep Neural Network · Attention-based Explainability · Taiwan Credit Dataset
          </p>
          <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            API: {process.env.NEXT_PUBLIC_API_URL}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl shadow-md p-6 mb-6">

            {/* Demographics */}
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">👤 Demographics</h2>
              {field("limit_bal", "Credit Limit (NT$)", 10000, 800000, 10000)}
              {field("age",       "Age",                18,    75,     1)}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <select
                  value={form.sex}
                  onChange={(e) => setForm({ ...form, sex: Number(e.target.value) })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={1}>Male</option>
                  <option value={2}>Female</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Education</label>
                <select
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: Number(e.target.value) })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={1}>Graduate School</option>
                  <option value={2}>University</option>
                  <option value={3}>High School</option>
                  <option value={4}>Other</option>
                </select>
              </div>
            </div>

            {/* Repayment */}
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">📅 Repayment Status</h2>
              <p className="text-xs text-gray-400">-1=Paid, 0=Min paid, 1-9=Delayed months</p>
              {field("pay_0", "September (latest)", -2, 9, 1)}
              {field("pay_2", "August",             -2, 9, 1)}
              {field("pay_3", "July",               -2, 9, 1)}
              {field("pay_4", "June",               -2, 9, 1)}
              {field("pay_5", "May",                -2, 9, 1)}
              {field("pay_6", "April",              -2, 9, 1)}
            </div>

            {/* Financials */}
            <div className="flex flex-col gap-4">
              <h2 className="font-semibold text-gray-800 border-b pb-2">💳 Bill & Payment</h2>
              {field("bill1",  "Bill Sep (NT$)",  0, 1000000)}
              {field("bill2",  "Bill Aug (NT$)",  0, 1000000)}
              {field("bill3",  "Bill Jul (NT$)",  0, 1000000)}
              {field("pay_a1", "Paid Sep (NT$)",  0, 500000)}
              {field("pay_a2", "Paid Aug (NT$)",  0, 500000)}
              {field("pay_a3", "Paid Jul (NT$)",  0, 500000)}
            </div>
          </div>

          {/* Threshold + Submit */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Decision Threshold: <strong>{threshold}</strong>
              </label>
              <input
                type="range" min={0.2} max={0.7} step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-8 py-3 rounded-xl transition-all w-full md:w-auto"
            >
              {loading ? "⏳ Analyzing..." : "🔍 Assess Credit Risk"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <RiskMeter
              score={result.risk_score}
              label={result.risk_label}
              probability={result.risk_probability}
            />
            <FeatureBar features={result.top_attention_features} />
            <p className="md:col-span-2 text-center text-xs text-gray-400">
              Model: {result.model_version} · Threshold: {result.threshold_used}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}