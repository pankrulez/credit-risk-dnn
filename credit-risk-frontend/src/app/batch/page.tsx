'use client';

import { useState } from 'react';

export default function BatchScoringPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any | null>(null);

  // Generates a synthetic dataset for the user to download
  const handleDownloadTemplate = () => {
    const headers = "LIMIT_BAL,SEX,EDUCATION,MARRIAGE,AGE,PAY_0,PAY_2,PAY_3,PAY_4,PAY_5,PAY_6,BILL_AMT1,BILL_AMT2,BILL_AMT3,BILL_AMT4,BILL_AMT5,BILL_AMT6,PAY_AMT1,PAY_AMT2,PAY_AMT3,PAY_AMT4,PAY_AMT5,PAY_AMT6\n";
    const row1 = "50000,2,2,1,37,0,0,0,0,0,0,46990,48233,49291,28314,28959,29547,2000,2019,1200,1100,1069,1000\n";
    const row2 = "120000,1,1,2,26,-1,2,0,0,0,2,2682,1725,2682,3272,3455,3261,0,1000,1000,1000,0,2000\n";
    const row3 = "90000,2,2,2,34,0,0,0,0,0,0,29239,14027,13559,14331,14948,15549,1518,1500,1000,1000,1000,5000\n";
    
    const blob = new Blob([headers + row1 + row2 + row3], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_test_data.csv';
    a.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    // Simulate batch processing progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setResults({
            totalProcessed: Math.floor(Math.random() * 500) + 100,
            highRiskFound: Math.floor(Math.random() * 50) + 10,
            avgProbability: (Math.random() * 0.3 + 0.1).toFixed(2),
          });
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto py-4">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Batch Scoring</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">Upload a CSV to score multiple clients at once.</p>
        </div>
        <button onClick={handleDownloadTemplate} className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/50 rounded-lg transition-colors border border-teal-200 dark:border-teal-800">
          📥 Download Test CSV
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          isDragging ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10 scale-[1.02]' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900'
        }`}
      >
        <div className="text-5xl mb-4">{file ? '📄' : '☁️'}</div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
          {file ? file.name : 'Drag & Drop your CSV file here'}
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse from your computer'}
        </p>

        <label className="cursor-pointer px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold rounded-xl shadow-sm transition-all">
          Browse Files
          <input type="file" className="hidden" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {/* Processing Actions */}
      {file && !results && (
        <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
          {isProcessing ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Processing Records...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ) : (
            <button onClick={handleProcess} className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all text-lg">
              🚀 Run Batch Inference
            </button>
          )}
        </div>
      )}

      {/* Results Overview */}
      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Processed</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{results.totalProcessed}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm text-center">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">High Risk Clients</p>
            <p className="text-3xl font-extrabold text-red-700 dark:text-red-400">{results.highRiskFound}</p>
          </div>
          <div className="bg-teal-50 dark:bg-teal-950/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-900/50 shadow-sm text-center">
            <p className="text-teal-700 dark:text-teal-400 text-sm font-medium mb-1">Avg Default Prob</p>
            <p className="text-3xl font-extrabold text-teal-800 dark:text-teal-300">{(results.avgProbability * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

    </div>
  );
}