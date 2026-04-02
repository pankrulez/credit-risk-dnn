'use client';

import { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function OverviewTab() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/plots/metrics.json')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Error loading metrics:", err));
  }, []);

  if (!data) {
    return <div className="p-12 text-center font-medium animate-pulse text-slate-500">Loading dataset overview...</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl z-50">
          {label && <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color || entry.payload.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
              {entry.name}: <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      
      <div className="mb-2 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Dataset Overview</h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">Exploring the 30,000 records from the Taiwan Credit Card dataset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class Balance Donut Chart (Staggered delay 1) */}
        <div className="group bg-white dark:bg-[#1c1b19] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Class Balance</h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4">Ratio of clients who paid vs defaulted.</p>
          <div className="flex-grow h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.class_balance} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value">
                  {data.class_balance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity duration-300 outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Demographics Bar Chart (Staggered delay 2) */}
        <div className="group bg-white dark:bg-[#1c1b19] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-teal-500/30 dark:hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Default Rate by Education</h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4">Breakdown of risk across education levels.</p>
          <div className="flex-grow h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.education_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                <XAxis dataKey="level" tick={{ fill: '#64748b', fontSize: 10 }} interval={0} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Paid" name="Low Risk (Paid)" fill="#10b981" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity duration-300" />
                <Bar dataKey="Defaulted" name="High Risk (Default)" fill="#ef4444" radius={[4, 4, 0, 0]} className="hover:opacity-80 transition-opacity duration-300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}