'use client';

import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      
      <div className={`mb-2 md:mb-6 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Model Evaluation</h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">Deep Neural Network performance metrics and global feature importance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ROC Curve Chart */}
        <div className={`group bg-white dark:bg-[#1c1b19] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-1000 delay-150 ease-out flex flex-col ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 group-hover:text-teal-600 transition-colors">ROC Curve (AUC = 0.78)</h3>
          <div className="h-[250px] md:h-[300px] w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%" children={undefined}>
              {/* Keep existing AreaChart code */}
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curve Chart */}
        <div className={`group bg-white dark:bg-[#1c1b19] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-1000 delay-300 ease-out flex flex-col ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 group-hover:text-teal-600 transition-colors">Precision-Recall Curve</h3>
          <div className="h-[250px] md:h-[300px] w-full flex-grow">
             <ResponsiveContainer width="100%" height="100%" children={undefined}>
              {/* Keep existing AreaChart code */}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className={`group bg-white dark:bg-[#1c1b19] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-1000 delay-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-teal-600 transition-colors">Global Feature Importance (SHAP)</h3>
        <div className="h-[300px] md:h-[400px] w-full mt-4">
           <ResponsiveContainer width="100%" height="100%" children={undefined}>
              {/* Keep existing BarChart code */}
           </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}