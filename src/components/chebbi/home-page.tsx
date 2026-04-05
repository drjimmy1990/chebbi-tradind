'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Zap,
  Gift,
  ArrowRight,
  CheckCircle2,
  Send,
  Youtube,
  MessageCircle,
  Mail,
  ShieldCheck,
  Star,
  ExternalLink,
  Play,
  BarChart3,
  Target,
  CircleDot,
  UserPlus,
  Loader2,
  Upload,
  Facebook,
  Instagram,
} from 'lucide-react';

const TiktokIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { pickLang } from '@/lib/trilingual';
import { hardcodedFaqs } from '@/lib/faqs';
import { FaqAccordionItem } from '@/components/chebbi/faq-accordion-item';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

// ─── Defaults (fallback until DB loads) ───────────────────────
const DEFAULT_LOGO = 'https://i.imgur.com/USEEiyC.png';
const DEFAULT_YOUTUBE = 'https://www.youtube.com/@chebbitrading';
const DEFAULT_TELEGRAM = 'https://t.me/ChebbiTrading';
const DEFAULT_XM = 'https://clicks.pipaffiliates.com/c?c=CHEBBI&l=fr&p=1';

// ─── Animation helpers ────────────────────────────────────────
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

function SectionHeading({ badge, title, titleGradient, subtitle }: { badge: string; title: string; titleGradient?: string; subtitle: string }) {
  return (
    <SectionReveal className="text-center mb-12 lg:mb-16">
      <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold mb-4">
        {badge}
      </Badge>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
        {title}{' '}
        {titleGradient && <span className="text-gradient-green">{titleGradient}</span>}
      </h2>
      <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
        {subtitle}
      </p>
    </SectionReveal>
  );
}


// ─── Types for dynamic data ──────────────────────────────────
interface DbTestimonial {
  id: string;
  name: string;
  initials: string;
  stars: number;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  textFr: string;
  textEn: string;
  textAr: string;
}

interface DbFaq {
  id: string;
  questionFr: string;
  questionEn: string;
  questionAr: string;
  answerFr: string;
  answerEn: string;
  answerAr: string;
  category: string;
  order: number;
}

