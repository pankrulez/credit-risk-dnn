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
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-[#0d1117] dark:via-[#161b22] dark:to-[#0d1117] text-zinc-900 dark:text-zinc-100 bg-dot-pattern">
        
        {/* Decorative top background glow */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none" />
        
        <main className="relative p-6 md:p-12 z-10">
          <div className="max-w-[1200px] mx-auto space-y-10">
            
            {/* Header section with gradient text */}
            <header className="space-y-6 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
                  Credit Default Predictor
                </h1>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
                  AI-powered risk analysis and insights
                </p>
              </div>
              <div className="flex-shrink-0">
                <StatusBar />
              </div>
            </header>

            {/* Render the new polished tabs */}
            <Navigation />

            {/* Container for page content with a glassmorphism effect and slide-up animation */}
            <div className="pt-2 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-2xl overflow-hidden p-6 md:p-8">
              {children}
            </div>

          </div>
        </main>
      </body>
    </html>
  );
}