'use client';

import { useState } from 'react';
import StatusBar from '@/components/StatusBar';
import OverviewTab from '@/components/tabs/OverviewTab';
import PredictTab from '@/components/tabs/PredictTab';
import InsightsTab from '@/components/tabs/InsightsTab';

type TabId = 'overview' | 'predict' | 'insights';

export default function Home() {
  // We default to the 'predict' tab so the user can test the model immediately
  const [activeTab, setActiveTab] = useState<TabId>('predict');

  const tabs = [
    { id: 'overview', label: '📊 Data Overview' },
    { id: 'predict', label: '🔮 Make Prediction' },
    { id: 'insights', label: '⚖️ Model Insights' },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-[#171614] text-zinc-900 dark:text-zinc-100 p-6 md:p-12">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header & Live API Status Bar */}
        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Credit Default Predictor
          </h1>
          <StatusBar />
        </header>

        {/* Custom Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area (renders only the active component) */}
        <div className="pt-4 min-h-[500px]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'predict'  && <PredictTab />}
          {activeTab === 'insights' && <InsightsTab />}
        </div>

      </div>
    </main>
  );
}