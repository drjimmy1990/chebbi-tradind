import { create } from 'zustand';

export type View = 'home' | 'results' | 'blog' | 'faq' | 'crypto' | 'dashboard';
export type Language = 'fr' | 'en' | 'ar';

interface AppState {
  currentView: View;
  setCurrentView: (view: View) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  dashboardView: string;
  setDashboardView: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setCurrentView: (currentView) => set({ currentView }),
  language: 'fr',
  setLanguage: (language) => set({ language }),
  dashboardView: 'overview',
  setDashboardView: (dashboardView) => set({ dashboardView }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
