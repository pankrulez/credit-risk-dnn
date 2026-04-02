'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const tabs = [
    { href: '/', icon: '🏠', label: 'Overview', fullLabel: 'Project Overview' },
    { href: '/pipeline', icon: '⚙️', label: 'Pipeline', fullLabel: 'ML Pipeline' },
    { href: '/overview', icon: '📊', label: 'Data', fullLabel: 'Data Overview' },
    { href: '/predict', icon: '🔮', label: 'Predict', fullLabel: 'Make Prediction' },
    { href: '/batch', icon: '📁', label: 'Batch', fullLabel: 'Batch Scoring' },
    { href: '/insights', icon: '⚖️', label: 'Insights', fullLabel: 'Model Insights' },
    { href: '/about', icon: '👨‍💻', label: 'About', fullLabel: 'About Me' },
  ];

  const activeTab = tabs.find(tab => tab.href === pathname) || tabs[0];

  return (
    <>
      {/* DESKTOP NAVIGATION (Visible on md and larger screens) */}
      <div className="hidden md:flex flex-wrap gap-2 bg-white/80 dark:bg-zinc-900/80 p-2 rounded-2xl backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-sm w-full mb-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out flex-grow justify-center ${
                isActive
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md transform scale-[1.02]'
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

      {/* MOBILE NAVIGATION BAR (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm w-full mb-6 relative z-50">
        
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-extrabold text-sm px-2">
          <span className="text-xl">{activeTab.icon}</span>
          {activeTab.fullLabel}
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {/* Hamburger Icon animated to X */}
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${isMobileMenuOpen ? 'rotate-45 translate-y-[-1px]' : ''}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 translate-x-3' : 'opacity-100'}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${isMobileMenuOpen ? '-rotate-45 translate-y-[1px]' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* MOBILE FULL-SCREEN OVERLAY MENU */}
      <div className={`md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl transition-all duration-400 ease-in-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
        <div className="flex flex-col h-full pt-28 pb-10 px-6 overflow-y-auto">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 px-4">Navigation</p>
          
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  {tab.fullLabel}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}