'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/' },
    { name: 'Predict', href: '/predict' },
    { name: 'Insights', href: '/insights' },
    { name: 'Pipeline', href: '/pipeline' },
    { name: 'Batch', href: '/batch' },
    { name: 'About', href: '/about' },
  ];

  return (
    <div className="w-full flex flex-col items-center pt-6 pb-4 px-4 sticky top-0 z-50">
      
      {/* 1. FLOATING GLASSMORPHIC NAVBAR */}
      <nav className="relative group w-full max-w-4xl">
         {/* Navbar Outer Glow */}
         <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/40 via-emerald-500/40 to-cyan-500/40 rounded-full blur-md opacity-40 group-hover:opacity-80 transition duration-1000 z-0"></div>
         
         {/* Navbar Content */}
         <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-[#151515]/80 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-full shadow-lg">
            
            {/* Logo area */}
            <Link href="/" className="flex items-center gap-2 pl-2 pr-4 border-r border-slate-200 dark:border-zinc-800 group/logo">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.5)] text-white font-extrabold text-lg transition-transform group-hover/logo:scale-110 group-hover/logo:rotate-3">
                C
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight hidden md:block">RiskAI</span>
            </Link>

            {/* Nav Links (All Tabs) */}
            <div className="flex flex-wrap justify-center items-center gap-1 md:gap-2 flex-grow pl-2 md:pl-4">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link key={link.name} href={link.href} className="relative px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 group/link">
                    {/* Active State Background */}
                    {isActive && (
                      <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-800 rounded-full z-0"></div>
                    )}
                    {/* Link Text */}
                    <span className={`relative z-10 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400 group-hover/link:text-slate-900 dark:group-hover/link:text-white'}`}>
                      {link.name}
                    </span>
                    {/* Active State Bottom Glow Line */}
                    {isActive && (
                       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
                    )}
                  </Link>
                );
              })}
            </div>
         </div>
      </nav>

      {/* 2. SLEEK NEON STATUS RIBBON */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 animate-in slide-in-from-top-2 fade-in duration-700">
        
        {/* API Live Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-default hover:scale-105 transition-transform">
           <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
           </span>
           <span className="text-[10px] md:text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">API Live (395ms)</span>
        </div>

        {/* Model Loaded Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-default hover:scale-105 transition-transform">
           <span className="text-[12px]">🧠</span>
           <span className="text-[10px] md:text-xs font-bold text-purple-700 dark:text-purple-400 tracking-widest uppercase">Model Loaded</span>
        </div>

        {/* Dataset Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-default hover:scale-105 transition-transform hidden sm:flex">
           <span className="text-[12px]">📊</span>
           <span className="text-[10px] md:text-xs font-bold text-cyan-700 dark:text-cyan-400 tracking-widest uppercase">Taiwan Default (30K)</span>
        </div>

      </div>
    </div>
  );
}