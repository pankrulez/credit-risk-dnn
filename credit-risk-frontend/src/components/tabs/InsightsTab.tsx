'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function InsightsTab() {
  const [data, setData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/plots/metrics.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Error loading metrics:", err));
  }, []);

  if (!data) {
    return <div className="p-12 text-center font-medium animate-pulse text-slate-500">Loading model insights...</div>;
  }

  // Custom Tooltip for Recharts that fully supports Tailwind dark mode and dynamic colors
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl z-50">
          {label !== undefined && <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => {
            const color = entry.color || entry.payload.fill || '#3b82f6';
            return (
              <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                {entry.name}: {Number(entry.value).toFixed(4)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className={`mb-6 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Model Evaluation</h2>
        <p className="text-slate-600 dark:text-slate-400">Statistical proof of the neural network's accuracy and behavior.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROC Curve Chart */}
        <div className={`relative group transition-all duration-1000 delay-150 ease-out flex flex-col ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 z-0"></div>
          <div className="relative z-10 h-full bg-white dark:bg-[#1c1b19] p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col group-hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Receiver Operating Characteristic (ROC)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              <strong>What this means:</strong> Shows the trade-off between catching true defaults (True Positives) vs. falsely flagging good customers (False Positives). An AUC of 0.78 means the model has a 78% chance of perfectly distinguishing good and bad loans.
            </p>
            <div className="h-[250px] w-full flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.roc_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTpr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  {/* CRITICAL FIX: type="number" and domain={[0,1]} added back */}
                  <XAxis dataKey="fpr" type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tpr" name="True Positive Rate" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorTpr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-semibold text-center text-slate-500 mt-3 uppercase tracking-wider">False Positive Rate</p>
          </div>
        </div>

        {/* PR Curve Chart */}
        <div className={`relative group transition-all duration-1000 delay-300 ease-out flex flex-col ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-rose-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 z-0"></div>
          <div className="relative z-10 h-full bg-white dark:bg-[#1c1b19] p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col group-hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Precision-Recall Curve</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              <strong>What this means:</strong> Because defaults are rare, this chart is crucial. It proves that when the model says "High Risk" (Precision), it is usually correct, without missing too many of the actual bad loans hiding in the dataset (Recall).
            </p>
            <div className="h-[250px] w-full flex-grow">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.pr_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  {/* CRITICAL FIX: type="number" and domain={[0,1]} added back */}
                  <XAxis dataKey="recall" type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="number" domain={[0, 1]} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="precision" name="Precision" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrecision)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] font-semibold text-center text-slate-500 mt-3 uppercase tracking-wider">Recall</p>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className={`relative group transition-all duration-1000 delay-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 z-0"></div>
        <div className="relative z-10 bg-white dark:bg-[#1c1b19] p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Global Feature Importance (SHAP-Inspired)</h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6">
            <strong>What this means:</strong> This shows the overall DNA of the algorithm. Features at the top (like <code>PAY_0</code>, their most recent repayment status) are the most powerful indicators of default. Features at the bottom have almost no mathematical impact.
          </p>
          <div className="h-[350px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.feature_importance} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }} />
                  <Bar dataKey="weight" name="Impact Weight" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.feature_importance.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : index === 2 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}