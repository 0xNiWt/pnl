"use client";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [loaded, setLoaded] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const intervalTime = duration / steps;
    
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, intervalTime);

    const exitTimer = setTimeout(() => {
      setLoaded(true);
    }, 1800);

    return () => {
      clearInterval(timer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col justify-center items-center transition-all duration-[1000ms] ease-[cubic-bezier(0.87,0,0.13,1)] ${
        loaded ? "-translate-y-full rounded-b-[100px]" : "translate-y-0 rounded-none"
      }`}
    >
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black opacity-50"></div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${loaded ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}>
        
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-blue-500 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
           <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
              />
           </div>
        </div>

        <div className="text-center space-y-2">
            <h1 className="font-display text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                The Dragons
            </h1>
            
            <div className="flex items-center justify-center gap-3 overflow-hidden">
                <div className="h-[1px] w-8 bg-gray-700"></div>
                <span className="font-mono text-sm md:text-base font-bold text-gray-400 tabular-nums">
                    {count}%
                </span>
                <div className="h-[1px] w-8 bg-gray-700"></div>
            </div>
        </div>

      </div>

      <div className={`absolute bottom-10 font-mono text-[10px] text-gray-600 uppercase tracking-[0.3em] transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}>
        Season 2026 • Loading Assets
      </div>

    </div>
  );
}