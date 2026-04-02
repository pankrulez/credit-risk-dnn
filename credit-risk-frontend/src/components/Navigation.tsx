'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: '🏠 Project Overview' },
    { href: '/pipeline', label: '⚙️ ML Pipeline' },
    { href: '/overview', label: '📊 Data Overview' },
    { href: '/predict', label: '🔮 Make Prediction' },
    { href: '/batch', label: '📁 Batch Scoring' },
    { href: '/insights', label: '⚖️ Model Insights' },
    { href: '/about', label: '👨‍💻 About' },
  ];

  return (
    <div className="flex space-x-2 bg-white/80 dark:bg-zinc-800/90 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar backdrop-blur-md border border-zinc-200 dark:border-zinc-700 w-max shadow-sm max-w-full">
      {tabs.map((tab) => {
        // Exact match for home, startsWith for others to handle sub-routes if any
        const isActive = pathname === tab.href;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-4 md:px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out ${
              isActive
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md transform scale-[1.02]'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}