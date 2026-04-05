'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { language } = useAppStore();

  const [telegramUrl, setTelegramUrl] = useState('https://t.me/ChebbiTrading');

  useEffect(() => {
    fetch('/api/public/data')
      .then((r) => r.json())
      .then((json) => {
        if (json.settings?.TELEGRAM_URL) setTelegramUrl(json.settings.TELEGRAM_URL);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Telegram Float — Bottom Left */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-7 left-7 z-[999] flex items-center gap-2.5 bg-card border border-border rounded-full pl-2 pr-4 py-2 hover:border-[#0088cc] hover:shadow-lg hover:shadow-[#0088cc]/10 transition-all duration-300 group"
        style={{ animation: 'floatBob 4s ease-in-out infinite' }}
      >
        <div className="w-9 h-9 rounded-full bg-[#0088cc] flex items-center justify-center text-white shrink-0">
          <Send size={16} />
        </div>
        <div className="text-left">
          <div className="text-xs font-semibold text-foreground leading-tight">
            {t('tg.float', language)}
          </div>
          <div className="text-[11px] text-muted-foreground leading-tight">
            {t('tg.float.sub', language)}
          </div>
        </div>
      </a>

      {/* Scroll to Top — Bottom Right */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-7 right-7 z-[999] w-11 h-11 rounded-xl bg-card border border-border text-primary flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-background hover:border-primary hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 ${
          showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <ChevronUp size={20} />
      </button>

      <style jsx>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
