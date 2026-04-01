'use client';

import { useRef, useEffect } from 'react';

export function PriceTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetLoaded = useRef(false);

  // Load TradingView widget
  useEffect(() => {
    if (widgetLoaded.current || !containerRef.current) return;
    widgetLoaded.current = true;

    const widgetContainer = containerRef.current;

    // Create the widget wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '56px';
    wrapper.style.width = '100%';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.height = '56px';
    wrapper.appendChild(inner);

    // Create the script element with TradingView config
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.textContent = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:XAUUSD', title: 'XAU/USD 🥇' },
        { proName: 'FOREXCOM:EURUSD', title: 'EUR/USD' },
        { proName: 'FOREXCOM:GBPUSD', title: 'GBP/USD' },
        { proName: 'FOREXCOM:USDJPY', title: 'USD/JPY' },
        { proName: 'FOREXCOM:USDCAD', title: 'USD/CAD' },
        { proName: 'FOREXCOM:AUDUSD', title: 'AUD/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
        { proName: 'FOREXCOM:USDCHF', title: 'USD/CHF' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'fr',
    });

    wrapper.appendChild(script);
    widgetContainer.appendChild(wrapper);

    return () => {
      widgetContainer.innerHTML = '';
      widgetLoaded.current = false;
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-14 z-[1001] overflow-hidden border-b border-white/[0.05]"
      style={{
        background: 'rgba(8, 12, 22, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div ref={containerRef} className="h-14 w-full" />
    </div>
  );
}
