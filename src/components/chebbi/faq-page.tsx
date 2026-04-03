'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search,
  HelpCircle,
  Plus,
  Gift,
  Building2,
  Bell,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Shield,
  Globe,
  UserCheck,
  Clock,
  Percent,
  MessageCircle,
  Send,
  Mail,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';
import { pickLang } from '@/lib/trilingual';
import { hardcodedFaqs } from '@/lib/faqs';
import { FaqAccordionItem, type DbFaq } from '@/components/chebbi/faq-accordion-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// ──────────────────────── Constants ────────────────────────

const TELEGRAM_URL = 'https://t.me/ChebbiTrading';
const DEFAULT_XM = 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=fr&p=1';

// ──────────────────────── Types ────────────────────────

type CategoryFilter = 'all' | 'gratuit' | 'xm' | 'signaux' | 'resultats' | 'capital';

// ──────────────────────── Category config ────────────────────────

interface CategoryConfig {
  key: CategoryFilter;
  labelKey: string;
  icon: React.ReactNode;
}

const categoryConfigs: Record<Language, CategoryConfig[]> = {
  fr: [
    { key: 'all', labelKey: 'faq.cat.all', icon: <HelpCircle size={14} /> },
    { key: 'gratuit', labelKey: 'faq.cat.free', icon: <Gift size={14} /> },
    { key: 'xm', labelKey: 'faq.cat.xm', icon: <Building2 size={14} /> },
    { key: 'signaux', labelKey: 'faq.cat.signals', icon: <Bell size={14} /> },
    { key: 'resultats', labelKey: 'faq.cat.results', icon: <TrendingUp size={14} /> },
    { key: 'capital', labelKey: 'faq.cat.capital', icon: <DollarSign size={14} /> },
  ],
  en: [
    { key: 'all', labelKey: 'faq.cat.all', icon: <HelpCircle size={14} /> },
    { key: 'gratuit', labelKey: 'faq.cat.free', icon: <Gift size={14} /> },
    { key: 'xm', labelKey: 'faq.cat.xm', icon: <Building2 size={14} /> },
    { key: 'signaux', labelKey: 'faq.cat.signals', icon: <Bell size={14} /> },
    { key: 'resultats', labelKey: 'faq.cat.results', icon: <TrendingUp size={14} /> },
    { key: 'capital', labelKey: 'faq.cat.capital', icon: <DollarSign size={14} /> },
  ],
  ar: [
    { key: 'all', labelKey: 'faq.cat.all', icon: <HelpCircle size={14} /> },
    { key: 'gratuit', labelKey: 'faq.cat.free', icon: <Gift size={14} /> },
    { key: 'xm', labelKey: 'faq.cat.xm', icon: <Building2 size={14} /> },
    { key: 'signaux', labelKey: 'faq.cat.signals', icon: <Bell size={14} /> },
    { key: 'resultats', labelKey: 'faq.cat.results', icon: <TrendingUp size={14} /> },
    { key: 'capital', labelKey: 'faq.cat.capital', icon: <DollarSign size={14} /> },
  ],
};

// ──────────────────────── Animation helpers ────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────── Main Component ────────────────────────

