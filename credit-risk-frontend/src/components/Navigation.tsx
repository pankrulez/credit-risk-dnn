'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const tabs = [
    { href: '/overview', label: '📊 Data Overview' },
    { href: '/', label: '🔮 Make Prediction' }, // Making Prediction the default home page
    { href: '/insights', label: '⚖️ Model Insights' },
  ];

  return (
    <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}