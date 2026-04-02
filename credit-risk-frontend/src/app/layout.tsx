import './globals.css';
import { Metadata } from 'next';
import StatusBar from '@/components/StatusBar';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'Credit Default Predictor',
  description: 'AI model inference for Taiwan Credit Card dataset',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0', // Prevents annoying zoom on mobile inputs
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-50 selection:bg-teal-500/30 bg-dot-pattern flex flex-col">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none z-0" />
        
        {/* 
          Main Content Wrapper 
          Added pb-24 for mobile so content doesn't get hidden behind the bottom nav bar.
          Desktop retains standard padding.
        */}
        <main className="relative flex-grow w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12 z-10 flex flex-col">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
                Credit Risk AI
              </h1>
              <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 font-semibold">
                Taiwan Dataset Risk Analysis & Explainability
              </p>
            </div>
            <div className="flex-shrink-0 self-start sm:self-auto">
              <StatusBar />
            </div>
          </header>

          {/* Desktop Navigation Injection */}
          <Navigation />

          {/* Content Card Area */}
          <div className="flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-4 md:p-6 lg:p-8">
            {children}
          </div>

        </main>
      </body>
    </html>
  );
}