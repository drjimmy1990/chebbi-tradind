'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useAppStore, type View } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';

const LOGO_URL = 'https://i.imgur.com/USEEiyC.png';

export function Navbar() {
  const { currentView, setCurrentView, language, setLanguage, mobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [xmLinkFr, setXmLinkFr] = useState('https://clicks.pipaffiliates.com/c?c=CHEBBI&l=fr&p=1');
  const [xmLinkEn, setXmLinkEn] = useState('https://clicks.pipaffiliates.com/c?c=CHEBBI&l=en&p=1');
  const [xmLinkAr, setXmLinkAr] = useState('https://clicks.pipaffiliates.com/c?c=CHEBBI&l=ar&p=1');
  const xmLink = language === 'en' ? xmLinkEn : language === 'ar' ? xmLinkAr : xmLinkFr;
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(json => {
      if (json?.data) {
        const s = json.data;
        if (s.XM_LINK_FR) setXmLinkFr(s.XM_LINK_FR);
        if (s.XM_LINK_EN) setXmLinkEn(s.XM_LINK_EN);
        if (s.XM_LINK_AR) setXmLinkAr(s.XM_LINK_AR);
        // Fallback
        if (!s.XM_LINK_FR && s.XM_LINK) setXmLinkFr(s.XM_LINK);
        if (!s.XM_LINK_EN && s.XM_LINK) setXmLinkEn(s.XM_LINK);
        if (!s.XM_LINK_AR && s.XM_LINK) setXmLinkAr(s.XM_LINK);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const navItems: { key: View; labelKey: string }[] = [
    { key: 'home', labelKey: 'nav.home' },
    { key: 'results', labelKey: 'nav.results' },
    { key: 'blog', labelKey: 'nav.blog' },
    { key: 'faq', labelKey: 'nav.faq' },
    { key: 'crypto', labelKey: 'nav.crypto' },
  ];

  const handleNav = (view: View) => {
    // FAQ: scroll to section on home page instead of separate view
    if (view === 'faq') {
      if (currentView !== 'home') {
        setCurrentView('home');
      }
      setMobileMenuOpen(false);
      // Small delay to ensure the home page is rendered before scrolling
      setTimeout(() => {
        const el = document.getElementById('faq-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, currentView !== 'home' ? 100 : 0);
      return;
    }
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const langs: { code: Language; flag: string; label: string }[] = [
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  ];

  const currentLang = langs.find((l) => l.code === language) || langs[0];

  return (
    <>
      <nav
        className={`fixed left-0 w-full transition-all duration-300 top-14 ${
          scrolled
            ? 'bg-background/95 glass border-b border-border shadow-lg py-2'
            : 'bg-transparent py-4'
        }`}
        style={{ zIndex: 1000 }}
      >
        <div className="max-w-7xl mx-auto px-5 flex items-center justify-between gap-5">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border group-hover:border-primary transition-all group-hover:shadow-lg group-hover:shadow-primary/20">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-extrabold text-foreground">
              Chebbi <em className="not-italic text-primary">Trading</em>
            </span>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => handleNav(item.key)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === item.key
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {t(item.labelKey, language)}
                  {currentView === item.key && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              </li>
            ))}

          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary border border-border transition-all"
              title={theme === 'dark' ? t('theme.light', language) : t('theme.dark', language)}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-all"
              >
                <Globe size={14} />
                {currentLang.code.toUpperCase()}
                <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl overflow-hidden min-w-[160px] shadow-xl"
                  >
                    {langs.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all w-full text-left ${
                          language === l.code
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* XM Button (desktop only) */}
            <a
              href={xmLink}
              target="_blank"
              className="hidden md:flex items-center gap-2 bg-ct-xm text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ct-xm/40"
            >
              <span className="icon-user-plus" style={{fontSize:14}}>👤</span>
              {t('nav.register', language)}
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1.5 text-foreground"
            >
              <span className={`block w-6 h-0.5 bg-current rounded transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current rounded transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current rounded transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 w-full bg-card border-b border-border overflow-hidden"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                      currentView === item.key
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {t(item.labelKey, language)}
                  </button>
                ))}

                {/* Mobile XM Button */}
                <a
                  href={xmLink}
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-ct-xm text-white px-4 py-2.5 rounded-lg text-sm font-bold mt-2"
                >
                  {t('nav.register', language)}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
