// src/app/page.tsx
"use client";

import { useState } from "react";
import { predictRisk, PredictionResult } from "@/lib/api";
import { config, scaleFeatures } from "@/lib/config";   // ← all values from config
import RiskMeter     from "@/components/RiskMeter";
import FeatureBar    from "@/components/FeatureBar";
import APIStatusBanner from "@/components/APIStatusBanner";

export default function Home() {
  const [loading,   setLoading]  = useState(false);
  const [result,    setResult]   = useState<PredictionResult | null>(null);
  const [error,     setError]    = useState<string | null>(null);
  const [threshold, setThreshold] = useState(config.threshold);   // ← from env

  const [form, setForm] = useState({
    limit_bal: 200000, sex: 2, education: 2, marriage: 2, age: 35,
    pay_0: -1, pay_2: -1, pay_3: -1, pay_4: -1, pay_5: -1, pay_6: -1,
    bill1: 50000, bill2: 48000, bill3: 45000,
    bill4: 43000, bill5: 41000, bill6: 40000,
    pay_a1: 5000, pay_a2: 5000, pay_a3: 5000,
    pay_a4: 5000, pay_a5: 5000, pay_a6: 5000,
  });

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
      const data = await predictRisk({
        features:  scaleFeatures(raw),  // ← uses means/stds from env
        threshold,
      });
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900">
            🏦 {config.appTitle}              {/* ← from env */}
          </h1>
          <p className="text-gray-500 mt-2">
            Deep Neural Network · Attention Explainability · Taiwan Credit Dataset
          </p>
          <div className="flex justify-center gap-3 mt-3">
            <APIStatusBanner />
            {config.githubUrl && (
              <a href={config.githubUrl} target="_blank" rel="noreferrer"
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-gray-200">
                📁 GitHub
              </a>
            )}
          </div>
        </div>
        {/* rest of form unchanged */}
      </div>
    </main>
  );
}