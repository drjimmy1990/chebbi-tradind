'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bitcoin, TrendingUp, TrendingDown, Calendar, Shield, Wallet, Clock, ChartLine, GraduationCap, Send, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { Language } from '@/lib/i18n';

/* ================================================================
   TYPES
   ================================================================ */

interface CryptoMonthly {
  id: string;
  year: number;
  monthIndex: number;
  percentage: number;
}

/* ================================================================
   MONTH LABELS
   ================================================================ */

const MONTHS: Record<Language, string[]> = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

/* ================================================================
   TRILINGUAL TEXT
   ================================================================ */

function L(lang: Language, fr: React.ReactNode, en: React.ReactNode, ar: React.ReactNode): React.ReactNode {
  return lang === 'ar' ? ar : lang === 'en' ? en : fr;
}

/** String-only version for props that require plain strings (e.g. placeholder, key) */
function Ls(lang: Language, fr: string, en: string, ar: string): string {
  return lang === 'ar' ? ar : lang === 'en' ? en : fr;
}

/* ================================================================
   ANIMATION WRAPPER
   ================================================================ */

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   YEAR CARD COMPONENT
   ================================================================ */

function YearCard({ year, months, lang, isOngoing }: { year: string; months: CryptoMonthly[]; lang: Language; isOngoing: boolean }) {
  // Compound return: Π(1 + pct/100) - 1
  const yearTotal = useMemo(() => {
    if (months.length === 0) return 0;
    let compound = 1;
    for (const m of months) {
      compound *= (1 + m.percentage / 100);
    }
    return Math.round((compound - 1) * 10000) / 100;
  }, [months]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Year header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-amber-500/5 to-amber-400/0">
        <span className="font-extrabold text-base font-mono tracking-tight text-foreground">
          VIP Crypto {year}
        </span>
        {isOngoing ? (
          <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
            </span>
            {L(lang, 'En cours...', 'Ongoing...', 'جارٍ...')}
          </span>
        ) : (
          <span className={`text-sm font-bold font-mono ${yearTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {yearTotal >= 0 ? '+' : ''}{yearTotal.toFixed(2)}%
          </span>
        )}
      </div>

      {/* Monthly rows */}
      <div className="divide-y divide-white/[0.03]">
        {months.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
          >
            <span className="text-sm text-muted-foreground font-medium">
              {MONTHS[lang][m.monthIndex] || `Month ${m.monthIndex + 1}`}
            </span>
            <span
              className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-md ${
                m.percentage >= 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-red-400 bg-red-500/10'
              }`}
            >
              {m.percentage >= 0 ? '+' : ''}{m.percentage.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   INFO CARD COMPONENT
   ================================================================ */

function InfoCard({ icon, title, children, highlight, highlightType = 'gold' }: {
  icon: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  highlight?: React.ReactNode;
  highlightType?: 'gold' | 'red';
}) {
  return (
    <FadeIn>
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            {icon}
          </div>
          <h3 className="font-extrabold text-base text-foreground leading-snug">{title}</h3>
        </div>
        <div className="text-muted-foreground text-sm leading-relaxed space-y-2">{children}</div>
        {highlight && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm leading-relaxed border-l-[3px] rtl:border-l-0 rtl:border-r-[3px] ${
            highlightType === 'red'
              ? 'bg-red-500/[0.06] border-red-500 text-muted-foreground'
              : 'bg-amber-500/[0.06] border-amber-500 text-muted-foreground'
          }`}>
            <span dangerouslySetInnerHTML={{ __html: typeof highlight === 'string' ? highlight : '' }} />
          </div>
        )}
      </div>
    </FadeIn>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export function CryptoPage() {
  const { language } = useAppStore();
  const [data, setData] = useState<Record<string, CryptoMonthly[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crypto')
      .then(r => r.json())
      .then(json => {
        if (json.data) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute hero stats
  const heroStats = useMemo(() => {
    const years = Object.keys(data).sort();
    const results: { label: React.ReactNode; value: string }[] = [];

    for (const year of years) {
      const months = data[year];
      if (!months || months.length === 0) continue;
      let compound = 1;
      for (const m of months) {
        compound *= (1 + m.percentage / 100);
      }
      const total = Math.round((compound - 1) * 10000) / 100;
      results.push({
        label: Ls(language, `Total ${year}`, `Total ${year}`, `إجمالي ${year}`),
        value: `${total >= 0 ? '+' : ''}${total.toFixed(2)}%`,
      });
    }

    // Best month ever
    let bestMonth = 0;
    for (const months of Object.values(data)) {
      for (const m of months) {
        if (m.percentage > bestMonth) bestMonth = m.percentage;
      }
    }
    if (bestMonth > 0) {
      results.push({
        label: Ls(language, 'Meilleur mois', 'Best Month', 'أعلى شهر واحد'),
        value: `+${bestMonth.toFixed(2)}%`,
      });
    }

    if (years.length > 0) {
      const earliestYear = Math.min(...years.map(Number));
      results.push({
        label: Ls(language, 'Année de création', 'Founded', 'سنة التأسيس'),
        value: String(earliestYear),
      });
    } else {
      results.push({
        label: Ls(language, 'Année de création', 'Founded', 'سنة التأسيس'),
        value: '2022',
      });
    }

    return results;
  }, [data, language]);

  const currentYear = String(new Date().getFullYear());
  const sortedYears = Object.keys(data).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen">
      {/* ═══════════════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════════════ */}
      <section className="pt-32 pb-10 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-6">
              <Bitcoin size={16} />
              {L(language, 'Groupe VIP Exclusif', 'Exclusive VIP Group', 'مجموعة VIP حصرية')}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-5">
              <span className="text-foreground">
                {L(language, 'Groupe ', 'Group ', 'مجموعة ')}
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                VIP Crypto
              </span>
              <br />
              <span className="text-foreground text-3xl sm:text-4xl lg:text-5xl">
                {L(language,
                  'Résultats documentés depuis 2023',
                  'Documented results since 2023',
                  'بنتائج موثقة منذ 2023',
                )}
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              {L(language,
                'Avant de nous contacter pour rejoindre, lisez bien cette page — tout ce que vous devez savoir sur le groupe et notre méthode de travail.',
                'Before contacting us to join, read this page carefully — everything you need to know about the group and our working method.',
                'قبل التواصل معنا للانضمام، اقرأ هذه الصفحة جيداً — كل ما تحتاج معرفته عن المجموعة وطريقة العمل.',
              )}
            </p>
          </FadeIn>

          {/* Hero Stats */}
          <FadeIn delay={0.3}>
            <div className="flex justify-center gap-8 sm:gap-12 flex-wrap">
              {heroStats.map((stat) => (
                <div key={String(stat.label)} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          INTRO CARD
          ═══════════════════════════════════════════════════ */}
      <section className="px-5 pb-12">
        <FadeIn>
          <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-amber-500/[0.05] to-purple-500/[0.03] border border-amber-500/20 p-7 sm:p-9 text-foreground leading-loose text-[0.95rem]">
            <p>
              {L(language,
                <>Notre groupe a débuté en <strong className="text-amber-400">{sortedYears.length > 0 ? Math.min(...sortedYears.map(Number)) : '2022'}</strong> avec des résultats mixtes entre <strong className="text-amber-400">Spot</strong> et <strong className="text-amber-400">Future</strong>. Nous avons commencé à documenter les résultats à partir de <strong className="text-amber-400">mai 2023</strong> après avoir trouvé une méthode adaptée qui donne les mêmes résultats que vous tradez en Spot ou en Future.</>,
                <>Our group started in <strong className="text-amber-400">{sortedYears.length > 0 ? Math.min(...sortedYears.map(Number)) : '2022'}</strong> with mixed results between <strong className="text-amber-400">Spot</strong> and <strong className="text-amber-400">Future</strong>. We started documenting results from <strong className="text-amber-400">May 2023</strong> after finding a suitable method that gives the same results whether you trade Spot or Future.</>,
                <>مجموعتنا بدأت سنة <strong className="text-amber-400">{sortedYears.length > 0 ? Math.min(...sortedYears.map(Number)) : '2022'}</strong> وكانت النتائج مختلطة بين <strong className="text-amber-400">Spot</strong> و<strong className="text-amber-400">Future</strong>. بدأنا توثيق النتائج من <strong className="text-amber-400">مايو 2023</strong> بعد أن وجدنا طريقة مناسبة تجعل النتيجة نفسها سواء كان الشخص يتداول Spot أو Future.</>,
              )}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════════
          INFO CARDS (FAQ-style)
          ═══════════════════════════════════════════════════ */}
      <section className="px-5 pb-16">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
              {L(language,
                <>Que trouverez-vous <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">dans le groupe ?</span></>,
                <>What will you <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">find in the group?</span></>,
                <>ما الذي <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">ستجده</span> في المجموعة؟</>,
              )}
            </h2>
          </FadeIn>

          <div className="space-y-4">
            <InfoCard
              icon={<ChartLine size={18} />}
              title={L(language, 'Que contient le groupe ?', "What's inside the group?", 'ماذا يوجد داخل المجموعة؟')}
            >
              <ul className="space-y-1.5">
                <li className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong className="text-amber-400">{L(language, 'Analyse live 2 fois par semaine', 'Live analysis twice a week', 'تحليل لايف مرتين في الأسبوع')}</strong> {L(language, "avec possibilité d'analyser toute crypto de votre choix", 'with the option to analyze any crypto of your choice', 'مع إمكانية تحليل أي عملة تريدها')}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400">•</span>
                  <span><strong className="text-amber-400">{L(language, 'Trades prêts', 'Ready trades', 'صفقات جاهزة')}</strong> — {L(language, 'la plupart ont été discutés lors des lives', 'most have been discussed during live sessions', 'أغلبها يكون قد تمت مناقشته في اللايف مسبقاً')}</span>
                </li>
              </ul>
            </InfoCard>

            <InfoCard
              icon={<GraduationCap size={18} />}
              title={L(language, 'Je ne connais rien au trading, dois-je rejoindre ?', "I don't know anything about trading, should I join?", 'لا أعرف شيئاً في التداول، هل أدخل المجموعة؟')}
              highlight={L(language,
                '⚠️ <strong>Le groupe n\'est pas éducatif.</strong> Si vous êtes débutant, nous vous recommandons d\'apprendre les bases d\'abord.',
                '⚠️ <strong>The group is not educational.</strong> If you\'re a complete beginner, we recommend learning the basics first.',
                '⚠️ <strong>المجموعة ليست تعليمية.</strong> إذا كنت مبتدئاً تماماً، نوصيك بتعلم الأساسيات أولاً ثم الانضمام.',
              )}
              highlightType="red"
            >
              <p>{L(language,
                'Vous devez avoir des <strong class="text-amber-400">connaissances de base en trading</strong> et les types de trades avant de rejoindre.',
                'You should have <strong class="text-amber-400">basic trading knowledge</strong> and understand trade types before joining.',
                'يجب أن تكون لديك <strong class="text-amber-400">معرفة بأساسيات التداول</strong> وأنواع الصفقات قبل الانضمام.',
              )}</p>
            </InfoCard>

            <InfoCard
              icon={<Calendar size={18} />}
              title={L(language, 'Un mois suffit-il pour faire du profit ?', 'Is one month enough to make profit?', 'هل شهر واحد كافٍ لتحقيق أرباح؟')}
              highlight={L(language,
                '⏳ Nous recommandons <strong>au moins 3 mois</strong> pour voir les vrais résultats du groupe.',
                '⏳ We recommend <strong>at least 3 months</strong> to see the real results of the group.',
                '⏳ ننصح بـ <strong>3 أشهر على الأقل</strong> لتلتمس النتائج الحقيقية للمجموعة.',
              )}
            >
              <p>{L(language,
                'Un ou deux mois ne reflètent pas le pourcentage réel que nous atteindrons en fin d\'année. La chance peut jouer — vous pourriez rejoindre un mois perdant et partir.',
                'One or two months don\'t reflect the real percentage we\'ll achieve by year end. Luck can play a role — you might join during a losing month and leave.',
                'شهر أو شهران لا يعكسان النسبة الحقيقية التي سنحققها آخر السنة. الصدفة ممكن أن تحدث — قد تنضم في شهر خاسر وتغادر.',
              )}</p>
            </InfoCard>

            <InfoCard
              icon={<Wallet size={18} />}
              title={L(language, 'Mon compte est petit, dois-je rejoindre ?', 'My account is small, should I join?', 'حسابي صغير، هل أدخل المجموعة؟')}
              highlight={L(language,
                '🛡️ Nous travaillons avec un risque de <strong>1% - 2%</strong> par trade. Sortir de cette règle = gains plus grands mais pertes plus grandes aussi.',
                '🛡️ We work with <strong>1% - 2%</strong> risk per trade. Breaking this rule means bigger gains but also bigger losses.',
                '🛡️ نعمل بمخاطرة <strong>1% - 2%</strong> في كل صفقة. الخروج عن هذه القاعدة يعني مكاسب أكبر لكن خسائر أكبر أيضاً.',
              )}
            >
              <p>{L(language,
                'Les petits comptes ne conviennent pas car <strong class="text-amber-400">10% - 20% par mois</strong> représente un petit gain pour eux, ce qui peut les pousser à sortir de la gestion des risques.',
                'Small accounts don\'t suit the group because <strong class="text-amber-400">10% - 20% per month</strong> is a small gain for them, which may push them to break risk management rules.',
                'أصحاب الحسابات الصغيرة لا تناسبهم المجموعة، لأن <strong class="text-amber-400">10% - 20% شهرياً</strong> بالنسبة لهم ربح صغير مما قد يدفعهم للخروج عن إدارة المخاطر.',
              )}</p>
            </InfoCard>

            <InfoCard
              icon={<Clock size={18} />}
              title={L(language, 'Quand puis-je rejoindre ?', 'When can I join?', 'متى يمكنني الانضمام؟')}
              highlight={L(language,
                '⚠️ <strong>Impossible de rejoindre en milieu de mois</strong> — pour que tous les membres aient les mêmes résultats.',
                '⚠️ <strong>Cannot join mid-month</strong> — so all members have the same results.',
                '⚠️ <strong>لا يمكن الدخول في منتصف الشهر</strong> — حتى تكون نفس النتائج عند جميع الأعضاء.',
              )}
              highlightType="red"
            >
              <p dangerouslySetInnerHTML={{ __html: L(language,
                'Tout le monde est contacté <strong class="text-amber-400">le 28 de chaque mois</strong> pour rejoindre le mois suivant.',
                'Everyone is contacted on the <strong class="text-amber-400">28th of each month</strong> to join the next month.',
                'يتم التواصل مع الجميع <strong class="text-amber-400">يوم 28 من كل شهر</strong> للانضمام في الشهر الجديد.',
              ) as string }} />
            </InfoCard>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          RESULTS GRID
          ═══════════════════════════════════════════════════ */}
      <section className="px-5 pb-20">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
              {L(language,
                <>Résultats <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Documentés</span></>,
                <><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Documented</span> Results</>,
                <>النتائج <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">الموثقة</span></>,
              )}
            </h2>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sortedYears.length === 0 ? (
            <FadeIn>
              <p className="text-center text-muted-foreground py-12">
                {L(language, 'Aucun résultat disponible.', 'No results available.', 'لا توجد نتائج متاحة.')}
              </p>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedYears.map((year, i) => (
                <FadeIn key={year} delay={i * 0.1}>
                  <YearCard
                    year={year}
                    months={data[year]}
                    lang={language}
                    isOngoing={year === currentYear}
                  />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA CARD
          ═══════════════════════════════════════════════════ */}
      <section className="px-5 pb-24">
        <FadeIn>
          <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-amber-500/[0.06] to-purple-500/[0.04] border border-amber-500/25 p-8 sm:p-10 text-center">
            <div className="text-4xl mb-3">₿</div>
            <h2 className="text-2xl font-black text-foreground mb-2">
              {L(language,
                'Rejoignez le groupe VIP Crypto',
                'Join the VIP Crypto Group',
                'انضم إلى مجموعة VIP Crypto',
              )}
            </h2>
            <p className="text-muted-foreground text-sm mb-3">
              {L(language,
                'Laissez votre email et nous vous contacterons directement pour rejoindre.',
                'Leave your email and we\'ll contact you directly to join.',
                'ضع بريدك الإلكتروني وسيتم التواصل معك مباشرةً للانضمام.',
              )}
            </p>

            {/* Notice */}
            <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 px-5 py-3 mb-5 text-sm text-muted-foreground">
              <strong className="text-amber-400">📅 {L(language, 'Important :', 'Important:', 'مهم :')}</strong>{' '}
              <span dangerouslySetInnerHTML={{ __html: L(language,
                'Tout le monde est contacté le <strong>28 de chaque mois</strong>. Impossible de rejoindre en milieu de mois.',
                'Everyone is contacted on the <strong>28th of each month</strong>. Cannot join mid-month.',
                'يتم التواصل مع الجميع يوم <strong>28 من كل شهر</strong>. لا يمكن الدخول في منتصف الشهر.',
              ) as string }} />
            </div>

            {/* Email form */}
            <CryptoEmailForm language={language} />

            <p className="text-xs text-muted-foreground">
              {L(language,
                'Pour toute question, contactez-nous par email uniquement :',
                'For any questions, contact us by email only:',
                'لأي استفسارات، تواصل معنا عبر البريد فقط :',
              )}
              <br />
              <a href="mailto:Vipcrypto@chebbitrade.com" className="text-amber-400 font-bold hover:underline">
                Vipcrypto@chebbitrade.com
              </a>
            </p>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}

/* ================================================================
   CRYPTO EMAIL FORM
   ================================================================ */

function CryptoEmailForm({ language }: { language: Language }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/crypto-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (json.message === 'already_subscribed') {
        setStatus('duplicate');
      } else if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mb-5 rounded-xl bg-green-500/10 border border-green-500/30 px-5 py-4 text-center">
        <div className="text-2xl mb-1">✅</div>
        <p className="text-sm font-semibold text-green-400">
          {L(language,
            'Merci ! Vous serez contacté le 28 du mois.',
            'Thank you! You will be contacted on the 28th.',
            'شكراً! سيتم التواصل معك في يوم 28 من الشهر.',
          )}
        </p>
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div className="max-w-md mx-auto mb-5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-5 py-4 text-center">
        <div className="text-2xl mb-1">📧</div>
        <p className="text-sm font-semibold text-amber-400">
          {L(language,
            'Cet email est déjà inscrit. Vous serez contacté le 28.',
            'This email is already subscribed. You will be contacted on the 28th.',
            'هذا البريد مسجل بالفعل. سيتم التواصل معك في الموعد.',
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto mb-5 flex-wrap">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        placeholder={Ls(language, 'Votre email', 'Your email', 'بريدك الإلكتروني')}
        className="flex-1 min-w-[200px] bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-amber-500/50 transition-colors"
        required
        disabled={status === 'loading'}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-black font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Send size={14} />
        {status === 'loading'
          ? '...'
          : L(language, 'Envoyer', 'Send', 'إرسال')}
      </button>
      {status === 'error' && (
        <p className="w-full text-xs text-red-400 text-center mt-1">
          {L(language, 'Erreur, réessayez.', 'Error, please try again.', 'حدث خطأ، حاول مجدداً.')}
        </p>
      )}
    </form>
  );
}
