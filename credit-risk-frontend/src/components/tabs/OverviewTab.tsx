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
    return <div className="p-12 text-center animate-pulse text-slate-500">Loading dataset overview...</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl">
          {label && <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color || entry.payload.fill }}>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dataset Overview</h2>
        <p className="text-slate-600 dark:text-slate-400">Exploring the 30,000 records from the Taiwan Credit Card dataset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class Balance Donut Chart */}
        <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Class Balance (Target Variable)</h3>
          <div className="flex-grow min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.class_balance} 
                  cx="50%" cy="50%" 
                  innerRadius={80} outerRadius={110} 
                  paddingAngle={5} dataKey="value"
                >
                  {data.class_balance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Demographics Bar Chart */}
        <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Default Rate by Education</h3>
          <div className="flex-grow min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.education_data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="level" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="Paid" name="Low Risk (Paid)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Defaulted" name="High Risk (Default)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}