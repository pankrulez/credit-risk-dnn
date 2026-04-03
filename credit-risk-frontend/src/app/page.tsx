'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectOverviewPage() {
  // Use state to trigger the mount animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-8">
      
      {/* Hero Section */}
      <section className={`text-center py-6 border-b border-slate-200 dark:border-slate-800 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold tracking-widest uppercase border border-teal-200 dark:border-teal-800/50 shadow-sm">
          V1.0 Live
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
          Credit Risk Analysis Dashboard
        </h2>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          An end-to-end Machine Learning pipeline designed to predict the probability of a client defaulting on their credit card payment next month.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
          <Link href="/predict" className="px-8 py-3.5 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto text-center">
            Try the Model
          </Link>
          <Link href="/insights" className="px-8 py-3.5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto text-center">
            View Analytics
          </Link>
        </div>
      </section>

      {/* Grid: Context & Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Dataset Context Card - Delayed Animation */}
        <div className={`relative group transition-all duration-1000 delay-150 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          
          {/* Glowing Animated Gradient Background (Hidden until hover) */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-1000 animate-gradient"></div>
          
          {/* Actual Card Content */}
          <div className="relative h-full bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-300">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-teal-100 dark:border-teal-800/50">
              🗄️
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">The Dataset</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              This project uses the famous <strong className="text-slate-800 dark:text-slate-200">Taiwan Credit Card Default Dataset (UCI ID: 350)</strong>. It contains data on 30,000 credit card clients in Taiwan from April 2005 to September 2005.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span> <span><strong>Total Records:</strong> 30,000</span></li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span> <span><strong>Features:</strong> 23 (Demographics, Payment History, Bill Amounts)</span></li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0"></span> <span><strong>Target:</strong> Default Payment Next Month (Yes/No)</span></li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span> <span><strong>Default Rate:</strong> ~22.1%</span></li>
            </ul>
          </div>
        </div>

        {/* Model Architecture Card - Further Delayed Animation */}
        <div className={`relative group transition-all duration-1000 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          
          {/* Glowing Animated Gradient Background (Hidden until hover) */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-1000 animate-gradient"></div>
          
          {/* Actual Card Content */}
          <div className="relative h-full bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-300 flex flex-col">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-purple-100 dark:border-purple-800/50">
              🧠
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">The Model</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              A custom <strong className="text-slate-800 dark:text-slate-200">Deep Neural Network (DNN)</strong> built with PyTorch. It features a modern Attention Mechanism to provide explainability (XAI), allowing us to see exactly <em>why</em> it makes a specific prediction.
            </p>
            
            {/* Embedded Pipeline Graphic */}
            <div className="mt-auto p-5 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 tracking-widest uppercase">Network Architecture</div>
              <div className="flex flex-col gap-2.5 font-mono text-xs text-center font-semibold">
                <div className="bg-white dark:bg-zinc-800 py-2 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 shadow-sm">Input Layer (23 Features)</div>
                <div className="text-slate-300 dark:text-slate-600">↓</div>
                <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 py-2 rounded-lg border border-purple-200 dark:border-purple-800/50 shadow-sm">Feature Attention Layer (XAI)</div>
                <div className="text-slate-300 dark:text-slate-600">↓</div>
                <div className="bg-white dark:bg-zinc-800 py-2 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 shadow-sm">Dense Hidden Layers + Dropout</div>
                <div className="text-slate-300 dark:text-slate-600">↓</div>
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 py-2 rounded-lg border border-rose-200 dark:border-rose-800/50 shadow-sm">Sigmoid Output (Probability)</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}