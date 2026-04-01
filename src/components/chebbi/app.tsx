'use client';

import { useAppStore } from '@/lib/store';
import { Navbar } from './navbar';
import { PriceTicker } from './price-ticker';
import { ParticleCanvas } from './particle-canvas';
import { HomePage } from './home-page';
import { ResultsPage } from './results-page';
import { BlogPage } from './blog-page';
import { CryptoPage } from './crypto-page';
import { DashboardPage } from './dashboard-page';
import { AdminGate } from './admin-gate';

export function App() {
  const { currentView } = useAppStore();
  const isDashboard = currentView === 'dashboard';

  return (
    <div className="min-h-screen flex flex-col relative">
      {!isDashboard && <PriceTicker />}
      {!isDashboard && <ParticleCanvas />}
      {!isDashboard && <Navbar />}
      <main className="flex-1 relative" style={{ zIndex: 1 }}>
        {currentView === 'home' && <HomePage />}
        {currentView === 'results' && <ResultsPage />}
        {currentView === 'blog' && <BlogPage />}
        {currentView === 'crypto' && <CryptoPage />}
        {isDashboard && (
          <AdminGate>
            <DashboardPage />
          </AdminGate>
        )}
      </main>
    </div>
  );
}

