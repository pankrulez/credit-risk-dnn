'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectOverviewPage() {
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
      </section>

      {/* ROW 1: Context & Results (The "Why") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* The Problem Card */}
        <div className={`relative group transition-all duration-1000 delay-150 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-orange-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 animate-gradient z-0"></div>
          <div className="relative z-10 h-full bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-300">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-rose-100 dark:border-rose-800/50">🚨</div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">The Problem</h3>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              In late 2005, Taiwan faced a massive "credit card slave" crisis. To capture market share, banks over-issued cash and credit cards to unqualified applicants, accumulating $268 Billion USD in debt.
            </p>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Hundreds of thousands of citizens defaulted. The goal of this project is to build a robust early-warning AI that accurately flags high-risk individuals based on their payment history before they default.
            </p>
          </div>
        </div>

        {/* The Solution & Results Card */}
        <div className={`relative group transition-all duration-1000 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 animate-gradient z-0"></div>
          <div className="relative z-10 h-full bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-300">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-teal-100 dark:border-teal-800/50">✨</div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">The Solution & Results</h3>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              We engineered a custom <strong className="text-slate-800 dark:text-slate-200">PyTorch Deep Neural Network</strong> utilizing a specialized Attention Mechanism. This allows the model to not only predict risk with an impressive <strong className="text-teal-600 dark:text-teal-400">AUC of 0.78</strong>, but also explain its logic.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <li className="flex items-start gap-3"><span className="text-emerald-500">✔</span> <span>Outperforms standard Logistic Regression baselines.</span></li>
              <li className="flex items-start gap-3"><span className="text-emerald-500">✔</span> <span>Processes 1,000+ clients instantly via batch scoring.</span></li>
              <li className="flex items-start gap-3"><span className="text-emerald-500">✔</span> <span>Highlights exact features driving the rejection/approval.</span></li>
            </ul>
          </div>
        </div>

      </div>

      {/* ROW 2: Technical Specifics (The "How") */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Dataset Context Card */}
        <div className={`relative group transition-all duration-1000 delay-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 animate-gradient z-0"></div>
          <div className="relative z-10 h-full bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-blue-100 dark:border-blue-800/50">🗄️</div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">The Dataset</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              This project uses the famous <strong className="text-slate-800 dark:text-slate-200">Taiwan Credit Card Default Dataset (UCI ID: 350)</strong>. It contains data on 30,000 credit card clients in Taiwan from April 2005 to September 2005.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span> <span><strong>Total Records:</strong> 30,000</span></li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span> <span><strong>Features:</strong> 23 (Demographics, Payment History, Bill Amounts)</span></li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0"></span> <span><strong>Target:</strong> Default Payment Next Month (Yes/No)</span></li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span> <span><strong>Default Rate:</strong> ~22.1%</span></li>
            </ul>
          </div>
        </div>

        {/* Model Architecture Card */}
        <div className={`relative group transition-all duration-1000 delay-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000 animate-gradient z-0"></div>
          <div className="relative z-10 h-full bg-white dark:bg-[#151515] p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-transform duration-300 flex flex-col">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-purple-100 dark:border-purple-800/50">🧠</div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">The Model Architecture</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              A custom <strong className="text-slate-800 dark:text-slate-200">Deep Neural Network (DNN)</strong> built with PyTorch. It features a modern Attention Mechanism to provide explainability (XAI), allowing us to see exactly <em>why</em> it makes a specific prediction.
            </p>
            
            <div className="mt-auto p-5 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 tracking-widest uppercase">Network Pipeline</div>
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