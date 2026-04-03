import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
        
        {/* Our new extracted client-side Navbar */}
        <Navbar />

        {/* =========================================
            MAIN CONTENT INJECTION 
        ========================================= */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {/* Subtle Ambient Background Glow for the whole page */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 dark:bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          
          {children}
        </main>

        {/* =========================================
            MINIMALIST FOOTER
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