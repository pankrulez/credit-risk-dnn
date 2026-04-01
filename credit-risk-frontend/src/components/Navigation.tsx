'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { href: '/overview', label: '📊 Data Overview' },
    { href: '/', label: '🔮 Make Prediction' },
    { href: '/insights', label: '⚖️ Model Insights' },
  ];

  return (
    <div className="flex space-x-2 bg-zinc-100/50 dark:bg-zinc-800/40 p-1.5 rounded-2xl overflow-x-auto hide-scrollbar backdrop-blur-md border border-zinc-200/80 dark:border-zinc-700/50 w-max shadow-sm">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out ${
              isActive
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md transform scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}