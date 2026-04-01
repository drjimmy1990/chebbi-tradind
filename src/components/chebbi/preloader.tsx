'use client';

import { useState, useEffect } from 'react';

export function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 1500);
    const safety = setTimeout(() => setHidden(true), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(safety);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center z-[99999] transition-opacity duration-700 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--background, #06090f)' }}
    >
      {/* Pulsing logo */}
      <div
        className="w-24 h-24 rounded-full overflow-hidden mb-5 border-[3px] border-primary flex-shrink-0"
        style={{
          boxShadow: '0 0 30px rgba(16,185,129,0.25)',
          animation: 'preloaderPulse 2s ease-in-out infinite',
        }}
      >
        <img
          src="https://i.imgur.com/MrRODMe.png"
          alt="Chebbi Trading"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand name */}
      <div className="text-2xl font-extrabold text-foreground mb-2">
        Chebbi <span className="text-primary">Trading</span>
      </div>

      {/* Loading text */}
      <div
        className="text-sm text-muted-foreground mb-6"
        style={{ animation: 'fadeInOut 1.5s ease-in-out infinite' }}
      >
        Chargement des marchés...
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: '40%',
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            animation: 'preloaderSlide 1s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes preloaderPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(16,185,129,0.25); }
          50% { transform: scale(1.08); box-shadow: 0 0 50px rgba(16,185,129,0.25), 0 0 80px rgba(16,185,129,0.12); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes preloaderSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}