export function FaqPage() {
  const { language } = useAppStore();

  // State
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const [dbFaqs, setDbFaqs] = useState(hardcodedFaqs);

  // Dynamic XM links
  const [xmLinkFr, setXmLinkFr] = useState(DEFAULT_XM);
  const [xmLinkEn, setXmLinkEn] = useState(DEFAULT_XM);
  const [xmLinkAr, setXmLinkAr] = useState(DEFAULT_XM);
  const [CONTACT_EMAIL, setContactEmail] = useState('contact@chebbitrading.com');
  const XM_LINK = language === 'en' ? xmLinkEn : language === 'ar' ? xmLinkAr : xmLinkFr;

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(json => {
      const s = json?.data;
      if (s) {
        if (s.EMAIL) setContactEmail(s.EMAIL);
        if (s.XM_LINK_FR) setXmLinkFr(s.XM_LINK_FR);
        if (s.XM_LINK_EN) setXmLinkEn(s.XM_LINK_EN);
        if (s.XM_LINK_AR) setXmLinkAr(s.XM_LINK_AR);
        if (!s.XM_LINK_FR && s.XM_LINK) setXmLinkFr(s.XM_LINK);
        if (!s.XM_LINK_EN && s.XM_LINK) setXmLinkEn(s.XM_LINK);
        if (!s.XM_LINK_AR && s.XM_LINK) setXmLinkAr(s.XM_LINK);
      }
    }).catch(() => {});
  }, []);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    let list = [...dbFaqs];

    if (currentCategory !== 'all') {
      list = list.filter((f) => f.category === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => {
        const question = pickLang(f, 'question', language).toLowerCase();
        const answer = pickLang(f, 'answer', language).toLowerCase();
        return question.includes(q) || answer.includes(q);
      });
    }

    return list;
  }, [dbFaqs, currentCategory, searchQuery, language]);

  // Category change handler
  const handleCategoryChange = useCallback((cat: CategoryFilter) => {
    setCurrentCategory(cat);
    setOpenIndex(null);
  }, []);

  // Toggle FAQ
  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const categories = categoryConfigs[language] || categoryConfigs.fr;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="pt-32 pb-12 px-5 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-ct-blue/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold gap-2 mb-6">
                <HelpCircle size={14} className="fill-primary text-primary" />
                FAQ
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-4"
            >
              {t('faq.page.title', language).split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-gradient-green">
                {t('faq.page.title', language).split(' ').slice(-1)}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto"
            >
              {t('faq.page.subtitle', language)}
            </motion.p>

            {/* Search */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="relative max-w-lg mx-auto"
            >
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder={t('faq.search', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 h-12 rounded-full border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary/30 focus:border-primary/50"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: CATEGORY FILTERS
          ═══════════════════════════════════════════════════════════ */}
      <SectionReveal>
        <section className="pb-10 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    currentCategory === cat.key
                      ? 'bg-ct-green text-white shadow-lg shadow-ct-green/25'
                      : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border'
                  }`}
                >
                  {cat.icon}
                  {t(cat.labelKey, language)}
                </button>
              ))}
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: FAQ LIST
          ═══════════════════════════════════════════════════════════ */}
      <SectionReveal>
        <section className="pb-12 px-5">
          <div className="max-w-3xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t('faq.noresults', language)}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('faq.noresults.desc', language)}
                </p>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                >
                  <Send size={14} />
                  Telegram
                </a>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex flex-col gap-2.5"
              >
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    variants={fadeUp}
                    transition={{ duration: 0.35 }}
                  >
                    <FaqAccordionItem
                      faq={faq}
                      language={language}
                      isOpen={openIndex === index}
                      onToggle={() => handleToggle(index)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </SectionReveal>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: CTA CARD
          ═══════════════════════════════════════════════════════════ */}
      <SectionReveal>
        <section className="pb-16 px-5">
          <div className="max-w-3xl mx-auto">
            <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-ct-blue/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative p-8 md:p-10 text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-xl md:text-2xl font-extrabold text-foreground mb-3">
                  {t('faq.cta.title', language)}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md mx-auto">
                  {t('faq.cta.desc', language)}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 bg-ct-blue/15 border border-ct-blue/30 text-ct-blue hover:bg-ct-blue/25 hover:shadow-lg"
                  >
                    <Mail size={16} />
                    {t('faq.cta.telegram', language)}
                  </a>
                  <a
                    href={XM_LINK}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 bg-ct-xm text-white hover:shadow-lg hover:shadow-ct-xm/40"
                  >
                    <MessageCircle size={16} />
                    {t('faq.cta.xm', language)}
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
