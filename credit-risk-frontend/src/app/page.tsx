import Link from 'next/link';

export default function ProjectOverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 ease-out">
      
      {/* Hero Section */}
      <section className="text-center py-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Credit Risk Analysis Dashboard
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          An end-to-end Machine Learning pipeline designed to predict the probability of a client defaulting on their credit card payment next month.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/predict" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all">
            Try the Model
          </Link>
          <Link href="/insights" className="px-6 py-2.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all">
            View Analytics
          </Link>
        </div>
      </section>

      {/* Grid: Context & Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Dataset Context */}
        <div className="bg-slate-50 dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="text-4xl mb-4">🗄️</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">The Dataset</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            This project uses the famous <strong>Taiwan Credit Card Default Dataset (UCI ID: 350)</strong>. It contains data on 30,000 credit card clients in Taiwan from April 2005 to September 2005.
          </p>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> <strong>Total Records:</strong> 30,000</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> <strong>Features:</strong> 23 (Demographics, Payment History, Bill Amounts)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> <strong>Target:</strong> Default Payment Next Month (Yes/No)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> <strong>Default Rate:</strong> ~22.1%</li>
          </ul>
        </div>

        {/* Model Architecture */}
        <div className="bg-slate-50 dark:bg-[#1c1b19] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">The Model</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            A custom <strong>Deep Neural Network (DNN)</strong> built with PyTorch. It features a modern Attention Mechanism to provide explainability (XAI), allowing us to see <em>why</em> it makes a specific prediction.
          </p>
          <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">ARCHITECTURE</div>
            <div className="flex flex-col gap-2 font-mono text-sm text-center">
              <div className="bg-slate-100 dark:bg-zinc-800 py-1.5 rounded text-slate-700 dark:text-slate-300">Input Layer (23 Features)</div>
              <div className="text-slate-400">↓</div>
              <div className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 py-1.5 rounded border border-teal-200 dark:border-teal-800/50">Feature Attention Layer (XAI)</div>
              <div className="text-slate-400">↓</div>
              <div className="bg-slate-100 dark:bg-zinc-800 py-1.5 rounded text-slate-700 dark:text-slate-300">Dense Hidden Layers + Dropout</div>
              <div className="text-slate-400">↓</div>
              <div className="bg-slate-100 dark:bg-zinc-800 py-1.5 rounded text-slate-700 dark:text-slate-300">Sigmoid Output (Probability)</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}