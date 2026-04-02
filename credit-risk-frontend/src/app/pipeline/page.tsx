'use client';

import { useState } from 'react';

export default function PipelinePage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: 'Data Ingestion',
      icon: '📥',
      desc: 'Raw credit card data (30k records) is fetched from the UCI ML Repository API.',
      details: 'Features include demographic info, payment history across 6 months, and bill amounts.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Preprocessing & Scaling',
      icon: '⚙️',
      desc: 'StandardScaler normalizes the wide variance in financial amounts.',
      details: 'Limits and Bill Amounts are scaled so the Neural Network weights update evenly without exploding gradients.',
      color: 'from-cyan-500 to-teal-500'
    },
    {
      id: 3,
      title: 'Attention Mechanism',
      icon: '🔍',
      desc: 'A custom PyTorch layer learns which features matter most.',
      details: 'This provides Local Explainability (XAI), allowing the model to highlight if recent late payments or total debt drove the decision.',
      color: 'from-teal-500 to-emerald-500'
    },
    {
      id: 4,
      title: 'Deep Neural Network',
      icon: '🧠',
      desc: 'Multiple hidden layers with Dropout for regularization.',
      details: 'Extracts deep non-linear patterns from the credit behavior to accurately assess default risk.',
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 5,
      title: 'Risk Prediction',
      icon: '🎯',
      desc: 'Sigmoid output yields a precise probability of default.',
      details: 'Thresholds are applied (e.g., >40% = High Risk) to trigger business logic or alerts.',
      color: 'from-green-500 to-lime-500'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto py-8">
      
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">ML Architecture Pipeline</h2>
        <p className="text-slate-600 dark:text-slate-400">Hover or click on a step to see how data transforms through the system.</p>
      </div>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-[28px] md:left-1/2 top-8 bottom-8 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 rounded-full"></div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            const isActive = activeStep === step.id;

            return (
              <div 
                key={step.id}
                className="relative flex items-center md:justify-center w-full group cursor-pointer"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                
                {/* Desktop Left Side Content */}
                <div className={`hidden md:block w-1/2 pr-12 text-right transition-all duration-300 ${!isEven ? 'opacity-0 translate-x-4 absolute' : isActive ? 'opacity-100 translate-x-0' : 'opacity-70'}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{step.desc}</p>
                </div>

                {/* The Node Icon */}
                <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${step.color} text-2xl text-white shadow-lg border-4 border-white dark:border-[#0a0a0a] transition-transform duration-300 ${isActive ? 'scale-125' : 'scale-100'}`}>
                  {step.icon}
                </div>

                {/* Desktop Right Side Content */}
                <div className={`hidden md:block w-1/2 pl-12 text-left transition-all duration-300 ${isEven ? 'opacity-0 -translate-x-4 absolute' : isActive ? 'opacity-100 translate-x-0' : 'opacity-70'}`}>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{step.desc}</p>
                </div>

                {/* Mobile Content (Always right-aligned next to the line) */}
                <div className="md:hidden ml-6 w-full">
                  <div className={`p-4 rounded-xl border transition-all duration-300 ${isActive ? 'bg-white dark:bg-zinc-800 border-teal-500 shadow-md' : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-slate-800'}`}>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{step.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{step.desc}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <div className={`mt-12 p-6 rounded-2xl border transition-all duration-500 ${activeStep ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/50 scale-100 opacity-100' : 'bg-slate-50 dark:bg-[#1c1b19] border-slate-200 dark:border-slate-800 scale-95 opacity-50'}`}>
        <h4 className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-2">
          {activeStep ? 'Deep Dive' : 'Select a step'}
        </h4>
        <p className="text-slate-700 dark:text-slate-300">
          {activeStep 
            ? steps.find(s => s.id === activeStep)?.details 
            : 'Interact with the pipeline above to see detailed technical specifications for each phase of the machine learning workflow.'}
        </p>
      </div>

    </div>
  );
}