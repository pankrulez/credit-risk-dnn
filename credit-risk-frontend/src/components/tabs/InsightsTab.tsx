import Image from 'next/image';

export default function InsightsTab() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: Explainability (SHAP)                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Model Explainability</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-[75ch]">
            How the Deep Neural Network makes its decisions. We use SHAP (SHapley Additive exPlanations) 
            and internal Attention weights to crack open the "black box" and understand feature importance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* SHAP Summary Plot */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-teal-600 dark:text-teal-400">❶</span> Global Feature Impact (SHAP)
            </h3>
            <p className="text-sm text-zinc-500">
              Shows both the magnitude of impact and direction. High values of <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-red-500">PAY_0</code> (red dots on the right) strongly increase default risk.
            </p>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden p-2">
              <div className="aspect-[4/3] relative bg-zinc-50 dark:bg-zinc-900/50">
                <Image 
                  src="/plots/05_shap_summary.png" 
                  alt="SHAP Summary Plot" 
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Attention Weights */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-teal-600 dark:text-teal-400">❷</span> DNN Attention Weights
            </h3>
            <p className="text-sm text-zinc-500">
              The internal attention mechanism confirms SHAP findings: recent payment history 
              dominates the model's focus, while demographic features receive less attention.
            </p>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden p-2">
              <div className="aspect-[4/3] relative bg-zinc-50 dark:bg-zinc-900/50">
                <Image 
                  src="/plots/05_attention_weights.png" 
                  alt="DNN Attention Weights" 
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: Fairness & Bias Audit                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6 pt-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <span>⚖️</span> Fairness Audit
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-[75ch]">
            Evaluating the model across protected demographic groups (Age and Gender) using Demographic Parity 
            and Equalized Odds to ensure equitable lending decisions.
          </p>
        </div>

        {/* Fairness Summary Dashboard */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden mb-8">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-between items-center">
            <h3 className="font-medium">Bias Threshold Analysis</h3>
            <span className="text-xs font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
              Goal: &lt; 0.10 Difference
            </span>
          </div>
          <div className="aspect-[21/9] relative p-4">
            <Image 
              src="/plots/06_fairness_summary.png" 
              alt="Fairness Summary Dashboard" 
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        </div>

        {/* Deep Dive: Age Groups */}
        <div className="grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold">Age Group Analysis</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The model shows a slightly higher False Positive Rate for younger applicants (&lt;30) compared to senior applicants (&gt;50), though the difference remains within acceptable industry thresholds.
            </p>
            <ul className="text-sm space-y-2 border-l-2 border-teal-500 pl-4 mt-4">
              <li><strong className="text-zinc-900 dark:text-zinc-100">Metric:</strong> Equalized Odds</li>
              <li><strong className="text-zinc-900 dark:text-zinc-100">Status:</strong> ✅ Passed (&lt; 0.10)</li>
            </ul>
          </div>

          <div className="md:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden p-2">
            <div className="aspect-[16/6] relative bg-zinc-50 dark:bg-zinc-900/50">
              <Image 
                src="/plots/06_fairness_age.png" 
                alt="Fairness by Age Group" 
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}