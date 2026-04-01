'use client';

import { useState, useEffect } from 'react';

export default function StatusBar() {
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading');
  const [pingMs, setPingMs] = useState<number>(0);

  useEffect(() => {
    const checkApi = async () => {
      const start = performance.now();
      try {
        // Using an environment variable for your FastAPI backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/health`, { 
          method: 'GET',
          // Prevent caching so we get a real ping time
          cache: 'no-store' 
        });
        
        const end = performance.now();
        setPingMs(Math.round(end - start));
        
        if (res.ok) {
          setStatus('live');
        } else {
          setStatus('error');
        }
      } catch (error) {
        const end = performance.now();
        setPingMs(Math.round(end - start));
        setStatus('error');
      }
    };

    checkApi();
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-600 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400 w-fit">
      {status === 'loading' && (
        <span className="flex items-center gap-1.5">
          <span className="animate-pulse">🟡</span> Waking up server...
        </span>
      )}
      
      {status === 'live' && (
        <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-medium">
          <span>🟢</span> API Live ({pingMs}ms)
        </span>
      )}

      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
          <span>🔴</span> API Offline ({pingMs}ms)
        </span>
      )}

      <span className="opacity-40">·</span>
      
      <span className="flex items-center gap-1.5">
        <span>✅</span> Model Loaded
      </span>

      <span className="opacity-40">·</span>
      
      <span className="flex items-center gap-1.5">
        <span>📊</span> Taiwan Credit Card Default (30K rows)
      </span>
    </div>
  );
}