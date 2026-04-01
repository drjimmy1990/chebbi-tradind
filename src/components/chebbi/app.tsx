'use client';

import { useAppStore } from '@/lib/store';
import { Navbar } from './navbar';
import { PriceTicker } from './price-ticker';
import { ParticleCanvas } from './particle-canvas';
import { CustomCursor } from './custom-cursor';
import { Preloader } from './preloader';
import { FloatingButtons } from './floating-buttons';
import { HomePage } from './home-page';
import { ResultsPage } from './results-page';
import { BlogPage } from './blog-page';
import { CryptoPage } from './crypto-page';

export function App() {
  const { currentView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col relative">
      <Preloader />
      <CustomCursor />
      <PriceTicker />
      <ParticleCanvas />
      <Navbar />
      <main className="flex-1 relative" style={{ zIndex: 1 }}>
        {currentView === 'home' && <HomePage />}
        {currentView === 'results' && <ResultsPage />}
        {currentView === 'blog' && <BlogPage />}
        {currentView === 'crypto' && <CryptoPage />}
      </main>
      <FloatingButtons />
    </div>
  );
}
