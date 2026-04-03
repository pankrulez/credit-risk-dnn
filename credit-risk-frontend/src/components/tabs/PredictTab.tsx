'use client';

import { useState, useEffect } from 'react';

interface PredictionRequest {
  LIMIT_BAL: number; SEX: number; EDUCATION: number; MARRIAGE: number; AGE: number;
  PAY_0: number; PAY_2: number; PAY_3: number; PAY_4: number; PAY_5: number; PAY_6: number;
  BILL_AMT1: number; BILL_AMT2: number; BILL_AMT3: number; BILL_AMT4: number; BILL_AMT5: number; BILL_AMT6: number;
  PAY_AMT1: number; PAY_AMT2: number; PAY_AMT3: number; PAY_AMT4: number; PAY_AMT5: number; PAY_AMT6: number;
}

interface PredictionResult {
  default: boolean;
  probability: number;
  topFeatures: Record<string, number>;
}

export default function PredictTab() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trigger animations on component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<PredictionRequest>({
    LIMIT_BAL: 50000, SEX: 2, EDUCATION: 2, MARRIAGE: 1, AGE: 37,
    PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0,
    BILL_AMT1: 46990, BILL_AMT2: 48233, BILL_AMT3: 49291,
    BILL_AMT4: 28314, BILL_AMT5: 28959, BILL_AMT6: 29547,
    PAY_AMT1: 2000, PAY_AMT2: 2019, PAY_AMT3: 1200,
    PAY_AMT4: 1100, PAY_AMT5: 1069, PAY_AMT6: 1000,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError(null); 
    setResult(null);

    const featureArray = [
      formData.LIMIT_BAL, formData.SEX, formData.EDUCATION, formData.MARRIAGE, formData.AGE,
      formData.PAY_0, formData.PAY_2, formData.PAY_3, formData.PAY_4, formData.PAY_5, formData.PAY_6,
      formData.BILL_AMT1, formData.BILL_AMT2, formData.BILL_AMT3, formData.BILL_AMT4, formData.BILL_AMT5, formData.BILL_AMT6,
      formData.PAY_AMT1, formData.PAY_AMT2, formData.PAY_AMT3, formData.PAY_AMT4, formData.PAY_AMT5, formData.PAY_AMT6
    ];

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
      const res = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: featureArray, threshold: 0.4 }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail ? JSON.stringify(errData.detail) : 'Prediction failed.');
      }

      const data = await res.json();
      setResult({
        default: data.risk_label === "HIGH RISK",
        probability: data.risk_probability,
        topFeatures: data.top_attention_features || {}
      });
      
      // Auto-scroll to results on mobile devices for better UX
      if (window.innerWidth < 1024) {
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 300);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN: The Input Form (Slides in first) */}
      <div className={`w-full lg:w-2/3 order-2 lg:order-1 transition-all duration-1000 ease-out delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Client Profile Section */}
          <div className="relative group">
            {/* Glowing Border Hover Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[1.5rem] blur opacity-0 group-hover:opacity-30 transition duration-1000 animate-gradient z-0"></div>
            
            <section className="relative z-10 bg-slate-50 dark:bg-[#1c1b19] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 transition-transform duration-300">
              <h3 className="text-base md:text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">Client Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Age</label>
                  <input type="number" name="AGE" value={formData.AGE} onChange={handleChange} 
                    className="w-full px-4 py-2.5 md:py-2 text-base md:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Limit Balance</label>
                  <input type="number" name="LIMIT_BAL" value={formData.LIMIT_BAL} onChange={handleChange} step="1000"
                    className="w-full px-4 py-2.5 md:py-2 text-base md:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Education</label>
                  <select name="EDUCATION" value={formData.EDUCATION} onChange={handleChange}
                    className="w-full px-4 py-2.5 md:py-2 text-base md:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    <option value={1}>Grad School</option>
                    <option value={2}>University</option>
                    <option value={3}>High School</option>
                    <option value={4}>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                  <select name="SEX" value={formData.SEX} onChange={handleChange}
                    className="w-full px-4 py-2.5 md:py-2 text-base md:text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all">
                    <option value={1}>Male</option>
                    <option value={2}>Female</option>
                  </select>
                </div>

              </div>
            </section>
          </div>

          {/* Repayment Status Section */}
          <div className="relative group">
            {/* Glowing Border Hover Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[1.5rem] blur opacity-0 group-hover:opacity-30 transition duration-1000 animate-gradient z-0"></div>
            
            <section className="relative z-10 bg-slate-50 dark:bg-[#1c1b19] p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 transition-transform duration-300">
              <h3 className="text-base md:text-lg font-bold mb-1 text-slate-800 dark:text-slate-100">Repayment Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">-1 = Pay duly, 1 = 1 month delay, 2 = 2 month delay</p>
              <div className="grid grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                {[0, 2, 3, 4, 5, 6].map((m) => (
                  <div key={`PAY_${m}`} className="space-y-1.5 group/input">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Month {m===0 ? 1 : m}</label>
                    <input type="number" name={`PAY_${m}`} value={(formData as any)[`PAY_${m}`]} onChange={handleChange} min="-2" max="8"
                      className="w-full px-3 py-2.5 md:py-2 text-base md:text-sm text-center rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-transform hover:-translate-y-0.5 focus:-translate-y-0.5 shadow-sm" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <button type="submit" disabled={loading}
            className="w-full md:w-auto px-8 py-3.5 md:py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-base md:text-sm">
            {loading ? 'Analyzing Profile...' : 'Predict Default Risk'}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: The Result Panel (Slides in second) */}
      <div className={`w-full lg:w-1/3 order-1 lg:order-2 transition-all duration-1000 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="lg:sticky lg:top-6">
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100 hidden lg:block">Analysis Result</h3>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 mb-6 lg:mb-0">
              <p className="text-sm font-bold">Error</p>
              <p className="text-xs mt-1 break-words">{error}</p>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="p-8 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl text-center text-slate-500 bg-slate-50/50 dark:bg-[#1c1b19] hidden lg:block hover:bg-slate-100 dark:hover:bg-zinc-900/50 transition-colors duration-300">
              <div className="text-4xl mb-3 opacity-50">🔮</div>
              <p className="text-sm font-medium">Submit the client profile to run inference.</p>
            </div>
          )}

          {loading && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#1c1b19] space-y-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
              <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded w-full"></div>
            </div>
          )}

          {result && !loading && (
            <div className="relative group">
              
              {/* DYNAMIC GLOWING BACKGROUND (Red if Default, Emerald if Paid) */}
              <div className={`absolute -inset-0.5 rounded-[1.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000 animate-gradient z-0 ${
                result.default ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}></div>
              
              {/* Foreground Card */}
              <div className={`relative z-10 p-6 rounded-2xl border shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                result.default ? 'border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-[#1f1011]' : 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-[#101f18]'
              }`}>
                
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Model Prediction</div>
                <div className={`text-3xl font-black tracking-tight ${result.default ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {result.default ? 'High Default Risk' : 'Low Default Risk'}
                </div>
                
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/50">
                  <div className="flex justify-between text-sm mb-2 text-slate-900 dark:text-slate-200">
                    <span className="font-semibold">Probability of Default</span>
                    <span className="font-black">{(result.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full transition-all duration-1000 ${result.default ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${result.probability * 100}%` }}></div>
                  </div>
                </div>

                {Object.keys(result.topFeatures).length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/50">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Key Drivers (XAI)</p>
                    <div className="space-y-2.5">
                      {Object.entries(result.topFeatures).slice(0, 3).map(([feature, weight], idx) => (
                        <div key={idx} className="flex justify-between items-center group/feature cursor-default">
                          <span className={`text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition-colors ${result.default ? 'group-hover/feature:border-red-500 group-hover/feature:text-red-600' : 'group-hover/feature:border-emerald-500 group-hover/feature:text-emerald-600'}`}>
                            {feature}
                          </span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Weight: {(weight as number).toFixed(3)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}