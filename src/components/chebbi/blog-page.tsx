'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  X,
  User,
  ChevronDown,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';
import { pickLang } from '@/lib/trilingual';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

// ──────────────────────── Constants ────────────────────────

const LOGO_URL = 'https://i.imgur.com/USEEiyC.png';
const YOUTUBE_URL = 'https://www.youtube.com/@ChebbiTrading/streams';
const TELEGRAM_URL = 'https://t.me/ChebbiTrading';
const XM_LINK = 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=fr&p=1';

// ──────────────────────── Types ────────────────────────

interface BlogArticle {
  id: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  category: string;
  catLabelFr: string;
  catLabelEn: string;
  catLabelAr: string;
  date: string;
  readTime: string;
  views: number;
  excerptFr: string;
  excerptEn: string;
  excerptAr: string;
  contentFr: string;
  contentEn: string;
  contentAr: string;
  emoji: string;
  catColor: string;
  catText: string;
}

type SortBy = 'recent' | 'popular';
type CategoryFilter = 'all' | 'analyse' | 'education' | 'strategie' | 'gold';

// ──────────────────────── Category config ────────────────────────

const categories: Record<Language, { key: CategoryFilter; label: string; emoji: string }[]> = {
  fr: [
    { key: 'all', label: 'Tous les articles', emoji: '📰' },
    { key: 'analyse', label: 'Analyses', emoji: '📊' },
    { key: 'education', label: 'Éducation', emoji: '🎓' },
    { key: 'strategie', label: 'Stratégies', emoji: '⚙️' },
    { key: 'gold', label: 'Or / Gold', emoji: '🥇' },
  ],
  en: [
    { key: 'all', label: 'All articles', emoji: '📰' },
    { key: 'analyse', label: 'Analyses', emoji: '📊' },
    { key: 'education', label: 'Education', emoji: '🎓' },
    { key: 'strategie', label: 'Strategies', emoji: '⚙️' },
    { key: 'gold', label: 'Gold', emoji: '🥇' },
  ],
  ar: [
    { key: 'all', label: 'جميع المقالات', emoji: '📰' },
    { key: 'analyse', label: 'تحليلات', emoji: '📊' },
    { key: 'education', label: 'تعليم', emoji: '🎓' },
    { key: 'strategie', label: 'استراتيجيات', emoji: '⚙️' },
    { key: 'gold', label: 'ذهب', emoji: '🥇' },
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
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

function SectionReveal({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

// ──────────────────────── Skeleton loaders ────────────────────────

function HeroSkeleton() {
  return (
    <section className="pt-32 pb-16 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-4">
            <Skeleton className="h-8 w-44 rounded-full" />
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-5 w-96 max-w-full" />
            <Skeleton className="h-11 w-80 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-72 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleCardSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden border border-border">
      <div className="h-44 bg-secondary/50 flex items-center justify-center">
        <Skeleton className="w-16 h-16 rounded-2xl" />
      </div>
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  );
}

function ArticlesGridSkeleton() {
  return (
    <section className="pb-16 px-5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────── Main Component ────────────────────────

export function BlogPage() {
  const { language } = useAppStore();

  // State
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch articles on mount
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        const r = await fetch('/api/blog', { signal: controller.signal });
        const res = await r.json();
        if (!cancelled) {
          if (res.data && Array.isArray(res.data) && res.data.length > 0) {
            setArticles(res.data);
          }
        }
      } catch {
        // No fallback needed — DB is seeded
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Close modal (must be defined before effects that use it)
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 200);
  }, []);

  // Escape key to close modal
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalOpen, closeModal]);

  // Filtered + sorted articles
  const filteredArticles = useMemo(() => {
    let list = [...articles];

    // Category filter
    if (currentCategory !== 'all') {
      list = list.filter((a) => a.category === currentCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          pickLang(a, 'title', language).toLowerCase().includes(q) ||
          pickLang(a, 'excerpt', language).toLowerCase().includes(q) ||
          pickLang(a, 'catLabel', language).toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'popular') {
      list.sort((a, b) => b.views - a.views);
    }
    // 'recent' keeps the API order (newest first)

    return list;
  }, [articles, currentCategory, searchQuery, sortBy]);

  // Featured article (the +128% one, or most viewed)
  const featuredArticle = useMemo(() => {
    return (
      articles.find(
        (a) =>
          pickLang(a, 'title', language).includes('+128%') ||
          pickLang(a, 'title', language).includes('Bilan 2025') ||
          pickLang(a, 'title', language).includes('2025')
      ) || articles[0]
    );
  }, [articles]);

  // Open article modal
  const openArticle = useCallback((article: BlogArticle) => {
    // Fetch article to increment views
    fetch(`/api/blog/${article.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setSelectedArticle(res.data);
        } else {
          setSelectedArticle(article);
        }
      })
      .catch(() => {
        setSelectedArticle(article);
      });
    setModalOpen(true);
  }, []);

  // Category helpers
  const categoryItems = categories[language] || categories.fr;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gold':
        return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
      case 'education':
        return { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' };
      case 'strategie':
        return { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' };
      case 'analyse':
        return { bg: 'rgba(16,185,129,0.15)', text: '#10b981' };
      default:
        return { bg: 'rgba(16,185,129,0.15)', text: '#10b981' };
    }
  };

  const sortLabels: Record<Language, { recent: string; popular: string }> = {
    fr: { recent: 'Plus récents', popular: 'Plus populaires' },
    en: { recent: 'Most Recent', popular: 'Most Popular' },
    ar: { recent: 'الأحدث', popular: 'الأكثر شعبية' },
  };

  const noResultsLabel: Record<Language, string> = {
    fr: 'Aucun article trouvé',
    en: 'No articles found',
    ar: 'لا توجد مقالات',
  };

  const noResultsDesc: Record<Language, string> = {
    fr: 'Essayez de modifier vos filtres ou votre recherche.',
    en: 'Try adjusting your filters or search query.',
    ar: 'حاول تعديل الفلاتر أو البحث.',
  };

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════ */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <section className="pt-32 pb-16 px-5 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-ct-blue/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* ── Left: Text content ── */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                transition={{ duration: 0.7 }}
              >
                {/* Badge */}
                <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold gap-1.5 mb-6">
                    <BookOpen size={14} className="fill-primary text-primary" />
                    {t('blog.badge', language)}
                  </Badge>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6"
                >
                  <span className="block">{t('blog.title', language)}</span>
                  <span className="block text-gradient-green">
                    {t('blog.subtitle', language).split(' ').slice(0, 2).join(' ')}
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg"
                >
                  {t('blog.subtitle', language)}
                </motion.p>

                {/* Search */}
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="relative max-w-md"
                >
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder={t('blog.search', language)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 py-3 h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-primary/30 focus:border-primary/50"
                  />
                </motion.div>
              </motion.div>

              {/* ── Right: Featured article card ── */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto"
              >
                {featuredArticle && (
                  <Card
                    className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer group"
                    onClick={() => openArticle(featuredArticle)}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/10 to-ct-gold/10 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-colors" />
                      <span className="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                        {featuredArticle.emoji}
                      </span>
                      <Badge
                        className="absolute top-3 left-3 border-0 font-semibold text-xs"
                        style={{
                          backgroundColor: getCategoryColor(featuredArticle.category).bg,
                          color: getCategoryColor(featuredArticle.category).text,
                        }}
                      >
                        {pickLang(featuredArticle, 'catLabel', language)}
                      </Badge>
                      <Badge className="absolute top-3 right-3 bg-ct-gold/15 text-ct-gold border-0 text-xs font-bold">
                        ⭐ Featured
                      </Badge>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {pickLang(featuredArticle, 'title', language)}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pb-3">
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {featuredArticle.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {featuredArticle.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={13} />
                          {featuredArticle.views.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {pickLang(featuredArticle, 'excerpt', language)}
                      </p>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                        {t('blog.read', language)}
                        <ArrowRight size={14} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {t('blog.thearticle', language)}
                        </span>
                      </span>
                    </CardFooter>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: FILTERS
          ═══════════════════════════════════════════════════════════ */}
      <SectionReveal>
        <section className="pb-10 px-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Category filter buttons */}
              <div className="flex flex-wrap gap-2">
                {categoryItems.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCurrentCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      currentCategory === cat.key
                        ? 'bg-ct-green text-white shadow-lg shadow-ct-green/25'
                        : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
                >
                  <TrendingUp size={14} />
                  {sortBy === 'recent'
                    ? sortLabels[language].recent
                    : sortLabels[language].popular}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setSortBy('recent');
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === 'recent'
                          ? 'bg-ct-green/10 text-ct-green'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {sortLabels[language].recent}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('popular');
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        sortBy === 'popular'
                          ? 'bg-ct-green/10 text-ct-green'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {sortLabels[language].popular}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </section>
      </SectionReveal>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: ARTICLE GRID
          ═══════════════════════════════════════════════════════════ */}
      {loading ? (
        <ArticlesGridSkeleton />
      ) : (
        <SectionReveal>
          <section className="pb-16 px-5">
            <div className="max-w-7xl mx-auto">
              {filteredArticles.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {noResultsLabel[language]}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {noResultsDesc[language]}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredArticles.map((article) => {
                    const catColor = getCategoryColor(article.category);
                    return (
                      <motion.div
                        key={article.id}
                        variants={fadeUp}
                        transition={{ duration: 0.4 }}
                      >
                        <Card
                          className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[5px] hover:border-ct-green/50 hover:shadow-xl hover:shadow-ct-green/10 h-full flex flex-col"
                          onClick={() => openArticle(article)}
                        >
                          {/* Thumbnail area */}
                          <div className="relative h-44 bg-gradient-to-br from-secondary/80 to-secondary/40 flex items-center justify-center overflow-hidden">
                            <div
                              className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                              style={{
                                background: `linear-gradient(135deg, ${catColor.bg}, transparent)`,
                              }}
                            />
                            <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                              {article.emoji}
                            </span>
                            <Badge
                              className="absolute top-3 left-3 border-0 font-semibold text-xs"
                              style={{
                                backgroundColor: catColor.bg,
                                color: catColor.text,
                              }}
                            >
                              {pickLang(article, 'catLabel', language)}
                            </Badge>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex flex-col flex-1">
                            {/* Meta row */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {article.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {article.readTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {article.views.toLocaleString()}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {pickLang(article, 'title', language)}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                              {pickLang(article, 'excerpt', language)}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              {/* Author */}
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full border border-primary/50 overflow-hidden">
                                  <img
                                    src={LOGO_URL}
                                    alt="Chebbi Trading"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                  Chebbi Trading
                                </span>
                              </div>

                              {/* Read link */}
                              <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                                {t('blog.read', language)}
                                <span className="group-hover:translate-x-1 transition-transform">
                                  →
                                </span>
                              </span>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </section>
        </SectionReveal>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: ARTICLE MODAL
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalOpen && selectedArticle && (
          <>
            {/* Fullscreen overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md"
              onClick={closeModal}
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[101] overflow-y-auto scrollbar-thin"
            >
              <div className="min-h-screen flex flex-col" onClick={closeModal}>
                <div
                  className="flex-1 w-full max-w-3xl mx-auto px-5 py-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={closeModal}
                    className="fixed top-6 right-6 z-[102] w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-lg"
                  >
                    <X size={18} />
                  </button>

                  {/* Article header */}
                  <div className="mb-8">
                    {/* Category label */}
                    <Badge
                      className="mb-4 border-0 font-semibold text-xs uppercase tracking-wider"
                      style={{
                        backgroundColor: getCategoryColor(selectedArticle.category).bg,
                        color: getCategoryColor(selectedArticle.category).text,
                      }}
                    >
                      {pickLang(selectedArticle, 'catLabel', language)}
                    </Badge>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4">
                      {pickLang(selectedArticle, 'title', language)}
                    </h1>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {selectedArticle.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {selectedArticle.readTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} />
                        {selectedArticle.views.toLocaleString()} {t('blog.views', language)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        Chebbi Trading
                      </span>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-border" />
                  </div>

                  {/* Article content */}
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none mb-12
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3
                      [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4
                      [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:pl-6
                      [&_li]:text-muted-foreground [&_li]:leading-relaxed
                      [&_strong]:text-foreground [&_strong]:font-semibold
                      [&_a]:text-primary [&_a]:underline
                      [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                    "
                    dangerouslySetInnerHTML={{ __html: pickLang(selectedArticle, 'content', language) }}
                  />

                  {/* XM CTA Card */}
                  <Card className="rounded-2xl overflow-hidden border-ct-xm/20 bg-gradient-to-br from-ct-xm/5 to-transparent mb-12">
                    <div className="p-6 sm:p-8 text-center">
                      <div className="text-4xl mb-3">🎯</div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {language === 'fr'
                          ? 'Profitez de ces signaux gratuitement'
                          : language === 'ar'
                            ? 'استفد من هذه الإشارات مجاناً'
                            : 'Get these signals for free'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                        {language === 'fr'
                          ? "Ouvrez un compte XM via notre lien et rejoignez notre groupe Telegram privé pour recevoir tous nos signaux en temps réel."
                          : language === 'ar'
                            ? 'افتح حساب XM عبر رابطنا وانضم لمجموعة تيليجرام الخاصة لاستقبال جميع الإشارات.'
                            : 'Open an XM account via our link and join our private Telegram group to receive all signals in real-time.'}
                      </p>
                      <a
                        href={XM_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-ct-xm hover:bg-ct-xm/90 text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ct-xm/30"
                      >
                        {language === 'fr'
                          ? "S'inscrire sur XM — Gratuit"
                          : language === 'ar'
                            ? 'التسجيل في XM — مجاني'
                            : 'Join XM — Free'}
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </Card>

                  {/* Bottom close button */}
                  <div className="text-center pb-8">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      className="border-border hover:border-primary/50"
                    >
                      {language === 'fr'
                        ? 'Fermer'
                        : language === 'ar'
                          ? 'إغلاق'
                          : 'Close'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4.5: FREE EBOOK CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
              {/* Gradient top border */}
              <div className="h-1 bg-gradient-to-r from-primary via-ct-blue to-primary" />

              <div className="p-8 sm:p-10 text-center">
                {/* Gift icon */}
                <div className="text-5xl mb-5">🎁</div>

                {/* Badge */}
                <Badge className="bg-primary/10 text-primary border-primary/20 text-sm mb-5 px-4 py-1.5 font-bold tracking-wider">
                  {t('ebook.badge', language)}
                </Badge>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4 leading-tight">
                  {t('ebook.title', language)}
                </h2>

                {/* Subtitle with HTML */}
                <p
                  className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto mb-6"
                  dangerouslySetInnerHTML={{ __html: t('ebook.subtitle', language) }}
                />

                {/* Topic tags */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                  {[
                    { color: 'bg-ct-blue', text: t('ebook.tag1', language) },
                    { color: 'bg-pink-500', text: t('ebook.tag2', language) },
                    { color: 'bg-ct-purple', text: t('ebook.tag3', language) },
                  ].map((tag) => (
                    <div key={tag.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`w-3 h-3 rounded-sm ${tag.color}`} />
                      {tag.text}
                    </div>
                  ))}
                </div>

                {/* Email form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                    if (emailInput?.value) {
                      // Could POST to an API here
                      emailInput.value = '';
                      alert(t('ebook.success', language));
                    }
                  }}
                  className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mb-5"
                >
                  <Input
                    type="email"
                    placeholder={t('ebook.placeholder', language)}
                    required
                    className="flex-1 h-12 bg-secondary border-border rounded-xl text-sm px-4 focus-visible:ring-primary"
                  />
                  <Button
                    type="submit"
                    className="w-full sm:w-auto h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 text-sm whitespace-nowrap"
                  >
                    {t('ebook.cta', language)}
                  </Button>
                </form>

                {/* Trust note */}
                <p className="text-xs text-muted-foreground">
                  {t('ebook.note', language)}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="mt-auto border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <img
                    src={LOGO_URL}
                    alt="Chebbi Trading"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Chebbi Trading</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'fr'
                      ? 'Signaux Forex Gratuits'
                      : language === 'ar'
                        ? 'إشارات فوركس مجانية'
                        : 'Free Forex Signals'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                {language === 'fr'
                  ? '4 ans de résultats live sur YouTube. Signaux forex gratuits et vérifiables.'
                  : language === 'ar'
                    ? '4 سنوات من النتائج المباشرة على يوتيوب. إشارات مجانية وموثوقة.'
                    : '4 years of live results on YouTube. Free and verifiable forex signals.'}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-foreground text-sm mb-4">Liens</h4>
              <div className="space-y-2">
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ct-red transition-colors"
                >
                  ▶ YouTube
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ct-blue transition-colors"
                >
                  ✈ Telegram
                </a>
                <a
                  href={XM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-ct-xm transition-colors"
                >
                  🏦 XM Trading
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-foreground text-sm mb-4">Contact</h4>
              <div className="space-y-2">
                <a
                  href="mailto:contact@chebbitrade.com"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  📧 contact@chebbitrade.com
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  💬 Telegram Support
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{t('foot.copy', language)}</p>
            <p className="text-xs text-muted-foreground/60">{t('foot.risk', language)}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Re-export for named import
export default BlogPage;