// ─── Main Component ───────────────────────────────────────────
export function HomePage() {
  const { language, setCurrentView } = useAppStore();

  // ── Dynamic settings from DB ──
  const [LOGO_URL, setLogoUrl] = useState(DEFAULT_LOGO);
  const [AMINE_PHOTO_URL, setAminePhotoUrl] = useState('https://i.imgur.com/MrRODMe.png');
  const [YOUTUBE_URL, setYoutubeUrl] = useState(DEFAULT_YOUTUBE);
  const [LATEST_LIVE_URL, setLatestLiveUrl] = useState('');
  const [TELEGRAM_URL, setTelegramUrl] = useState(DEFAULT_TELEGRAM);
  const [CONTACT_EMAIL, setContactEmail] = useState('contact@chebbitrading.com');
  const [xmLinkFr, setXmLinkFr] = useState(DEFAULT_XM);
  const [xmLinkEn, setXmLinkEn] = useState(DEFAULT_XM);
  const [xmLinkAr, setXmLinkAr] = useState(DEFAULT_XM);
  const XM_LINK = language === 'en' ? xmLinkEn : language === 'ar' ? xmLinkAr : xmLinkFr;
  const [statYears, setStatYears] = useState('4+');
  const [statPerf, setStatPerf] = useState('+128%');
  const [statMembers, setStatMembers] = useState('1,920+');

  // ── Dynamic trade stats from DB ──
  const [tradeStats, setTradeStats] = useState({ totalTrades: 0, wins: 0, winRate: 0, totalPips: 0, activeMonths: 0 });

  // ── Dynamic testimonials & FAQs from DB ──
  const [dbTestimonials, setDbTestimonials] = useState<DbTestimonial[]>([]);
  const [dbFaqs, setDbFaqs] = useState(hardcodedFaqs);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // ── Fetch public data (settings + testimonials) ──
  useEffect(() => {
    fetch('/api/public/data')
      .then((r) => r.json())
      .then((json) => {
        if (json.settings) {
          const s = json.settings;
          if (s.LOGO_URL) setLogoUrl(s.LOGO_URL);
          if (s.AMINE_PHOTO_URL) setAminePhotoUrl(s.AMINE_PHOTO_URL);
          if (s.YOUTUBE_URL) setYoutubeUrl(s.YOUTUBE_URL);
          if (s.TELEGRAM_URL) setTelegramUrl(s.TELEGRAM_URL);
          if (s.LATEST_LIVE_URL) setLatestLiveUrl(s.LATEST_LIVE_URL);
          if (s.EMAIL) setContactEmail(s.EMAIL);
          if (s.XM_LINK_FR) setXmLinkFr(s.XM_LINK_FR);
          if (s.XM_LINK_EN) setXmLinkEn(s.XM_LINK_EN);
          if (s.XM_LINK_AR) setXmLinkAr(s.XM_LINK_AR);
          // Fallback for old single-key format
          if (!s.XM_LINK_FR && s.XM_LINK) setXmLinkFr(s.XM_LINK);
          if (!s.XM_LINK_EN && s.XM_LINK) setXmLinkEn(s.XM_LINK);
          if (!s.XM_LINK_AR && s.XM_LINK) setXmLinkAr(s.XM_LINK);

          if (s.STAT_YEARS) setStatYears(s.STAT_YEARS);
          if (s.STAT_PERFORMANCE) setStatPerf(s.STAT_PERFORMANCE);
          if (s.STAT_MEMBERS) setStatMembers(s.STAT_MEMBERS);
        }
        if (json.testimonials) setDbTestimonials(json.testimonials);
        if (json.tradeStats) setTradeStats(json.tradeStats);
      })
      .catch(() => { });
  }, []);


  // ── Registration form state ──
  const [regEmail, setRegEmail] = useState('');
  const [regXmId, setRegXmId] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofBase64, setProofBase64] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setRegError(language === 'ar' ? 'نوع الملف غير مدعوم. JPG أو PNG فقط.' : language === 'en' ? 'Invalid file type. JPG or PNG only.' : 'Type de fichier invalide. JPG ou PNG uniquement.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setRegError(language === 'ar' ? 'الملف كبير جداً. الحد الأقصى 5 ميجابايت.' : language === 'en' ? 'File too large. Max 5MB.' : 'Fichier trop volumineux. Max 5MB.');
      return;
    }
    setProofFile(file);
    setRegError('');

    // Convert to base64 (will be sent to n8n via webhook)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1] || result;
      setProofBase64(base64);
    };
    reader.readAsDataURL(file);
  }, [language]);

  const handleRegister = useCallback(async () => {
    if (!regEmail.trim() || !regXmId.trim()) {
      setRegError(t('home.reg.required', language));
      return;
    }
    setRegError('');
    setRegSuccess('');
    setRegSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `XM User ${regXmId.trim()}`,
          email: regEmail.trim(),
          xmId: regXmId.trim(),
          language,
          proofBase64: proofBase64 || null,
          proofFilename: proofFile?.name || null,
        }),
      });
      const json = await res.json();
      if (res.status === 409) {
        setRegError(t('home.reg.duplicate', language));
      } else if (!res.ok) {
        const waitNote =
          language === 'ar' ? '\n\nملاحظة: إذا قمت بالتسجيل مؤخرًا، يُرجى الانتظار لمدة 3 دقائق ثم إعادة المحاولة.' :
            language === 'en' ? '\n\nNote: If you have just registered, please wait 3 minutes and try again.' :
              '\n\nRemarque : Si vous venez de vous inscrire, veuillez patienter 3 minutes puis réessayer.';

        if (json.error === "not_affiliate") {
          setRegError(
            (language === 'ar' ? 'حساب XM الخاص بك غير مسجل عبر رابط الإحالة الخاص بنا.' :
              language === 'en' ? 'Your XM account is not registered under our affiliate link.' :
                "Votre identifiant n'est pas enregistré via notre lien") + waitNote
          );
        } else {
          setRegError((json.error || t('home.reg.error', language)) + waitNote);
        }
      } else {
        setRegSuccess(t('home.reg.success', language));
        setRegEmail('');
        setRegXmId('');
        setProofFile(null);
        setProofBase64('');
      }
    } catch {
      setRegError(t('home.reg.error', language));
    } finally {
      setRegSubmitting(false);
    }
  }, [regEmail, regXmId, proofBase64, proofFile, language]);

  const handleNav = (view: 'results' | 'blog' | 'home') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-36 pb-16 overflow-hidden">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-ct-xm/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 w-full relative z-10">
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
                  <Zap size={14} className="fill-primary text-primary" />
                  {t('hero.badge', language)}
                </Badge>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6"
              >
                <span className="block">{t('hero.title.1', language)}</span>
                <span className="block text-gradient-green">{t('hero.title.2', language)}</span>
                <span className="block">{t('hero.title.3', language)}</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg"
              >
                {t('hero.subtitle', language)}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-wrap gap-4 mb-8">
                <a
                  href={XM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ct-xm text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ct-xm/40 active:translate-y-0"
                >
                  {t('hero.cta.xm', language)}
                  <ArrowRight size={16} />
                </a>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-background border border-border text-foreground px-6 py-3.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 dark:hover:border-primary/50 active:translate-y-0"
                >
                  <Youtube size={18} />
                  {t('hero.cta.yt', language)}
                </a>
              </motion.div>

              {/* Social links */}
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex items-center gap-4">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <MessageCircle size={18} />
                  <span className="hidden sm:inline">Telegram</span>
                </a>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-ct-red transition-colors text-sm"
                >
                  <Youtube size={18} />
                  <span className="hidden sm:inline">YouTube</span>
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-ct-blue transition-colors text-sm"
                >
                  <Mail size={18} />
                  <span className="hidden sm:inline">Email</span>
                </a>
              </motion.div>
            </motion.div>

            {/* ── Right: XM Registration Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
            >
              {/* Profile photo with green border + online pulse */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-primary overflow-hidden bg-[#06090f] p-1 flex items-center justify-center">
                    <img src={LOGO_URL} alt="Chebbi Trading" className="w-[200%] h-[200%] object-contain max-w-none" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background z-10">
                    <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                  </span>
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Chebbi Trading</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs text-primary font-semibold">{t('home.live', language)}</span>
                  </div>
                </div>
              </div>

              {/* XM Card */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-primary/5">
                {/* Gradient top border */}
                <div className="h-1 bg-gradient-to-r from-primary via-primary to-ct-green-light" />

                <div className="p-6">
                  {/* XM Logo */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-ct-xm rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-ct-xm/30">
                      XM
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{t('home.xm.title', language)}</p>
                      <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('home.xm.subtitle', language) }} />
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('home.xm.step1', language)}</p>
                        <p className="text-xs text-muted-foreground">{t('home.xm.step1.desc', language)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('home.xm.step2', language)}</p>
                        <p className="text-xs text-muted-foreground">{t('home.xm.step2.desc', language)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t('home.xm.step3', language)}</p>
                        <p className="text-xs text-muted-foreground">{t('home.xm.step3.desc', language)}</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={XM_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-ct-xm text-white py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ct-xm/40 active:translate-y-0"
                  >
                    {t('hero.cta.xm', language)}
                    <ArrowRight size={16} />
                  </a>

                  <p className="text-center text-xs text-muted-foreground mt-3">
                    🎁 {t('home.xm.free', language)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: STATS
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5">
          <SectionReveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[
                { value: statYears, label: t('hero.stat1', language), icon: '🏆' },
                { value: statPerf, label: t('hero.stat2', language), icon: '📈' },
                { value: statMembers, label: t('hero.stat3', language), icon: '👥' },
                { value: '100%', label: t('hero.stat4', language), icon: '🎁' },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="group bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-default"
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <p className="text-3xl lg:text-4xl font-extrabold text-gradient-green mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </Card>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2.5: AMINE CHEBBI PRESENTATION
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5">
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Photo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className="w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] lg:w-[340px] lg:h-[340px] rounded-[2rem] overflow-hidden border-[3px] border-primary/40 shadow-2xl shadow-primary/10"
                    style={{ boxShadow: '0 0 60px rgba(16,185,129,0.15), 0 0 120px rgba(16,185,129,0.05)' }}
                  >
                    <img
                      src={AMINE_PHOTO_URL}
                      alt="Amine Chebbi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Glow ring */}
                  <div className="absolute -inset-3 rounded-[2.4rem] border border-primary/10 pointer-events-none" />
                  <div className="absolute -inset-6 rounded-[2.8rem] border border-primary/5 pointer-events-none" />
                </div>
              </div>

              {/* Text */}
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 text-sm">
                  {t('home.trader.title', language)}
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2">
                  {t('pres.name', language)}
                </h2>
                <p className="text-primary font-semibold mb-5">
                  {t('pres.role', language)}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  {t('pres.bio', language)}
                </p>

                {/* Highlight chips */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🏆', text: t('pres.since', language) },
                    { icon: '📡', text: t('pres.live', language) },
                    { icon: '👥', text: t('pres.community', language) },
                    { icon: '✅', text: t('pres.verified', language) },
                  ].map((chip) => (
                    <div
                      key={chip.text}
                      className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-3 text-sm"
                    >
                      <span className="text-lg">{chip.icon}</span>
                      <span className="text-foreground font-medium">{chip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: JOIN STEPS AND REGISTRATION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 lg:py-24 bg-card/10 z-10 overflow-hidden">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="max-w-[1100px] mx-auto px-5">
          <SectionHeading
            badge={t('hero.badge', language)}
            title={t('join.title', language)}
            subtitle={t('join.subtitle', language)}
          />

          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(auto,_420px)_1fr] gap-10 md:gap-14 relative w-full items-start mt-12">
              {/* Decorative line behind steps (desktop only) */}
              <div className="hidden lg:block absolute top-[28px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-ct-red/40 via-primary/40 to-ct-gold/40 pointer-events-none" />

              {/* STEP 1: Ouvrir un compte */}
              <div className="flex flex-col items-center text-center group relative z-10">
                <div className="relative mb-8 mx-auto">
                  <div className="w-14 h-14 rounded-full bg-ct-red/10 border border-ct-red/30 flex items-center justify-center group-hover:bg-ct-red/20 transition-all duration-300">
                    <UserPlus size={20} className="text-ct-red" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ct-red flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10">
                    1
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{t('join.step1.title', language)}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 max-w-[240px]">
                  {t('join.step1.desc', language)}
                </p>
                <a
                  href={XM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ct-red hover:bg-ct-red/90 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:-translate-y-0.5"
                >
                  <ExternalLink size={16} /> {t('join.step1.btn', language)}
                </a>
              </div>

              {/* STEP 2: Formulaire */}
              <div className="flex flex-col items-center text-center group relative z-10 w-full mx-auto">
                <div className="relative mb-8 mx-auto">
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                    <Send size={20} className="text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[#06090f] text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)] z-10">
                    2
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{t('join.step2.title', language)}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 max-w-[280px]">
                  {t('join.step2.desc', language)}
                </p>

                {/* The Form embedded inside Step 2 */}
                <Card className="w-full bg-[#111827] border border-primary/20 rounded-[20px] overflow-hidden shadow-2xl">
                  {/* Subtle top indicator */}

                  <div className="p-6 md:p-7 text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1 rounded-md bg-primary/10 border border-primary/20 flex shrink-0">
                        <MessageCircle size={14} className="text-primary" />
                      </div>
                      <h4 className="font-bold text-[15px] text-white tracking-wide">
                        {t('home.reg.form.title', language)}
                      </h4>
                    </div>
                    <p className="text-[12px] text-slate-400 mb-6 leading-relaxed">
                      {t('home.reg.form.desc', language)}
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-xmid" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          {t('home.reg.form.xmid', language)} *
                        </Label>
                        <Input
                          id="reg-xmid"
                          type="text"
                          value={regXmId}
                          onChange={(e) => setRegXmId(e.target.value)}
                          placeholder={t('home.reg.xmId.placeholder', language)}
                          className="bg-[#0b1018] border-slate-800/60 focus:border-primary/50 rounded-xl px-4 py-5 text-sm placeholder:text-slate-500 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          {t('home.reg.form.email', language)} *
                        </Label>
                        <Input
                          id="reg-email"
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder={language === 'ar' ? 'بريدك@الإلكتروني.com' : 'your@email.com'}
                          className="bg-[#0b1018] border-slate-800/60 focus:border-primary/50 rounded-xl px-4 py-5 text-sm placeholder:text-slate-500 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          {t('home.reg.form.screenshot', language)}
                        </Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileSelect(f);
                          }}
                        />
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const f = e.dataTransfer.files?.[0];
                            if (f) handleFileSelect(f);
                          }}
                          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 cursor-pointer transition-colors ${proofFile
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-slate-800 hover:border-primary/30 bg-[#0b1018] hover:bg-slate-900/50'
                            }`}
                        >
                          {proofFile ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2 size={24} className="text-primary mb-1" />
                              <span className="text-xs font-semibold text-primary">{t('home.reg.proof.uploaded', language)}</span>
                              <span className="text-[10px] text-muted-foreground truncate w-full max-w-[200px] text-center mt-1">{proofFile.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload size={20} className="text-slate-400 mb-2" />
                              <span className="text-xs font-medium text-slate-400">
                                {t('home.reg.form.upload', language)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {regSuccess && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                          <CheckCircle2 size={16} className="text-primary shrink-0" />
                          <p className="text-sm text-primary font-medium">{regSuccess}</p>
                        </div>
                      )}

                      {regError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-ct-red/10 border border-ct-red/20">
                          <CircleDot size={16} className="text-ct-red shrink-0 mt-0.5" />
                          <p className="text-sm text-ct-red font-medium whitespace-pre-line">{regError}</p>
                        </div>
                      )}

                      <Button
                        onClick={handleRegister}
                        disabled={regSubmitting}
                        className="w-full h-12 bg-slate-800/80 border border-slate-700/50 hover:bg-slate-800 hover:border-primary/50 text-slate-300 hover:text-white transition-all shadow-none mt-2 font-semibold rounded-xl"
                      >
                        {regSubmitting ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            {t('home.reg.submitting', language)}
                          </>
                        ) : (
                          t('home.reg.form.verify', language)
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* STEP 3: Accès immédiat */}
              <div className="flex flex-col items-center text-center group relative z-10 pt-4 lg:pt-0">
                <div className="relative mb-8 mx-auto">
                  <div className="w-14 h-14 rounded-full bg-ct-gold/10 border border-ct-gold/30 flex items-center justify-center group-hover:bg-ct-gold/20 transition-all duration-300">
                    <ShieldCheck size={20} className="text-ct-gold" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ct-gold flex items-center justify-center text-[#06090f] text-[10px] font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)] z-10">
                    3
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{t('join.step3.title', language)}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 max-w-[240px]">
                  {t('join.step3.desc', language)}
                </p>
                <div
                  className="inline-flex items-center gap-2 bg-primary/20 text-primary px-8 py-2.5 rounded-lg text-sm font-bold cursor-default"
                >
                  <CheckCircle2 size={16} /> {t('join.step3.badge', language)}
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: ADVANTAGES
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading
            badge={language === 'ar' ? '🏆 المزايا' : language === 'en' ? '🏆 Top Features' : '🏆 Avantages'}
            title={t('adv.title', language)}
            subtitle={t('adv.subtitle', language)}
          />

          <SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1: Free Signals */}
              <Card className="group bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                  <Gift size={26} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('adv.free.title', language)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('adv.free.desc', language)}</p>
              </Card>

              {/* Card 2: Live YouTube */}
              <Card className="group bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-ct-blue/10 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-ct-blue/10 border border-ct-blue/20 flex items-center justify-center mb-5 group-hover:bg-ct-blue/20 group-hover:border-ct-blue/40 group-hover:shadow-lg group-hover:shadow-ct-blue/20 transition-all duration-300">
                  <Youtube size={26} className="text-ct-blue" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('adv.live.title', language)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('adv.live.desc', language)}</p>
              </Card>

              {/* Card 3: Risk Management */}
              <Card className="group bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-ct-purple/10 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-ct-purple/10 border border-ct-purple/20 flex items-center justify-center mb-5 group-hover:bg-ct-purple/20 group-hover:border-ct-purple/40 group-hover:shadow-lg group-hover:shadow-ct-purple/20 transition-all duration-300">
                  <ShieldCheck size={26} className="text-ct-purple" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('adv.risk.title', language)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('adv.risk.desc', language)}</p>
              </Card>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: RESULTS PREVIEW
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading
            badge={language === 'ar' ? '📊 النتائج' : language === 'en' ? '📊 Results' : '📊 Résultats'}
            title={t('res.preview.title', language)}
            titleGradient={t('res.preview.subtitle', language).split(',')[0]}
            subtitle={t('res.preview.subtitle', language)}
          />

          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left: Performance Bars */}
              <Card className="bg-card border border-border rounded-2xl p-6 lg:p-8">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  {t('home.annual', language)}
                </h3>
                <div className="space-y-5">
                  {[
                    { year: '2023', value: 62.18, color: 'bg-primary' },
                    { year: '2024', value: 42.85, color: 'bg-ct-blue' },
                    { year: '2025', value: 128, color: 'bg-ct-gold' },
                    { year: '2026', value: 17.3, color: 'bg-ct-purple' },
                  ].map((item) => (
                    <div key={item.year}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-foreground">{item.year}</span>
                        <span className={`text-sm font-bold ${item.year === '2025' ? 'text-ct-gold' : item.year === '2026' ? 'text-ct-purple' : 'text-primary'}`}>
                          +{item.value}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min((item.value / 128) * 100, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: t('res.winrate', language), value: tradeStats.totalTrades > 0 ? `~${tradeStats.winRate}%` : '~70%' },
                    { label: t('res.trades', language), value: tradeStats.totalTrades > 0 ? `${tradeStats.totalTrades.toLocaleString()}+` : '0' },
                    { label: t('res.pips', language), value: tradeStats.totalPips > 0 ? `${tradeStats.totalPips.toLocaleString()}+` : '0' },
                    { label: t('res.months', language), value: tradeStats.activeMonths > 0 ? `${tradeStats.activeMonths}` : '0' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 bg-secondary/50 rounded-xl">
                      <p className="text-lg font-extrabold text-gradient-green">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Right: YouTube Embed Placeholder */}
              <div className="space-y-4">
                <a
                  href={LATEST_LIVE_URL || YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative rounded-2xl overflow-hidden border border-border shadow-xl group cursor-pointer block"
                >
                  {/* YouTube thumbnail — real image from video ID */}
                  <div className="aspect-video bg-secondary flex items-center justify-center relative">
                    {(() => {
                      // Extract video ID from various YouTube URL formats
                      const url = LATEST_LIVE_URL || YOUTUBE_URL;
                      let vid = '';
                      try {
                        const u = new URL(url);
                        if (u.hostname === 'youtu.be') {
                          vid = u.pathname.slice(1);
                        } else if (u.pathname.startsWith('/live/')) {
                          vid = u.pathname.split('/live/')[1]?.split(/[?&#]/)[0] || '';
                        } else if (u.pathname.startsWith('/embed/')) {
                          vid = u.pathname.split('/embed/')[1]?.split(/[?&#]/)[0] || '';
                        } else if (u.searchParams.get('v')) {
                          vid = u.searchParams.get('v') || '';
                        }
                      } catch { /* not a valid URL, no thumbnail */ }

                      return vid ? (
                        <img
                          src={`https://img.youtube.com/vi/${vid}/maxresdefault.jpg`}
                          alt="Chebbi Trading Live"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            // Fallback to hqdefault if maxres doesn't exist
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
                          }}
                        />
                      ) : null;
                    })()}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <div className="w-20 h-20 rounded-full bg-ct-red/90 flex items-center justify-center shadow-2xl shadow-ct-red/40 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-background/90 glass px-3 py-1.5 rounded-lg z-10">
                      <p className="text-xs font-bold text-foreground">Chebbi Trading Live</p>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-ct-red text-white px-2.5 py-1 rounded-md z-10">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs font-bold">LIVE</span>
                    </div>
                  </div>
                </a>

                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-ct-red/10 border border-ct-red/20 text-ct-red py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-ct-red/20 hover:border-ct-red/40 hover:-translate-y-0.5"
                >
                  <Youtube size={18} />
                  {t('home.youtube.subscribe', language)}
                  <ExternalLink size={14} />
                </a>

                <Button
                  variant="outline"
                  className="w-full py-3.5"
                  onClick={() => handleNav('results')}
                >
                  <BarChart3 size={18} className="mr-2" />
                  {t('home.results.detail', language)}
                </Button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: XM CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5">
          <SectionReveal>
            <div className="relative rounded-3xl overflow-hidden border border-border">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-ct-xm/5 dark:from-background dark:via-background dark:to-ct-xm/10" />
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

              <div className="relative z-10 p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  {/* Left: Text */}
                  <div>
                    <Badge className="bg-ct-xm/10 text-ct-xm border-ct-xm/20 px-4 py-1.5 text-sm font-semibold mb-4">
                      {t('hero.badge', language)}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                      {t('xm.cta.title', language)}
                    </h2>
                    <p className="text-muted-foreground text-base leading-relaxed mb-8">
                      {t('xm.cta.desc', language)}
                    </p>

                    {/* Benefits list */}
                    <div className="space-y-3 mb-8">
                      {[
                        t('xm.benefit1', language),
                        t('xm.benefit2', language),
                        t('xm.benefit3', language),
                        t('xm.benefit4', language),
                        t('home.support', language),
                      ].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-primary shrink-0" />
                          <span className="text-sm text-foreground font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={XM_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-ct-xm text-white px-8 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ct-xm/40 active:translate-y-0"
                    >
                      {t('xm.cta.btn', language)}
                      <ArrowRight size={18} />
                    </a>
                  </div>

                  {/* Right: Profile card */}
                  <div className="flex justify-center lg:justify-end">
                    <Card className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl shadow-primary/5">
                      <div className="w-24 h-24 rounded-full border-[3px] border-primary overflow-hidden mx-auto mb-4 relative bg-[#06090f] flex items-center justify-center p-1">
                        <img src={LOGO_URL} alt="Chebbi Trading" className="w-full h-full object-contain scale-[3]" />
                        <span className="absolute bottom-1 right-1 w-4 h-4 bg-primary rounded-full border-2 border-[#06090f] z-10">
                          <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-foreground mb-1">Chebbi Trading</h3>
                      <p className="text-sm text-primary font-semibold mb-4">{t('home.trader.title', language)}</p>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-extrabold text-gradient-green">{statYears || '4+'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('home.years', language)}</p>
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-gradient-green">{tradeStats.winRate > 0 ? `${tradeStats.winRate.toFixed(1)}%` : '~70%'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Win Rate</p>
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-gradient-green">{statMembers || '1.9K+'}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Membres</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 8: TESTIMONIALS
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading
            badge={language === 'ar' ? '⭐ شهادات' : language === 'en' ? '⭐ Testimonials' : '⭐ Témoignages'}
            title={language === 'ar' ? 'ماذا يقول' : language === 'en' ? 'What our' : 'Ce que disent nos'}
            titleGradient={language === 'ar' ? 'أعضاؤنا' : language === 'en' ? 'members say' : 'membres'}
            subtitle={language === 'ar' ? 'نتائج حقيقية، أعضاء راضون' : language === 'en' ? 'Real results, satisfied members' : 'Des résultats réels, des membres satisfaits'}
          />

          <SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* DB testimonials */}
              {dbTestimonials.length > 0 ? (
                dbTestimonials.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-0.5 mb-4">
                      {Array.from({ length: item.stars }).map((_, i) => (
                        <Star key={i} size={16} className="text-ct-gold fill-ct-gold" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic mb-6">
                      &ldquo;{pickLang(item, 'text', language)}&rdquo;
                    </p>
                    <Separator className="mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{pickLang(item, 'title', language)}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                /* Static fallback testimonials */
                [
                  { initials: 'AK', name: t('test.1.name', language), quote: t('test.1.quote', language), duration: t('test.1.duration', language), gradient: 'from-primary to-ct-blue', stars: 5 },
                  { initials: 'SB', name: t('test.2.name', language), quote: t('test.2.quote', language), duration: t('test.2.duration', language), gradient: 'from-ct-gold to-ct-red', stars: 5 },
                  { initials: 'MH', name: t('test.3.name', language), quote: t('test.3.quote', language), duration: t('test.3.duration', language), gradient: 'from-ct-purple to-ct-blue', stars: 4.5 },
                ].map((item) => (
                  <Card
                    key={item.initials}
                    className="bg-card border border-border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-0.5 mb-4">
                      {Array.from({ length: Math.floor(item.stars) }).map((_, i) => (
                        <Star key={i} size={16} className="text-ct-gold fill-ct-gold" />
                      ))}
                      {item.stars % 1 !== 0 && <Star size={16} className="text-ct-gold fill-ct-gold/50" />}
                    </div>
                    <div className="border-l-2 border-primary/30 pl-4 mb-6">
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>
                    <Separator className="mb-4" />
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-xs`}>
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.duration}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8.5: XM MID-PAGE CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-ct-red/5 via-background to-primary/5 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ct-red to-primary" />

        <div className="max-w-7xl mx-auto px-5 relative z-10">
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Left: Headline + Benefits */}
              <div>
                <Badge className="bg-ct-red/10 text-ct-red border-ct-red/20 mb-4 text-sm">
                  XM Global
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-2">
                  {t('xmcta.title', language)}{' '}
                  <span className="text-gradient-green">{t('xmcta.title.highlight', language)}</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {t('xmcta.subtitle', language)}
                </p>

                <div className="space-y-3">
                  {[
                    t('xmcta.b1', language),
                    t('xmcta.b2', language),
                    t('xmcta.b3', language),
                    t('xmcta.b4', language),
                    t('xmcta.b5', language),
                    t('xmcta.b6', language),
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} className="text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Profile Card */}
              <div className="flex justify-center">
                <Card className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-xl shadow-primary/5">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/30 bg-[#06090f] p-1 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(16,185,129,0.15)' }}>
                      <img src={LOGO_URL} alt="Chebbi Trading" className="w-full h-full object-contain scale-[2.5]" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{t('pres.name', language)}</h3>
                    <p className="text-sm text-muted-foreground">{t('xmcta.trader', language)}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <ShieldCheck size={14} className="text-primary" />
                      <span className="text-xs text-primary font-semibold">{t('xmcta.secure', language)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mb-6">
                    {t('xmcta.years', language)}
                  </p>

                  <div className="space-y-3">
                    <a href={XM_LINK} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="w-full bg-ct-red hover:bg-ct-red/90 text-white font-bold py-3 rounded-xl">
                        <ExternalLink size={16} className="mr-2" />
                        {t('xmcta.open', language)}
                      </Button>
                    </a>
                    <a href={XM_LINK} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/5 font-bold py-3 rounded-xl">
                        {t('xmcta.demo', language)}
                      </Button>
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 9: FAQ
          ═══════════════════════════════════════════════════════════ */}
      <section id="faq-section" className="py-16 lg:py-20 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-5">
          <SectionHeading
            badge={language === 'ar' ? '❓ أسئلة شائعة' : language === 'en' ? '❓ FAQ' : '❓ FAQ'}
            title={t('faq.title', language)}
            subtitle={t('faq.subtitle', language)}
          />

          <SectionReveal>
            <div className="w-full space-y-3">
              {dbFaqs.map(f => ({
                ...f,
                answerFr: f.answerFr?.replace(/\[TELEGRAM_URL\]/g, TELEGRAM_URL),
                answerEn: f.answerEn?.replace(/\[TELEGRAM_URL\]/g, TELEGRAM_URL),
                answerAr: f.answerAr?.replace(/\[TELEGRAM_URL\]/g, TELEGRAM_URL),
              })).map((faq, index) => (
                <FaqAccordionItem
                  key={faq.id}
                  faq={faq}
                  language={language}
                  isOpen={openFaqIndex === index}
                  onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                />
              ))}
            </div>
          </SectionReveal>

          {/* CTA: Didn't find your answer? */}
          <SectionReveal className="mt-10">
            <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-ct-blue/5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative p-6 md:p-8 text-center">
                <div className="text-3xl mb-3">🤔</div>
                <h3 className="text-lg md:text-xl font-extrabold text-foreground mb-2">
                  {t('faq.cta.title', language)}
                </h3>
                <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
                  {t('faq.cta.desc', language)}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 bg-ct-blue/15 border border-ct-blue/30 text-ct-blue hover:bg-ct-blue/25 hover:shadow-lg"
                  >
                    <Mail size={16} />
                    {t('faq.cta.telegram', language)}
                  </a>
                  <a
                    href={XM_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 bg-ct-xm text-white hover:shadow-lg hover:shadow-ct-xm/40"
                  >
                    <ArrowRight size={16} />
                    {t('faq.cta.xm', language)}
                  </a>
                </div>
              </div>
            </Card>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 10: CONTACT
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-16 lg:py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-5">
          <SectionHeading
            badge={language === 'ar' ? '💬 اتصل بنا' : language === 'en' ? '💬 Contact' : '💬 Contact'}
            title={t('cont.title', language)}
            subtitle={t('cont.subtitle', language)}
          />

          <SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Telegram */}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="bg-card border border-primary/20 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                    <MessageCircle size={26} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Telegram</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {t('cont.telegram.desc', language)}
                  </p>
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                    {t('cont.telegram', language)}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </a>

              {/* YouTube */}
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="bg-card border border-ct-red/20 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-ct-red/10 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-ct-red/10 border border-ct-red/20 flex items-center justify-center mb-5 group-hover:bg-ct-red/20 group-hover:border-ct-red/40 transition-all duration-300">
                    <Youtube size={26} className="text-ct-red" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">YouTube</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {t('cont.youtube.desc', language)}
                  </p>
                  <div className="flex items-center gap-2 text-ct-red text-sm font-semibold">
                    {t('cont.youtube', language)}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </a>

              {/* Email */}
              <a href={`mailto:${CONTACT_EMAIL}`} className="group">
                <Card className="bg-card border border-ct-blue/20 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-ct-blue/10 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-ct-blue/10 border border-ct-blue/20 flex items-center justify-center mb-5 group-hover:bg-ct-blue/20 group-hover:border-ct-blue/40 transition-all duration-300">
                    <Mail size={26} className="text-ct-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t('cont.email', language)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {CONTACT_EMAIL}
                  </p>
                  <div className="flex items-center gap-2 text-ct-blue text-sm font-semibold">
                    Envoyer un email
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 11: FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="mt-auto border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-5 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-10">
            {/* Column 1: Logo + Description */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-border bg-[#06090f] p-1">
                  <img src={LOGO_URL} alt="Chebbi Trading" className="w-full h-full object-contain scale-[3]" />
                </div>
                <span className="text-xl font-extrabold text-foreground">
                  Chebbi <em className="not-italic text-primary">Trading</em>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
                {t('hero.subtitle', language)}
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 hover:border-primary/40 transition-all"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-ct-red/10 border border-ct-red/20 flex items-center justify-center text-ct-red hover:bg-ct-red/20 hover:border-ct-red/40 transition-all"
                >
                  <Youtube size={16} />
                </a>
                <a
                  href="https://www.facebook.com/share/1DpJA1VmxB/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40 transition-all"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://www.instagram.com/aminechebbi7?igsh=Nnd2aDI0YjZlYmYx&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center text-[#E1306C] hover:bg-[#E1306C]/20 hover:border-[#E1306C]/40 transition-all"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.tiktok.com/@chebbitrading"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:border-white/40 transition-all"
                >
                  <TiktokIcon size={16} />
                </a>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="w-9 h-9 rounded-lg bg-ct-blue/10 border border-ct-blue/20 flex items-center justify-center text-ct-blue hover:bg-ct-blue/20 hover:border-ct-blue/40 transition-all"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Navigation</h4>
              <div className="space-y-2.5">
                {[
                  { label: t('nav.home', language), view: 'home' as const },
                  { label: t('nav.join', language), view: 'home' as const },
                  { label: t('nav.results', language), view: 'results' as const },
                  { label: t('nav.blog', language), view: 'blog' as const },
                  { label: t('nav.faq', language), view: 'home' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.view)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">
                {t('foot.resources', language)}
              </h4>
              <div className="space-y-2.5">
                <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  YouTube
                </a>
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Telegram
                </a>
                <a href={XM_LINK} target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('xmcta.open', language)}
                </a>
              </div>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Contact</h4>
              <div className="space-y-2.5">
                <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle size={14} /> @ChebbiTrading
                </a>
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={14} /> Email
                </a>
              </div>
            </div>
          </div>

          {/* Risk Disclaimer Banner */}
          <div className="rounded-xl bg-ct-red/5 border border-ct-red/15 px-5 py-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-ct-red/10 flex items-center justify-center shrink-0 mt-0.5">
                <Target size={16} className="text-ct-red" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ct-red mb-1">
                  {t('foot.risk', language)}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('risk.warn', language)}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar — copyright + legal */}
          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {t('foot.copy', language)}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hover:text-primary cursor-pointer transition-colors">{t('foot.privacy', language)}</span>
              <span>•</span>
              <span className="hover:text-primary cursor-pointer transition-colors">{t('foot.legal', language)}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
