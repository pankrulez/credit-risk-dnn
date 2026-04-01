import './globals.css';
import StatusBar from '@/components/StatusBar';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'Credit Default Predictor',
  description: 'AI model inference for Taiwan Credit Card dataset',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Changed to a softer slate background with strictly dark text for max contrast */}
      <body className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-50 selection:bg-teal-500/30 bg-dot-pattern">
        
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />
        
        <main className="relative p-6 md:p-12 z-10">
          <div className="max-w-[1200px] mx-auto space-y-10">
            
            <header className="space-y-6 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
                  Credit Default Predictor
                </h1>
                {/* Darkened subtext for better visibility */}
                <p className="mt-2 text-slate-700 dark:text-slate-300 font-semibold">
                  AI-powered risk analysis and insights
                </p>
              </div>
              <div className="flex-shrink-0">
                <StatusBar />
              </div>
            </header>

            <Navigation />

            {/* Increased card opacity to 95% to ensure text pops clearly */}
            <div className="pt-2 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden p-6 md:p-8">
              {children}
            </div>

          </div>
        </main>
      </body>
    </html>
  );
}