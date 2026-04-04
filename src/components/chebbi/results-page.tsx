'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import {
  BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts';
import {
  BarChart3, TrendingUp, AlertTriangle, Youtube, ExternalLink,
  ArrowUpRight, ArrowDownRight, Minus, ChevronDown, ChevronUp, Loader2,
  X as XIcon,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ──────────────────────── Constants ────────────────────────

const DEFAULT_LOGO_URL = 'https://i.imgur.com/USEEiyC.png';
const YOUTUBE_URL = 'https://www.youtube.com/@ChebbiTrading/streams';
const DEFAULT_XM = 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=fr&p=1';

const YEARS_STATIC = ['2023', '2024', '2025', '2026'] as const;

const MONTH_LABELS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ──────────────────────── Types ────────────────────────

interface MonthlyPerformance {
  id: string;
  year: number;
  monthIndex: number;
  monthLabelFr: string;
  monthLabelEn: string;
  monthLabelAr: string;
  lowRisk: number | null;
  mediumRisk: number | null;
}

interface Trade {
  id: string;
  year: number;
  month: number;
  contract: string;
  period: string;
  direction: string;
  entry: number;
  exit: number;
  pips: number;
  result: string;
}

type TradeFilter = 'all' | 'W' | 'L' | 'BE';

interface ResultsApiResponse {
  data: Record<string, MonthlyPerformance[]>;
  all: MonthlyPerformance[];
}

interface TradesApiResponse {
  data: Trade[];
  count: number;
}

// ──────────────────────── Helpers ────────────────────────

function getMonthLabel(m: MonthlyPerformance, lang: Language) {
  if (lang === 'ar') return m.monthLabelAr;
  if (lang === 'en') return m.monthLabelEn;
  return m.monthLabelFr;
}

function getMonthShort(lang: Language) {
  if (lang === 'en') return MONTH_LABELS_EN;
  return [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
  ];
}

function pctFormat(v: number | null | undefined): string {
  if (v == null) return '—';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function cumulativeData(months: MonthlyPerformance[]): { label: string; capital: number }[] {
  let capital = 10000;
  const points: { label: string; capital: number }[] = [{ label: 'Start', capital }];
  for (const m of months) {
    if (m.lowRisk != null) {
      capital = capital * (1 + m.lowRisk / 100);
    }
    points.push({ label: m.monthLabelEn, capital: Math.round(capital * 100) / 100 });
  }
  return points;
}

// ──────────────────────── Animation Wrapper ────────────────────────

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────── Custom Tooltip ────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  const isPositive = value >= 0;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className={`font-mono font-bold ${isPositive ? 'text-ct-green' : 'text-ct-red'}`}>
        {pctFormat(value)}
      </p>
    </div>
  );
}

function CapitalTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="font-mono font-bold text-ct-green">
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

// ──────────────────────── SECTION 1: Hero ────────────────────────

