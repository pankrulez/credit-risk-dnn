import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
// Optional: import { usePathname } from 'next/navigation'; if you want to extract the Navbar into its own client component later

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Credit Risk AI | Deep Learning Dashboard",
  description: "Predict credit card default risk using a custom PyTorch Deep Neural Network with Explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col selection:bg-teal-500 selection:text-white`}>
        
        {/* =========================================
            1. FLOATING GLASSMORPHIC NAVBAR 
        ========================================= */}
        <div className="w-full flex flex-col items-center pt-6 pb-4 px-4 sticky top-0 z-50">
          
          <nav className="relative group w-full max-w-3xl">
             {/* Navbar Outer Glow */}
             <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/40 via-emerald-500/40 to-cyan-500/40 rounded-full blur-md opacity-30 group-hover:opacity-70 transition duration-1000 z-0"></div>
             
             {/* Navbar Content */}
             <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-[#151515]/80 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 rounded-full shadow-lg">
                
                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-2 pl-2 group/logo">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.5)] text-white font-extrabold text-lg transition-transform group-hover/logo:scale-110 group-hover/logo:rotate-3">
                    C
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block">RiskAI</span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1 md:gap-2">
                  <Link href="/" className="relative px-3 md:px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-300">
                    Overview
                  </Link>
                  <Link href="/pipeline" className="relative px-3 md:px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-300">
                    Pipeline
                  </Link>
                  <Link href="/batch" className="relative px-3 md:px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-300">
                    Batch
                  </Link>
                  <Link href="/about" className="relative px-3 md:px-4 py-1.5 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-300">
                    About
                  </Link>
                </div>

                {/* Glowing CTA Button inside Navbar */}
                <div className="relative group/btn hidden md:block">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur opacity-60 group-hover/btn:opacity-100 transition duration-300"></div>
                   <Link href="/predict" className="relative block px-5 py-1.5 bg-slate-900 dark:bg-black border border-slate-700 dark:border-zinc-800 text-white text-sm font-bold rounded-full transition-transform hover:scale-105">
                     Launch App
                   </Link>
                </div>
             </div>
          </nav>

          {/* =========================================
              2. SLEEK NEON STATUS RIBBON 
          ========================================= */}
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

        {/* =========================================
            3. MAIN CONTENT INJECTION 
        ========================================= */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {/* Subtle Background Glow for the whole page */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 dark:bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          
          {children}
        </main>

        {/* =========================================
            4. MINIMALIST FOOTER
        ========================================= */}
        <footer className="w-full border-t border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} Credit Risk AI. Built with PyTorch & Next.js.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <a href="https://github.com/pankrulez" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                GitHub
              </a>
              <span className="opacity-30">•</span>
              <a href="https://archive.ics.uci.edu/ml/datasets/default+of+credit+card+clients" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                UCI Dataset
              </a>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}