'use client';

import { useState } from 'react';

// Define the exact shape your frontend form uses
interface PredictionRequest {
  LIMIT_BAL: number;
  SEX: number;       // 1 = Male, 2 = Female
  EDUCATION: number; // 1 = Grad School, 2 = University, 3 = High School, 4 = Others
  MARRIAGE: number;  // 1 = Married, 2 = Single, 3 = Others
  AGE: number;
  PAY_0: number;     // Repayment status in September (-1=pay duly, 1=payment delay for one month, etc.)
  PAY_2: number;
  PAY_3: number;
  PAY_4: number;
  PAY_5: number;
  PAY_6: number;
  BILL_AMT1: number;
  BILL_AMT2: number;
  BILL_AMT3: number;
  BILL_AMT4: number;
  BILL_AMT5: number;
  BILL_AMT6: number;
  PAY_AMT1: number;
  PAY_AMT2: number;
  PAY_AMT3: number;
  PAY_AMT4: number;
  PAY_AMT5: number;
  PAY_AMT6: number;
}

// Update the result state to include the new explainability data
interface PredictionResult {
  default: boolean;
  probability: number;
  topFeatures: Record<string, number>;
}

export default function PredictTab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default values to make testing easier
  const [formData, setFormData] = useState<PredictionRequest>({
    LIMIT_BAL: 50000,
    SEX: 2,
    EDUCATION: 2,
    MARRIAGE: 1,
    AGE: 37,
    PAY_0: 0, PAY_2: 0, PAY_3: 0, PAY_4: 0, PAY_5: 0, PAY_6: 0,
    BILL_AMT1: 46990, BILL_AMT2: 48233, BILL_AMT3: 49291,
    BILL_AMT4: 28314, BILL_AMT5: 28959, BILL_AMT6: 29547,
    PAY_AMT1: 2000, PAY_AMT2: 2019, PAY_AMT3: 1200,
    PAY_AMT4: 1100, PAY_AMT5: 1069, PAY_AMT6: 1000,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // 1. Map the object to the exact array structure and order the backend expects!
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
        // 2. Wrap the array inside the 'features' key to satisfy Pydantic
        body: JSON.stringify({
          features: featureArray,
          threshold: 0.4
        }),
      });

      if (!res.ok) {
        // Attempt to extract FastAPI validation errors to display them
        const errData = await res.json().catch(() => null);
        console.error("Backend Error Details:", errData);
        throw new Error(errData?.detail ? JSON.stringify(errData.detail) : 'Prediction failed. Is the API running?');
      }

      const data = await res.json();
      
      // 3. Match the backend's exact response property names
      setResult({
        default: data.risk_label === "HIGH RISK",
        probability: data.risk_probability,
        topFeatures: data.top_attention_features || {}
      });

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* LEFT COLUMN: The Input Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Demographics */}
          <section className="bg-zinc-50 dark:bg-[#1c1b19] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Client Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Age</label>
                <input 
                  type="number" name="AGE" value={formData.AGE} onChange={handleChange} 
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Limit Balance (NT$)</label>
                <input 
                  type="number" name="LIMIT_BAL" value={formData.LIMIT_BAL} onChange={handleChange} step="1000"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Education</label>
                <select 
                  name="EDUCATION" value={formData.EDUCATION} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value={1}>Grad School</option>
                  <option value={2}>University</option>
                  <option value={3}>High School</option>
                  <option value={4}>Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gender</label>
                <select 
                  name="SEX" value={formData.SEX} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value={1}>Male</option>
                  <option value={2}>Female</option>
                </select>
              </div>

            </div>
          </section>

          {/* Section 2: Recent Payment Status */}
          <section className="bg-zinc-50 dark:bg-[#1c1b19] p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Repayment Status (Last 6 Months)</h3>
            <p className="text-xs text-zinc-500 mb-4">-1 = Pay duly, 1 = 1 month delay, 2 = 2 month delay, etc.</p>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[0, 2, 3, 4, 5, 6].map((m) => (
                <div key={`PAY_${m}`} className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Month {m===0 ? 1 : m}</label>
                  <input 
                    type="number" name={`PAY_${m}`} value={(formData as any)[`PAY_${m}`]} onChange={handleChange} min="-2" max="8"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Analyzing Profile...
              </>
            ) : (
              'Predict Default Risk'
            )}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: The Result Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Analysis Result</h3>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium">Prediction Error</p>
              <p className="text-xs mt-1 break-words font-mono">{error}</p>
            </div>
          )}

          {/* Empty / Initial State */}
          {!result && !loading && !error && (
            <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl text-center text-zinc-500 bg-zinc-50/50 dark:bg-[#1c1b19]">
              <div className="text-4xl mb-2">🔮</div>
              <p className="text-sm">Submit the client profile to run the DNN model inference.</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1c1b19] space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
              <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
            </div>
          )}

          {/* Result State */}
          {result && !loading && (
            <div className={`p-6 rounded-xl border shadow-lg ${
              result.default 
                ? 'border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20' 
                : 'border-green-300 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
            } animate-in slide-in-from-bottom-2 duration-300`}>
              
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Model Prediction</div>
              
              <div className={`text-2xl font-bold tracking-tight ${
                result.default ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
              }`}>
                {result.default ? 'High Default Risk' : 'Low Default Risk'}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <div className="flex justify-between text-sm mb-1.5 text-slate-900 dark:text-slate-200">
                  <span className="font-medium">Probability of Default</span>
                  <span className="font-bold">{(result.probability * 100).toFixed(1)}%</span>
                </div>
                
                {/* Probability Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${result.default ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${result.probability * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">Decision threshold: 40%</p>
              </div>

              {/* Explainability Section */}
              {Object.keys(result.topFeatures).length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Top Driving Factors
                  </p>
                  <div className="space-y-2">
                    {Object.entries(result.topFeatures).slice(0, 3).map(([feature, weight], idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                          {feature}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Weight: {(weight as number).toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
}