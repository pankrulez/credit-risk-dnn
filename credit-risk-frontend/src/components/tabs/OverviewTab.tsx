import Image from 'next/image';

export default function OverviewTab() {
  const metrics = [
    { label: 'Total Records', value: '30,000' },
    { label: 'Default Rate', value: '22.1%' },
    { label: 'Features', value: '23' },
    { label: 'Imbalance Strategy', value: 'Upsampled (40%)' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Introduction */}
      <section className="max-w-[65ch]">
        <h2 className="text-xl font-semibold mb-2">Dataset Overview</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          This dataset contains information on default payments, demographic factors, credit data, 
          history of payment, and bill statements of credit card clients in Taiwan from April 2005 
          to September 2005.
        </p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.label} 
            className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#1c1b19] shadow-sm"
          >
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{metric.label}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {metric.value}
            </div>
          </div>
        ))}
      </section>

      {/* Charts Grid */}
      <section className="space-y-8">
        <h3 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">
          Exploratory Analysis
        </h3>
        
        {/* Row 1: Distribution & Demographics */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden">
            <div className="aspect-[16/9] relative bg-zinc-100 dark:bg-zinc-900">
              <Image 
                src="/plots/01_target_distribution.png" 
                alt="Target Distribution" 
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-sm">Target Imbalance</h4>
              <p className="text-xs text-zinc-500 mt-1">Significant class imbalance requiring resampling during preprocessing.</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden">
            <div className="aspect-[16/9] relative bg-zinc-100 dark:bg-zinc-900">
              <Image 
                src="/plots/01_default_rate_by_category.png" 
                alt="Default Rate by Category" 
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="font-medium text-sm">Demographic Trends</h4>
              <p className="text-xs text-zinc-500 mt-1">Default rates analyzed across gender, education, and marital status.</p>
            </div>
          </div>
        </div>

        {/* Row 2: Heatmap (Full Width) */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1c1b19] overflow-hidden">
          <div className="aspect-[21/9] relative bg-zinc-100 dark:bg-zinc-900">
            <Image 
              src="/plots/01_correlation_heatmap.png" 
              alt="Feature Correlation Heatmap" 
              fill
              className="object-contain p-4"
              unoptimized
            />
          </div>
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="font-medium text-sm">Feature Correlations</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Repayment status (PAY_0 to PAY_6) shows the strongest positive correlation with the default target.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}