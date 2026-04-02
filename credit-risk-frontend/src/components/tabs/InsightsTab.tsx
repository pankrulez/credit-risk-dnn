'use client';

import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export default function InsightsTab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/plots/metrics.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Error loading metrics:", err));
  }, []);

  if (!data) {
    return <div className="p-12 text-center animate-pulse text-slate-500">Loading model insights...</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Model Evaluation</h2>
        <p className="text-slate-600 dark:text-slate-400">Deep Neural Network performance metrics and global feature importance.</p>
      </div>

      {/* Top Row: ROC and PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROC Curve Chart */}
        <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">ROC Curve (AUC = 0.78)</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.roc_curve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTpr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="fpr" tick={{ fill: '#64748b', fontSize: 12 }} type="number" domain={[0, 1]} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 1]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tpr" name="True Positive Rate" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorTpr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">False Positive Rate</p>
        </div>

        {/* Precision-Recall Curve Chart */}
        <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Precision-Recall Curve</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.pr_curve} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrecision" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="recall" tick={{ fill: '#64748b', fontSize: 12 }} type="number" domain={[0, 1]} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 1]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="precision" name="Precision" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrecision)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">Recall</p>
        </div>
      </div>

      {/* Bottom Row: Feature Importance */}
      <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Global Feature Importance (SHAP)</h3>
        <p className="text-sm text-slate-500 mb-6">Identifies which features have the strongest overall impact on the model's predictions across all clients.</p>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.feature_importance} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis type="category" dataKey="feature" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} width={80} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="weight" name="Impact Weight" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                {data.feature_importance.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : index === 2 ? '#10b981' : '#3b82f6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}