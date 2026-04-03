'use client';

import { useState, useEffect } from 'react';

export default function PipelinePage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1); // Step 1 open by default
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const steps = [
    { 
      id: 1, title: '1. Data Ingestion', icon: '📥', color: 'from-blue-500 to-cyan-500',
      desc: 'Fetching 30,000 records from the UCI ML Repository.', 
      details: 'The system pulls raw data containing 23 features per user. This includes demographic information (Age, Education, Gender), the history of past payments from April to September 2005, and the total billed amounts.' 
    },
    { 
      id: 2, title: '2. Preprocessing & Scaling', icon: '⚙️', color: 'from-cyan-500 to-teal-500',
      desc: 'Standardizing features to prevent exploding gradients.', 
      details: 'Financial limits vary wildly (some people owe $100, others $500,000). We use scikit-learn\'s StandardScaler to compress these values into a tight mathematical range (usually -1 to 1). This ensures the Neural Network learns efficiently without being biased by massive numbers.' 
    },
    { 
      id: 3, title: '3. Attention Mechanism (XAI)', icon: '🔍', color: 'from-teal-500 to-emerald-500',
      desc: 'A custom layer that learns which features matter most.', 
      details: 'Instead of a "black box," this PyTorch layer acts as a magnifying glass. It mathematically weighs each input, allowing us to see if a client was rejected because of their Age, or because they missed a payment exactly 2 months ago (Explainable AI).' 
    },
    { 
      id: 4, title: '4. Deep Neural Network', icon: '🧠', color: 'from-emerald-500 to-green-500',
      desc: 'Extracting complex, non-linear patterns from behavior.', 
      details: 'The core brain. It features multiple hidden layers with ReLU activations and Dropout regularization. It looks at the combination of variables (e.g., High Debt + Low Education + Recent Missed Payment) to determine the true risk profile.' 
    },
    { 
      id: 5, title: '5. Risk Prediction', icon: '🎯', color: 'from-green-500 to-lime-500',
      desc: 'Final Sigmoid output yielding the probability of default.', 
      details: 'The network outputs a single number between 0% and 100%. Based on business logic, we apply a threshold (e.g., >40%) to flag the user as "High Risk," triggering alerts for loan officers on the dashboard.' 
    }
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-8">
      
      <div className={`text-center mb-12 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">How It Works</h2>
        <p className="text-slate-600 dark:text-slate-400">Click on any step below to explore the architecture of the machine learning pipeline.</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isExpanded = expandedStep === step.id;
          const delay = 150 + (index * 100);

          return (
            <div 
              key={step.id}
              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              className={`relative group cursor-pointer transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${mounted ? delay : 0}ms` }}
            >
              {/* Hover Glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} rounded-2xl blur transition duration-500 ${isExpanded ? 'opacity-30' : 'opacity-0 group-hover:opacity-15'}`}></div>
              
              {/* Card Content */}
              <div className={`relative z-10 p-5 rounded-2xl border transition-all duration-300 ${isExpanded ? 'bg-white dark:bg-zinc-900 border-teal-500/50 shadow-md' : 'bg-slate-50 dark:bg-[#151515] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'}`}>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-xl text-white shadow-md transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
                    {step.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className={`text-lg font-bold transition-colors ${isExpanded ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                  <div className="text-slate-400 dark:text-slate-600 font-bold text-xl">
                    {isExpanded ? '−' : '+'}
                  </div>
                </div>

                {/* Expandable Details Section */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="p-4 bg-slate-100 dark:bg-[#111] rounded-xl border border-slate-200 dark:border-zinc-800 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {step.details}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}