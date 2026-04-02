'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { href: '/', icon: '🏠', label: 'Overview', fullLabel: 'Project Overview' },
    { href: '/pipeline', icon: '⚙️', label: 'Pipeline', fullLabel: 'ML Pipeline' },
    { href: '/overview', icon: '📊', label: 'Data', fullLabel: 'Data Overview' },
    { href: '/predict', icon: '🔮', label: 'Predict', fullLabel: 'Make Prediction' },
    { href: '/batch', icon: '📁', label: 'Batch', fullLabel: 'Batch Scoring' },
    { href: '/insights', icon: '⚖️', label: 'Insights', fullLabel: 'Model Insights' },
    { href: '/about', icon: '👨‍💻', label: 'About', fullLabel: 'About Me' },
  ];

  return (
    <>
      {/* DESKTOP NAVIGATION (Hidden on very small screens) */}
      <div className="hidden md:flex flex-wrap gap-2 bg-white/80 dark:bg-zinc-900/80 p-2 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-sm w-full mb-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out flex-grow justify-center ${
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden lg:inline">{tab.fullLabel}</span>
              <span className="inline lg:hidden">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Fixed to bottom on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] safe-area-pb">
        <div className="flex justify-between items-center px-2 py-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center min-w-[64px] p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className={`text-xl mb-1 transition-transform ${isActive ? '-translate-y-1 scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {tab.label}
                </span>
                {/* Active Dot Indicator */}
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 bg-teal-500 rounded-full"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}