function HeroSection({ lang }: { lang: Language }) {
  return (
    <section className="pt-32 pb-10 px-5">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-semibold gap-2">
            <BarChart3 size={14} />
            {lang === 'fr' ? 'Transparence totale' : lang === 'ar' ? 'شفافية كاملة' : 'Full Transparency'}
          </Badge>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-gradient-green">
              {t('results.title', lang)}
            </span>
            <br />
            <span className="text-foreground">
              {lang === 'fr' ? 'Live Vérifiables' : lang === 'ar' ? 'مباشرة موثوقة' : 'Live Verifiable'}
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('results.subtitle', lang)}
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="inline-flex items-center gap-3 bg-ct-gold/10 border border-ct-gold/30 text-ct-gold rounded-xl px-5 py-3 text-sm font-medium">
            <AlertTriangle size={16} />
            {t('risk.warn', lang)}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 2: Year Summary Cards ────────────────────────

function YearSummarySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-7 text-center">
          <Skeleton className="h-5 w-16 mx-auto mb-3" />
          <Skeleton className="h-10 w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

function YearSummaryCards({ lang, data }: { lang: Language; data: MonthlyPerformance[] }) {
  // Auto-calculate per-year totals using compounding formula:
  // Final = Initial × (1 + r1)(1 + r2)...(1 + r12) → yearly % = product - 1
  const yearTotals = useMemo(() => {
    const years = new Set(data.map(m => String(m.year)));
    const result: { year: string; pct: number }[] = [];
    for (const year of Array.from(years).sort()) {
      const months = data.filter(m => String(m.year) === year);
      // Compounding: multiply (1 + r_i/100) for each month
      const compounded = months.reduce((product, m) => {
        const r = (m.lowRisk ?? 0) / 100; // convert percentage to decimal
        return product * (1 + r);
      }, 1);
      const yearlyPct = (compounded - 1) * 100; // back to percentage
      result.push({ year, pct: Math.round(yearlyPct * 100) / 100 });
    }
    return result;
  }, [data]);

  const currentYear = String(new Date().getFullYear());

  if (yearTotals.length === 0) {
    return (
      <section className="pb-10 px-5">
        <div className="max-w-5xl mx-auto">
          <YearSummarySkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="pb-10 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {yearTotals.map(({ year, pct }) => {
              const isOngoing = year === currentYear;
              const isPositive = pct >= 0;
              return (
                <motion.div
                  key={year}
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(16,185,129,0.15)' }}
                  className="relative bg-card border border-border rounded-2xl p-7 text-center cursor-default transition-all hover:border-ct-green/50 group"
                >
                  {isOngoing && (
                    <Badge className="absolute top-3 right-3 bg-ct-gold/15 text-ct-gold text-[10px] px-2 py-0.5 border-0 font-bold uppercase tracking-wider">
                      {t('res.ongoing', lang)}
                    </Badge>
                  )}
                  <p className="text-muted-foreground font-semibold text-sm mb-2">{year}</p>
                  <p className={`font-mono font-extrabold text-2xl ${isPositive ? 'text-ct-green' : 'text-ct-red'} transition-colors`}>
                    {isPositive ? '+' : ''}{pct.toFixed(2)}%
                  </p>
                  <div className="mt-3 mx-auto w-10 h-1 rounded-full bg-ct-green/20 group-hover:bg-ct-green/40 transition-colors" />
                </motion.div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 3: Bar Chart ────────────────────────

function BarChartSection({
  lang,
  data,
  loading,
}: {
  lang: Language;
  data: MonthlyPerformance[];
  loading: boolean;
}) {
  const [selectedYear, setSelectedYear] = useState('all');

  const filteredData = useMemo(() => {
    let months = selectedYear === 'all'
      ? data
      : data.filter((m) => String(m.year) === selectedYear);
    months = months.sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex);
    return months.map((m) => ({
      label: `${m.monthLabelEn} ${m.year}`,
      value: m.lowRisk ?? 0,
      rawValue: m.lowRisk,
    }));
  }, [data, selectedYear]);

  const tabItems = [
    { key: 'all', label: t('results.all', lang) },
    ...YEARS_STATIC.map((y) => ({ key: y, label: y })),
  ];

  return (
    <section className="pb-12 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center">
            📊 {t('results.chart', lang)}
          </h2>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            {lang === 'fr' ? 'Performance mensuelle Low Risk' : lang === 'ar' ? 'أداء شهري منخفض المخاطر' : 'Monthly Low Risk Performance'}
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <Card className="rounded-2xl overflow-hidden">
            <CardContent className="p-5 sm:p-7">
              {/* Year filter tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tabItems.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedYear(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedYear === tab.key
                        ? 'bg-ct-green text-white shadow-lg shadow-ct-green/25'
                        : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <Skeleton className="w-full h-[340px] rounded-xl" />
              ) : (
                <div className="w-full h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['dataMin - 1', 'dataMax + 1']}
                        tickFormatter={(v: number) => `${v >= 0 ? '+' : ''}${v}%`}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        width={65}
                        allowDataOverflow={false}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
                      <ReferenceLine y={0} stroke="rgba(148,163,184,0.4)" strokeWidth={1.5} />
                      <Bar
                        dataKey="value"
                        maxBarSize={40}
                        isAnimationActive={true}
                        radius={4}
                      >
                        {filteredData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.value >= 0 ? '#10b981' : '#ef4444'}
                            fillOpacity={entry.value >= 0 ? 0.9 : 0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 4: Cumulative Line Chart ────────────────────────

function CumulativeChartSection({
  lang,
  data,
  loading,
}: {
  lang: Language;
  data: MonthlyPerformance[];
  loading: boolean;
}) {
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex);
  }, [data]);

  const cumData = useMemo(() => cumulativeData(sorted), [sorted]);

  const title =
    lang === 'fr'
      ? 'Croissance cumulée du capital — Low Risk'
      : lang === 'ar'
        ? 'النمو التراكمي لرأس المال — مخاطر منخفضة'
        : 'Cumulative Capital Growth — Low Risk';

  return (
    <section className="pb-12 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <Card className="rounded-2xl overflow-hidden bg-secondary/20 border-border">
            <CardContent className="p-5 sm:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-ct-green/15 flex items-center justify-center">
                  <TrendingUp size={20} className="text-ct-green" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {lang === 'fr'
                      ? 'Capital de départ : $10,000 — 1$/pip'
                      : lang === 'ar'
                        ? 'رأس المال الأولي: $10,000 — 1$/نقطة'
                        : 'Starting Capital: $10,000 — 1$/pip'}
                  </p>
                </div>
              </div>

              {loading ? (
                <Skeleton className="w-full h-[340px] rounded-xl" />
              ) : (
                <div className="w-full h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        width={55}
                      />
                      <Tooltip content={<CapitalTooltip />} />
                      <ReferenceLine y={10000} stroke="rgba(148,163,184,0.2)" strokeDasharray="5 5" />
                      <Area
                        type="monotone"
                        dataKey="capital"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#capitalGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Stats under chart */}
              {!loading && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{lang === 'fr' ? 'Capital initial' : 'Initial Capital'}</p>
                    <p className="font-mono font-bold text-foreground">$10,000</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{lang === 'fr' ? 'Capital actuel' : 'Current Capital'}</p>
                    <p className="font-mono font-bold text-ct-green">
                      ${cumData[cumData.length - 1]?.capital.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">{lang === 'fr' ? 'Gain total' : 'Total Gain'}</p>
                    <p className="font-mono font-bold text-ct-green">
                      +{(((cumData[cumData.length - 1]?.capital ?? 10000) - 10000) / 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 5: Monthly Breakdown ────────────────────────

function MonthlyBreakdownSection({
  lang,
  data,
  loading,
}: {
  lang: Language;
  data: MonthlyPerformance[];
  loading: boolean;
}) {
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthTrades, setMonthTrades] = useState<Trade[]>([]);
  const [monthTradesLoading, setMonthTradesLoading] = useState(false);
  const tradesRef = useRef<HTMLDivElement>(null);
  const monthsShort = getMonthShort(lang);

  const monthNamesFull = lang === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : lang === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const yearMonths = useMemo(() => {
    const filtered = data.filter((m) => String(m.year) === selectedYear);
    return filtered.sort((a, b) => a.monthIndex - b.monthIndex);
  }, [data, selectedYear]);

  const yearTotals = useMemo(() => {
    const filtered = data.filter((m) => String(m.year) === selectedYear);
    const lowTotal = filtered.reduce((s, m) => s + (m.lowRisk ?? 0), 0);
    const active = filtered.filter((m) => m.lowRisk != null).length;
    return { lowTotal, active };
  }, [data, selectedYear]);

  // Build a 12-cell grid
  const grid = useMemo(() => {
    const map = new Map<number, MonthlyPerformance>();
    for (const m of yearMonths) map.set(m.monthIndex, m);
    return Array.from({ length: 12 }, (_, i) => map.get(i) ?? null);
  }, [yearMonths]);

  // Fetch trades for selected month
  useEffect(() => {
    if (selectedMonth === null) {
      setMonthTrades([]);
      return;
    }
    let cancelled = false;
    setMonthTradesLoading(true);
    (async () => {
      try {
        const r = await fetch(`/api/trades?year=${selectedYear}&month=${selectedMonth}`);
        const res = await r.json();
        if (!cancelled) setMonthTrades(res.data ?? []);
      } catch {
        if (!cancelled) setMonthTrades([]);
      } finally {
        if (!cancelled) setMonthTradesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedYear, selectedMonth]);

  // Scroll to trades panel when month is selected
  useEffect(() => {
    if (selectedMonth !== null && tradesRef.current) {
      setTimeout(() => {
        tradesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [selectedMonth]);

  // Reset selected month when year changes
  useEffect(() => {
    setSelectedMonth(null);
  }, [selectedYear]);

  const handleMonthClick = (idx: number, hasData: boolean) => {
    if (!hasData) return;
    setSelectedMonth(selectedMonth === idx ? null : idx);
  };

  // Month trades stats
  const monthStats = useMemo(() => {
    const wins = monthTrades.filter(t => t.result === 'W').length;
    const losses = monthTrades.filter(t => t.result === 'L').length;
    const be = monthTrades.filter(t => t.result === 'BE').length;
    const totalPips = monthTrades.reduce((s, t) => s + t.pips, 0);
    const winRate = monthTrades.length > 0 ? Math.round((wins / monthTrades.length) * 100) : 0;
    return { wins, losses, be, totalPips, winRate, total: monthTrades.length };
  }, [monthTrades]);

  if (loading) {
    return (
      <section className="pb-12 px-5">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-8 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-12 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center">
            📅 {t('results.monthly', lang)}
          </h2>
          <p className="text-muted-foreground text-center mb-1 text-sm">
            {lang === 'fr'
              ? `Détail mois par mois — ${selectedYear}`
              : lang === 'ar'
                ? `تفاصيل شهر بشهر — ${selectedYear}`
                : `Month by month detail — ${selectedYear}`}
          </p>
          <p className="text-muted-foreground/60 text-center mb-6 text-xs">
            {lang === 'fr'
              ? 'Cliquez sur un mois pour voir les trades'
              : lang === 'ar'
                ? 'انقر على شهر لرؤية الصفقات'
                : 'Click a month to see the trades'}
          </p>
        </FadeIn>

        {/* Year tabs */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {YEARS_STATIC.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedYear === y
                    ? 'bg-ct-green text-white shadow-lg shadow-ct-green/25'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Stats row */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('res.low', lang)}</p>
              <p className={`font-mono font-bold text-lg ${yearTotals.lowTotal >= 0 ? 'text-ct-green' : 'text-ct-red'}`}>
                {pctFormat(yearTotals.lowTotal)}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('res.months', lang)}</p>
              <p className="font-mono font-bold text-lg text-foreground">{yearTotals.active}/12</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center hidden sm:block">
              <p className="text-xs text-muted-foreground mb-1">{t('res.med', lang)}</p>
              <p className="font-mono font-bold text-lg text-ct-gold">
                {pctFormat(
                  yearMonths.reduce((s, m) => s + (m.mediumRisk ?? 0), 0),
                )}
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Month Grid */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {grid.map((month, idx) => {
              const hasData = month !== null && month.lowRisk != null;
              const isPositive = month?.lowRisk != null && month.lowRisk > 0;
              const isNegative = month?.lowRisk != null && month.lowRisk < 0;
              const isSelected = selectedMonth === idx;

              return (
                <motion.div
                  key={idx}
                  whileHover={hasData ? { y: -2 } : {}}
                  whileTap={hasData ? { scale: 0.97 } : {}}
                  onClick={() => handleMonthClick(idx, hasData)}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    hasData ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isSelected
                      ? 'ring-2 ring-ct-green ring-offset-2 ring-offset-background bg-ct-green/5 border-ct-green/40 shadow-lg shadow-ct-green/10'
                      : hasData
                        ? `bg-card border-border hover:shadow-lg ${
                            isPositive
                              ? 'border-l-[3px] border-l-ct-green'
                              : isNegative
                                ? 'border-l-[3px] border-l-ct-red'
                                : 'border-l-[3px] border-l-ct-gold'
                          }`
                        : 'bg-card/40 border-border/50 opacity-40'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-2 ${isSelected ? 'text-ct-green' : 'text-muted-foreground'}`}>
                    {monthsShort[idx]}
                  </p>
                  {hasData ? (
                    <>
                      <p
                        className={`font-mono font-bold text-lg ${
                          isPositive
                            ? 'text-ct-green'
                            : isNegative
                              ? 'text-ct-red'
                              : 'text-ct-gold'
                        }`}
                      >
                        {pctFormat(month!.lowRisk)}
                      </p>
                      {month!.mediumRisk != null && (
                        <p
                          className={`font-mono text-xs mt-1 ${
                            month!.mediumRisk! >= 0 ? 'text-ct-green/70' : 'text-ct-red/70'
                          }`}
                        >
                          {pctFormat(month!.mediumRisk)}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="font-mono text-lg text-muted-foreground/40">—</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </FadeIn>

        {/* ── Inline Trades Panel ── */}
        <AnimatePresence mode="wait">
          {selectedMonth !== null && (
            <motion.div
              ref={tradesRef}
              key={`${selectedYear}-${selectedMonth}`}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden scroll-mt-24"
            >
              <Card className="rounded-2xl border-ct-green/20 bg-gradient-to-b from-ct-green/[0.03] to-transparent overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ct-green/15 flex items-center justify-center">
                      <BarChart3 size={20} className="text-ct-green" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base sm:text-lg">
                        {lang === 'fr'
                          ? `Trades — ${monthNamesFull[selectedMonth]} ${selectedYear}`
                          : lang === 'ar'
                            ? `صفقات — ${monthNamesFull[selectedMonth]} ${selectedYear}`
                            : `Trades — ${monthNamesFull[selectedMonth]} ${selectedYear}`}
                      </h3>
                      {!monthTradesLoading && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {monthStats.total} {lang === 'fr' ? 'trades' : lang === 'ar' ? 'صفقة' : 'trades'}
                          {' · '}
                          <span className="text-ct-green">{monthStats.wins}W</span>
                          {' / '}
                          <span className="text-ct-red">{monthStats.losses}L</span>
                          {monthStats.be > 0 && <> / <span className="text-ct-gold">{monthStats.be}BE</span></>}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <XIcon size={16} />
                  </button>
                </div>

                {/* Stats Bar */}
                {!monthTradesLoading && monthStats.total > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-border/30">
                    {[
                      { label: lang === 'fr' ? 'Win Rate' : lang === 'ar' ? 'نسبة الفوز' : 'Win Rate', value: `${monthStats.winRate}%`, color: monthStats.winRate > 50 ? 'text-ct-green' : 'text-ct-gold' },
                      { label: 'Pips', value: `${monthStats.totalPips >= 0 ? '+' : ''}${monthStats.totalPips}`, color: monthStats.totalPips >= 0 ? 'text-ct-green' : 'text-ct-red' },
                      { label: lang === 'fr' ? 'Trades' : lang === 'ar' ? 'الصفقات' : 'Trades', value: String(monthStats.total), color: 'text-foreground' },
                      { label: lang === 'fr' ? 'Gagnants' : lang === 'ar' ? 'رابحة' : 'Wins', value: String(monthStats.wins), color: 'text-ct-green' },
                      { label: lang === 'fr' ? 'Perdants' : lang === 'ar' ? 'خاسرة' : 'Losses', value: String(monthStats.losses), color: 'text-ct-red' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-card/80 px-3 py-3 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1">{stat.label}</p>
                        <p className={`font-mono font-bold text-sm ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Trade Table */}
                <CardContent className="p-0">
                  {monthTradesLoading ? (
                    <div className="p-6 space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-lg" />
                      ))}
                    </div>
                  ) : monthTrades.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg mb-1">📭</p>
                      <p className="text-sm">
                        {lang === 'fr'
                          ? 'Aucun trade pour ce mois'
                          : lang === 'ar'
                            ? 'لا توجد صفقات لهذا الشهر'
                            : 'No trades for this month'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/50 text-xs text-muted-foreground/70 uppercase tracking-wider">
                              <th className="text-left px-5 py-3 font-semibold">#</th>
                              <th className="text-left px-3 py-3 font-semibold">{lang === 'fr' ? 'Paire' : lang === 'ar' ? 'الزوج' : 'Pair'}</th>
                              <th className="text-center px-3 py-3 font-semibold">{lang === 'fr' ? 'Direction' : lang === 'ar' ? 'الاتجاه' : 'Direction'}</th>
                              <th className="text-center px-3 py-3 font-semibold">{lang === 'fr' ? 'Entrée' : lang === 'ar' ? 'الدخول' : 'Entry'}</th>
                              <th className="text-center px-3 py-3 font-semibold">{lang === 'fr' ? 'Sortie' : lang === 'ar' ? 'الخروج' : 'Exit'}</th>
                              <th className="text-center px-3 py-3 font-semibold">Pips</th>
                              <th className="text-center px-3 py-3 font-semibold">{lang === 'fr' ? 'Résultat' : lang === 'ar' ? 'النتيجة' : 'Result'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {monthTrades.map((trade, i) => {
                              const isWin = trade.result === 'W';
                              const isLoss = trade.result === 'L';
                              return (
                                <tr
                                  key={trade.id}
                                  className={`border-b border-border/30 transition-colors hover:bg-secondary/30 ${
                                    i % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                                  }`}
                                >
                                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{i + 1}</td>
                                  <td className="px-3 py-3 font-bold text-foreground">{trade.contract}</td>
                                  <td className="px-3 py-3 text-center">
                                    <Badge className={`text-[10px] px-2 py-0 border-0 font-bold ${
                                      trade.direction === 'BUY' ? 'bg-ct-green/15 text-ct-green' : 'bg-ct-red/15 text-ct-red'
                                    }`}>
                                      {trade.direction}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">{trade.entry}</td>
                                  <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">{trade.exit}</td>
                                  <td className="px-3 py-3 text-center">
                                    <span className={`font-mono font-bold text-sm flex items-center justify-center gap-1 ${
                                      trade.pips > 0 ? 'text-ct-green' : trade.pips < 0 ? 'text-ct-red' : 'text-ct-gold'
                                    }`}>
                                      {trade.pips > 0 && <ArrowUpRight size={12} />}
                                      {trade.pips < 0 && <ArrowDownRight size={12} />}
                                      {trade.pips > 0 ? '+' : ''}{trade.pips}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-center">
                                    <Badge className={`text-[10px] px-2.5 py-0.5 border-0 font-bold uppercase ${
                                      isWin ? 'bg-ct-green/15 text-ct-green' : isLoss ? 'bg-ct-red/15 text-ct-red' : 'bg-ct-gold/15 text-ct-gold'
                                    }`}>
                                      {isWin ? 'Win' : isLoss ? 'Loss' : 'BE'}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="sm:hidden space-y-2 p-4">
                        {monthTrades.map((trade, i) => {
                          const isWin = trade.result === 'W';
                          const isLoss = trade.result === 'L';
                          const borderColor = isWin ? 'border-l-ct-green' : isLoss ? 'border-l-ct-red' : 'border-l-ct-gold';
                          return (
                            <div
                              key={trade.id}
                              className={`bg-secondary/20 border border-border/50 rounded-lg border-l-[3px] ${borderColor} p-3`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-muted-foreground">#{i + 1}</span>
                                  <span className="font-bold text-foreground text-sm">{trade.contract}</span>
                                  <Badge className={`text-[9px] px-1.5 py-0 border-0 font-bold ${
                                    trade.direction === 'BUY' ? 'bg-ct-green/15 text-ct-green' : 'bg-ct-red/15 text-ct-red'
                                  }`}>
                                    {trade.direction}
                                  </Badge>
                                </div>
                                <Badge className={`text-[10px] px-2 py-0.5 border-0 font-bold ${
                                  isWin ? 'bg-ct-green/15 text-ct-green' : isLoss ? 'bg-ct-red/15 text-ct-red' : 'bg-ct-gold/15 text-ct-gold'
                                }`}>
                                  {isWin ? 'Win' : isLoss ? 'Loss' : 'BE'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-muted-foreground">{trade.entry} → {trade.exit}</span>
                                <span className={`font-mono font-bold ${
                                  trade.pips > 0 ? 'text-ct-green' : trade.pips < 0 ? 'text-ct-red' : 'text-ct-gold'
                                }`}>
                                  {trade.pips > 0 ? '+' : ''}{trade.pips} pips
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Close / collapse button */}
                      <div className="text-center py-4 border-t border-border/30">
                        <button
                          onClick={() => setSelectedMonth(null)}
                          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronUp size={14} />
                          {lang === 'fr' ? 'Fermer' : lang === 'ar' ? 'إغلاق' : 'Close'}
                        </button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 7: CTA ────────────────────────

function CtaSection({ lang, xmLink }: { lang: Language; xmLink: string }) {
  return (
    <section className="pb-12 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <Card className="rounded-2xl overflow-hidden border-ct-green/20 bg-gradient-to-br from-ct-green/5 to-transparent">
            <CardContent className="p-8 sm:p-12 text-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-5"
              >
                📺
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-foreground">
                {lang === 'fr'
                  ? 'Tous nos trades en live YouTube'
                  : lang === 'ar'
                    ? 'جميع صفقاتنا مباشرة على يوتيوب'
                    : 'All our trades live on YouTube'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                {lang === 'fr'
                  ? 'Chaque signal est annoncé en direct avant l\'entrée. Aucune manipulation, aucun resultat caché. Rejoignez notre communauté.'
                  : lang === 'ar'
                    ? 'كل إشارة يتم الإعلان عنها مباشرة قبل الدخول. لا تلاعب، لا نتائج مخفية.'
                    : 'Every signal is announced live before entry. No manipulation, no hidden results. Join our community.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ct-red hover:bg-ct-red/90 text-white px-7 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ct-red/25"
                >
                  <Youtube size={18} />
                  YouTube Live
                  <ExternalLink size={14} />
                </a>
                <a
                  href={xmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ct-xm hover:bg-ct-xm/90 text-white px-7 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ct-xm/25"
                >
                  {t('nav.register', lang)}
                  <ExternalLink size={14} />
                </a>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 8: Risk Disclaimer ────────────────────────

function RiskDisclaimer({ lang }: { lang: Language }) {
  return (
    <section className="pb-8 px-5">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="bg-ct-red/5 border border-ct-red/20 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-ct-red/15 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={20} className="text-ct-red" />
              </div>
              <div>
                <h3 className="font-bold text-ct-red text-lg mb-2">
                  {lang === 'fr'
                    ? 'Avertissement de risque'
                    : lang === 'ar'
                      ? 'تحذير المخاطر'
                      : 'Risk Warning'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lang === 'fr'
                    ? "Le trading de Forex et de CFD comporte un risque élevé de perte en capital. Les performances passées ne garantissent pas les résultats futurs. Vous ne devez investir que l'argent que vous pouvez vous permettre de perdre. Les liens vers XM sont des liens d'affiliation — nous recevons une commission si vous ouvrez un compte via nos liens. Cela n'affecte ni le prix que vous payez, ni la qualité du service."
                    : lang === 'ar'
                      ? 'تداول الفوركس والعقود مقابل الفروقات ينطوي على مخاطر عالية لخسارة رأس المال. الأداء السابق لا يضمن النتائج المستقبلية. روابط XM هي روابط تابعة.'
                      : 'Forex and CFD trading carries a high risk of capital loss. Past performance does not guarantee future results. Only invest money you can afford to lose. Links to XM are affiliate links — we receive a commission if you open an account through our links. This does not affect the price you pay or the quality of service.'}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ──────────────────────── SECTION 9: Footer ────────────────────────

function Footer({ lang, logoUrl }: { lang: Language, logoUrl: string }) {
  const { setCurrentView } = useAppStore();

  const navItems: { key: string; labelKey: string }[] = [
    { key: 'home', labelKey: 'nav.home' },
    { key: 'results', labelKey: 'nav.results' },
    { key: 'blog', labelKey: 'nav.blog' },
    { key: 'faq', labelKey: 'nav.faq' },
  ];

  return (
    <footer className="sticky bottom-0 bg-card/80 glass border-t border-border z-50">
      <div className="max-w-7xl mx-auto px-5 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-[#06090f] p-1">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain scale-[1.5]" />
            </div>
            <span className="text-sm font-bold text-foreground">
              Chebbi <em className="not-italic text-ct-green">Trading</em>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-1 flex-wrap justify-center">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === 'faq') {
                    setCurrentView('home');
                    setTimeout(() => {
                      const el = document.getElementById('faq-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  } else {
                    setCurrentView(item.key as any);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                {t(item.labelKey, lang)}
              </button>
            ))}
            <a
              href="https://t.me/chebbitrading"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-ct-gold hover:bg-ct-gold/10 transition-all"
            >
              Telegram
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            {t('foot.copy', lang)}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────── MAIN: ResultsPage ────────────────────────

export function ResultsPage() {
  const { language } = useAppStore();

  const [resultsData, setResultsData] = useState<MonthlyPerformance[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);


  // Dynamic XM links
  const [xmLinkFr, setXmLinkFr] = useState(DEFAULT_XM);
  const [xmLinkEn, setXmLinkEn] = useState(DEFAULT_XM);
  const [xmLinkAr, setXmLinkAr] = useState(DEFAULT_XM);
  const XM_LINK = language === 'en' ? xmLinkEn : language === 'ar' ? xmLinkAr : xmLinkFr;

  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO_URL);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(json => {
      const s = json?.data;
      if (s) {
        if (s.XM_LINK_FR) setXmLinkFr(s.XM_LINK_FR);
        if (s.XM_LINK_EN) setXmLinkEn(s.XM_LINK_EN);
        if (s.XM_LINK_AR) setXmLinkAr(s.XM_LINK_AR);
        if (!s.XM_LINK_FR && s.XM_LINK) setXmLinkFr(s.XM_LINK);
        if (!s.XM_LINK_EN && s.XM_LINK) setXmLinkEn(s.XM_LINK);
        if (!s.XM_LINK_AR && s.XM_LINK) setXmLinkAr(s.XM_LINK);
        if (s.LOGO_URL) setLogoUrl(s.LOGO_URL);
      }
    }).catch(() => {});
  }, []);

  // Fetch results data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/results');
        const res: ResultsApiResponse = await r.json();
        if (!cancelled) setResultsData(res.all ?? []);
      } catch (_e) {
        if (!cancelled) setResultsData([]);
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);



  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Hero */}
      <HeroSection lang={language} />

      {/* Year Summary Cards */}
      <YearSummaryCards lang={language} data={resultsData} />

      {/* Bar Chart */}
      <BarChartSection lang={language} data={resultsData} loading={resultsLoading} />

      {/* Cumulative Line Chart */}
      <CumulativeChartSection lang={language} data={resultsData} loading={resultsLoading} />

      {/* Monthly Breakdown */}
      <MonthlyBreakdownSection lang={language} data={resultsData} loading={resultsLoading} />



      {/* CTA */}
      <CtaSection lang={language} xmLink={XM_LINK} />

      {/* Risk Disclaimer */}
      <RiskDisclaimer lang={language} />

      {/* Footer */}
      <Footer lang={language} logoUrl={logoUrl} />
    </div>
  );
}
