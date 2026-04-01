import './globals.css'; // Make sure your CSS is imported
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
      <body className="min-h-screen bg-white dark:bg-[#171614] text-zinc-900 dark:text-zinc-100">
        <main className="p-6 md:p-12">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Shared Header & Status Bar */}
            <header className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Credit Default Predictor
              </h1>
              <StatusBar />
            </header>

            {/* Shared Navigation Tabs */}
            <Navigation />

            {/* Unique Page Content gets injected here */}
            <div className="pt-4 min-h-[500px]">
              {children}
            </div>

          </div>
        </main>
      </body>
    </html>
  );
}