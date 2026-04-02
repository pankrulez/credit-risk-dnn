'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export default function BatchScoringPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any | null>(null);

  // Generates 1000 rows of synthetic, plausible Taiwan Credit Data
  const handleDownloadTemplate = () => {
    const headers = "LIMIT_BAL,SEX,EDUCATION,MARRIAGE,AGE,PAY_0,PAY_2,PAY_3,PAY_4,PAY_5,PAY_6,BILL_AMT1,BILL_AMT2,BILL_AMT3,BILL_AMT4,BILL_AMT5,BILL_AMT6,PAY_AMT1,PAY_AMT2,PAY_AMT3,PAY_AMT4,PAY_AMT5,PAY_AMT6\n";
    
    let csvContent = headers;
    for (let i = 0; i < 1000; i++) {
      const limit = Math.floor(Math.random() * 49 + 1) * 10000; // 10k to 500k
      const sex = Math.random() > 0.6 ? 1 : 2; // 60% female
      const edu = Math.floor(Math.random() * 3) + 1; // 1 to 3
      const mar = Math.floor(Math.random() * 2) + 1; // 1 or 2
      const age = Math.floor(Math.random() * 40) + 21; // 21 to 60
      
      // Generate somewhat correlated payment history (-1 to 2)
      const basePay = Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : 1) : (Math.random() > 0.5 ? 0 : -1);
      const pays = Array(6).fill(0).map(() => Math.max(-2, Math.min(8, basePay + Math.floor(Math.random() * 3) - 1)));
      
      // Generate bill amounts decreasing slightly over time
      const bills = Array(6).fill(0).map((_, idx) => Math.floor(limit * (0.8 - (idx * 0.05)) * Math.random()));
      
      // Generate payments (mostly paying off some of the bill)
      const payAmts = bills.map(b => Math.floor(b * Math.random() * 0.5));

      const row = [limit, sex, edu, mar, age, ...pays, ...bills, ...payAmts].join(',');
      csvContent += row + "\n";
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_1000_clients.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setResults(null); // Reset previous results if new file dropped
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    // Simulate backend batch processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          
          // Generate simulated analysis based on the file size (assuming roughly ~1000 lines for the test file)
          const rowCount = file.size > 100000 ? 1000 : Math.floor(Math.random() * 100) + 20;
          const highRisk = Math.floor(rowCount * (Math.random() * 0.15 + 0.15)); // ~15-30% high risk
          const lowRisk = rowCount - highRisk;

          setResults({
            totalProcessed: rowCount,
            highRiskFound: highRisk,
            lowRiskFound: lowRisk,
            avgProbability: (Math.random() * 0.2 + 0.15).toFixed(2),
            // Simulated distributions for the charts
            riskDistribution: [
              { name: 'Low Risk', value: lowRisk, fill: '#10b981' },
              { name: 'High Risk', value: highRisk, fill: '#ef4444' }
            ],
            ageDistribution: [
              { ageGroup: '20-30', HighRisk: Math.floor(highRisk * 0.4), LowRisk: Math.floor(lowRisk * 0.25) },
              { ageGroup: '31-40', HighRisk: Math.floor(highRisk * 0.3), LowRisk: Math.floor(lowRisk * 0.4) },
              { ageGroup: '41-50', HighRisk: Math.floor(highRisk * 0.2), LowRisk: Math.floor(lowRisk * 0.2) },
              { ageGroup: '51+', HighRisk: Math.floor(highRisk * 0.1), LowRisk: Math.floor(lowRisk * 0.15) }
            ]
          });

          // Auto-scroll down to results
          setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 300);
          return 100;
        }
        return prev + 5; // Fast progress increments
      });
    }, 100);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl z-50">
          {label && <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color || entry.payload.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto py-2 md:py-4">
      
      {/* Header & Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-[#1c1b19] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100">Batch Scoring</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Upload a CSV to score multiple clients simultaneously.</p>
        </div>
        <button onClick={handleDownloadTemplate} className="w-full sm:w-auto px-5 py-3 md:py-2.5 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50 rounded-xl transition-colors border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2">
          <span>📥</span> Download 1,000 Client CSV
        </button>
      </div>

      {/* Main Grid: Upload vs Results Top-line */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Col: Upload Zone */}
        <div className="lg:col-span-1 space-y-6">
          <div 
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl md:rounded-3xl p-8 text-center transition-all duration-300 h-full flex flex-col justify-center items-center ${
              isDragging ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="text-5xl mb-4">{file ? '📄' : '☁️'}</div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2 truncate w-full px-2">
              {file ? file.name : 'Drag & Drop CSV'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Standard UCI dataset format'}
            </p>

            <label className="cursor-pointer px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md transition-all text-sm w-full">
              Browse Files
              <input type="file" className="hidden" accept=".csv" onChange={(e) => { setFile(e.target.files?.[0] || null); setResults(null); }} />
            </label>
          </div>
        </div>

        {/* Right Col: Processing / Summary Cards */}
        <div className="lg:col-span-2">
          {!file && !results && (
            <div className="h-full min-h-[250px] p-8 border border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl md:rounded-3xl text-center text-slate-500 bg-slate-50/50 dark:bg-[#1c1b19] flex flex-col items-center justify-center">
              <div className="text-3xl mb-3 opacity-50">📊</div>
              <p className="text-sm font-medium">Upload a file to see batch processing results.</p>
            </div>
          )}

          {file && !results && (
            <div className="h-full min-h-[250px] bg-white dark:bg-[#1c1b19] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center animate-in fade-in duration-300">
              {isProcessing ? (
                <div className="space-y-4 w-full max-w-md mx-auto">
                  <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                    <span>Evaluating {file.name}...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-4 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-center text-slate-500 animate-pulse pt-2">Running Neural Network Inference...</p>
                </div>
              ) : (
                <button onClick={handleProcess} className="w-full max-w-md mx-auto px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all text-lg flex items-center justify-center gap-2 transform hover:scale-[1.02]">
                  <span>🚀</span> Start Batch Inference
                </button>
              )}
            </div>
          )}

          {/* Results Overview (Metrics) */}
        {results && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            
            {/* Card 1: Processed */}
            <div className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center text-center overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent dark:from-zinc-800/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider relative z-10">Processed</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white relative z-10">{results.totalProcessed}</p>
                <p className="text-xs text-slate-400 mt-2 relative z-10">Rows analyzed</p>
            </div>

            {/* Card 2: High Risk (With Animated Gradient Glow) */}
            <div className="group relative p-6 rounded-2xl md:rounded-3xl shadow-sm flex flex-col justify-center text-center overflow-hidden hover:-translate-y-1 hover:shadow-red-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                {/* The animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-rose-100 to-red-50 dark:from-red-950/40 dark:via-rose-900/30 dark:to-red-900/20 animate-gradient z-0"></div>
                {/* Card border and structure */}
                <div className="absolute inset-0 border border-red-200 dark:border-red-900/50 rounded-2xl md:rounded-3xl z-10"></div>
                
                <p className="text-red-600 dark:text-red-400 text-xs font-bold mb-1 uppercase tracking-wider relative z-20">High Risk</p>
                <p className="text-4xl font-black text-red-700 dark:text-red-400 relative z-20">{results.highRiskFound}</p>
                <p className="text-xs text-red-500 mt-2 relative z-20">{((results.highRiskFound / results.totalProcessed) * 100).toFixed(1)}% of total</p>
            </div>

            {/* Card 3: Avg Prob (With Animated Gradient Glow) */}
            <div className="group relative p-6 rounded-2xl md:rounded-3xl shadow-sm flex flex-col justify-center text-center overflow-hidden hover:-translate-y-1 hover:shadow-teal-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
                {/* The animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-emerald-100 to-teal-100 dark:from-teal-950/40 dark:via-emerald-900/20 dark:to-teal-900/30 animate-gradient z-0"></div>
                {/* Card border and structure */}
                <div className="absolute inset-0 border border-teal-200 dark:border-teal-900/50 rounded-2xl md:rounded-3xl z-10"></div>
                
                <p className="text-teal-700 dark:text-teal-400 text-xs font-bold mb-1 uppercase tracking-wider relative z-20">Avg Prob</p>
                <p className="text-4xl font-black text-teal-800 dark:text-teal-300 relative z-20">{(results.avgProbability * 100).toFixed(1)}%</p>
                <p className="text-xs text-teal-600 mt-2 relative z-20">Dataset average</p>
            </div>

            </div>
        )}
        </div>
      </div>

      {/* Dynamic Results Charts (Only visible after processing) */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="bg-white dark:bg-[#1c1b19] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Batch Risk Distribution</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={results.riskDistribution} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value">
                    {results.riskDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1b19] p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Risk by Age Demographics</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.ageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
                  <XAxis dataKey="ageGroup" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.05)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="LowRisk" name="Low Risk" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="HighRisk" name="High Risk" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}