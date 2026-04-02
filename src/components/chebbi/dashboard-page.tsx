'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { t, type Language } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Member {
  id: string;
  name: string;
  email: string;
  xmId: string;
  date: string;
  status: 'pending' | 'active' | 'rejected';
  proofFile?: string;
}

interface Signal {
  id: string;
  instrument: string;
  direction: 'BUY' | 'SELL';
  entry: string;
  takeProfit: string;
  stopLoss: string;
  result?: string;
  date: string;
}

interface Article {
  id: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  category: string;
  catLabelFr?: string;
  catLabelEn?: string;
  catLabelAr?: string;
  date: string;
  readTime?: string;
  views: number;
  excerptFr?: string;
  excerptEn?: string;
  excerptAr?: string;
  contentFr?: string;
  contentEn?: string;
  contentAr?: string;
  emoji?: string;
}

interface Faq {
  id: string;
  questionFr: string;
  questionEn: string;
  questionAr: string;
  answerFr?: string;
  answerEn?: string;
  answerAr?: string;
  category: string;
  icon?: string;
  order?: number;
}

interface NavItemChild {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}

interface NavItemSection {
  section: string;
  items: NavItemChild[];
}

/* ------------------------------------------------------------------ */
/*  Toast helpers                                                      */
/* ------------------------------------------------------------------ */

function Toast({
  toast,
  onClose,
}: {
  toast: { message: string; type: 'success' | 'error' };
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl border-2 px-5 py-3 shadow-xl transition-all ${
        toast.type === 'success'
          ? 'border-green-500/60 bg-card text-green-400'
          : 'border-red-500/60 bg-card text-red-400'
      }`}
    >
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Performance bar component (handles positive & negative values)      */
/* ------------------------------------------------------------------ */

function PerfBar({ year, value, maxVal = 140 }: { year: string; value: number; maxVal?: number }) {
  const pct = Math.min((Math.abs(value) / maxVal) * 100, 100);
  const isPositive = value >= 0;
  const currentYear = String(new Date().getFullYear());
  const isOngoing = year === currentYear;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-sm font-medium text-muted-foreground font-mono">{year}</span>
      <div className="h-6 flex-1 rounded-md bg-muted/40 overflow-hidden">
        <div
          className={`h-full rounded-md transition-all duration-700 ${
            !isPositive
              ? 'bg-gradient-to-r from-red-500/80 to-red-400/60'
              : isOngoing
              ? 'bg-gradient-to-r from-green-500/60 to-green-400/40'
              : value >= 100
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : 'bg-gradient-to-r from-green-600/70 to-green-500/70'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-20 text-right text-sm font-semibold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? `+${value}%` : `${value}%`}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SidebarContent (extracted outside to avoid re-render lint warning)  */
/* ------------------------------------------------------------------ */

function SidebarContent({
  language,
  dashboardView,
  nav,
  pendingCount,
}: {
  language: Language;
  dashboardView: string;
  nav: (view: string) => void;
  pendingCount: number;
}) {
  const navItems: NavItemSection[] = [
    {
      section: 'PRINCIPAL',
      items: [
        { id: 'overview', label: t('dash.overview', language), icon: '📊' },
        {
          id: 'members',
          label: t('dash.members', language),
          icon: '👥',
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
        { id: 'signals', label: t('dash.signals', language), icon: '📡' },
        { id: 'pages', label: t('dash.pages', language), icon: '📄' },
      ],
    },
    {
      section: 'CONTENU',
      items: [
        { id: 'blog', label: t('dash.blog', language), icon: '✍️' },
        { id: 'results', label: t('dash.results', language), icon: '📈' },
        { id: 'faq', label: t('dash.faq', language), icon: '❓' },
        { id: 'trades', label: 'Trades', icon: '📋' },
        { id: 'crypto', label: 'Crypto VIP', icon: '₿' },
        { id: 'crypto-subs', label: 'E-mails VIP', icon: '📧' },
      ],
    },
    {
      section: 'CONFIG',
      items: [
        { id: 'settings', label: t('dash.settings', language), icon: '⚙️' },
        { id: 'affiliate', label: t('dash.affiliate', language), icon: '🔗' },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-sm font-bold text-white">
          CT
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">Chebbi Trading</div>
          <div className="text-xs text-muted-foreground">Admin Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((section) => (
          <div key={section.section} className="mb-5">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.section}
            </div>
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => nav(item.id)}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  dashboardView === item.id
                    ? 'border border-green-500/40 bg-green-500/10 text-green-400 font-medium'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className={`flex-1 truncate ${language === 'ar' ? 'text-right' : 'text-left'}`}>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-400">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">
            AC
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-foreground">Amine Chebbi</div>
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مدير' : language === 'en' ? 'Administrator' : 'Administrateur'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function DashboardPage() {
  const language = useAppStore((s) => s.language) as Language;

  /* ---- trilingual helper ---- */
  const L = useCallback(
    (ar: string, en: string, fr: string) => language === 'ar' ? ar : language === 'en' ? en : fr,
    [language]
  );

  /* ---- state ---- */
  const [dashboardView, setDashboardView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addSignalOpen, setAddSignalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState('');

  /* add-member form */
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberXmId, setNewMemberXmId] = useState('');

  /* add-signal form */
  const [newSignalInstrument, setNewSignalInstrument] = useState('');
  const [newSignalDirection, setNewSignalDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [newSignalEntry, setNewSignalEntry] = useState('');
  const [newSignalTP, setNewSignalTP] = useState('');
  const [newSignalSL, setNewSignalSL] = useState('');

  /* settings form */
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [xmLinkFr, setXmLinkFr] = useState('');
  const [xmLinkEn, setXmLinkEn] = useState('');
  const [xmLinkAr, setXmLinkAr] = useState('');
  const [webhookRegUrl, setWebhookRegUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'article' | 'faq' | 'member';
    id: string;
  } | null>(null);

  /* blog CRUD */
  const [addArticleOpen, setAddArticleOpen] = useState(false);
  const [editArticleOpen, setEditArticleOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('education');
  const [articleLanguage, setArticleLanguage] = useState('fr');
  const [articleEmoji, setArticleEmoji] = useState('📝');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleDate, setArticleDate] = useState('');
  const [articleReadTime, setArticleReadTime] = useState('5 min');

  /* faq CRUD */
  const [addFaqOpen, setAddFaqOpen] = useState(false);
  const [editFaqOpen, setEditFaqOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('gratuit');
  const [faqLanguage, setFaqLanguage] = useState('fr');
  const [faqOrder, setFaqOrder] = useState(0);

  /* ---- toast helper ---- */
  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  /* ---- fetch helpers ---- */
  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const json = await res.json();
        setMembers(Array.isArray(json) ? json : (json.data || []));
      }
    } catch {
      /* silent */
    }
  }, []);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch('/api/signals');
      if (res.ok) {
        const json = await res.json();
        setSignals(Array.isArray(json) ? json : (json.data || []));
      }
    } catch {
      /* silent */
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog?language=${language}`);
      if (res.ok) {
        const json = await res.json();
        setArticles(Array.isArray(json) ? json : (json.data || []));
      }
    } catch {
      /* silent */
    }
  }, [language]);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch(`/api/faq?language=${language}`);
      if (res.ok) {
        const json = await res.json();
        setFaqs(Array.isArray(json) ? json : (json.data || []));
      }
    } catch {
      /* silent */
    }
  }, [language]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        const map: Record<string, string> = json.data || {};
        setSettings(map);
        setSiteName(map.siteName || '');
        setContactEmail(map.EMAIL || map.contactEmail || '');
        setTelegramHandle(map.TELEGRAM_URL || map.telegramHandle || '');
        setYoutubeChannel(map.YOUTUBE_URL || map.youtubeChannel || '');
        setXmLinkFr(map.XM_LINK_FR || '');
        setXmLinkEn(map.XM_LINK_EN || '');
        setXmLinkAr(map.XM_LINK_AR || '');
        setWebhookRegUrl(map.webhookRegister || '');
        setWebhookSecret(map.webhookSecret || '');
      }
    } catch {
      /* silent */
    }
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/results');
      if (res.ok) {
        const json = await res.json();
        setResults(json.data || json);
      }
    } catch {
      /* silent */
    }
  }, []);

  /* initial load */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchMembers(),
        fetchSignals(),
        fetchArticles(),
        fetchFaqs(),
        fetchSettings(),
        fetchResults(),
      ]);
      setLoading(false);
    };
    init();
  }, [fetchMembers, fetchSignals, fetchArticles, fetchFaqs, fetchSettings, fetchResults]);

  /* ---- CRUD: Members ---- */
  const handleAddMember = async () => {
    if (!newMemberName.trim() || !newMemberEmail.trim() || !newMemberXmId.trim()) {
      showToast(
        L('يرجى ملء جميع الحقول', 'Please fill in all fields', 'Veuillez remplir tous les champs'),
        'error'
      );
      return;
    }
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName,
          email: newMemberEmail,
          xmId: newMemberXmId,
        }),
      });
      if (res.ok) {
        showToast(L('تم إضافة العضو بنجاح', 'Member added successfully', 'Membre ajouté avec succès'));
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberXmId('');
        setAddMemberOpen(false);
        fetchMembers();
      } else {
        showToast(
          L('خطأ أثناء إضافة العضو', 'Error adding member', "Erreur lors de l'ajout du membre"),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  const handleUpdateMemberStatus = async (id: string, status: 'active' | 'rejected') => {
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showToast(
          status === 'active'
            ? L('تم قبول العضو', 'Member approved', 'Membre approuvé')
            : L('تم رفض العضو', 'Member rejected', 'Membre rejeté'),
          status === 'active' ? 'success' : 'error'
        );
        fetchMembers();
      } else {
        showToast(
          L('خطأ أثناء التحديث', 'Error updating', 'Erreur lors de la mise à jour'),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  /* ---- CRUD: Signals ---- */
  const handleAddSignal = async () => {
    if (!newSignalInstrument.trim() || !newSignalEntry.trim()) {
      showToast(
        L('يرجى ملء الحقول المطلوبة', 'Please fill in required fields', 'Veuillez remplir les champs obligatoires'),
        'error'
      );
      return;
    }
    try {
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instrument: newSignalInstrument,
          direction: newSignalDirection,
          entry: newSignalEntry,
          takeProfit: newSignalTP,
          stopLoss: newSignalSL,
        }),
      });
      if (res.ok) {
        showToast(L('تم نشر الإشارة بنجاح', 'Signal published successfully', 'Signal publié avec succès'));
        setNewSignalInstrument('');
        setNewSignalDirection('BUY');
        setNewSignalEntry('');
        setNewSignalTP('');
        setNewSignalSL('');
        setAddSignalOpen(false);
        fetchSignals();
      } else {
        showToast(
          L('خطأ أثناء النشر', 'Error publishing', 'Erreur lors de la publication'),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  /* ---- CRUD: Delete ---- */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      let endpoint = `/api/faq`;
      if (deleteTarget.type === 'article') endpoint = `/api/blog`;
      else if (deleteTarget.type === 'member') endpoint = `/api/members`;

      const res = await fetch(`${endpoint}?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(L('تم الحذف بنجاح', 'Deleted successfully', 'Supprimé avec succès'));
        if (deleteTarget.type === 'article') fetchArticles();
        else if (deleteTarget.type === 'member') fetchMembers();
        else fetchFaqs();
      } else {
        showToast(
          L('خطأ أثناء الحذف', 'Error deleting', 'Erreur lors de la suppression'),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
    setDeleteTarget(null);
  };

  /* ---- category defaults helper ---- */
  const getBlogCatDefaults = (cat: string) => {
    switch (cat) {
      case 'gold': return { catLabel: 'Gold', catColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30', catText: '#f59e0b' };
      case 'education': return { catLabel: 'Éducation', catColor: 'bg-green-500/20 text-green-400 border-green-500/30', catText: '#22c55e' };
      case 'strategie': return { catLabel: 'Stratégie', catColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30', catText: '#a855f7' };
      case 'analyse': return { catLabel: 'Analyse', catColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30', catText: '#3b82f6' };
      default: return { catLabel: cat, catColor: 'bg-muted text-muted-foreground border-border', catText: '#888888' };
    }
  };

  /* ---- CRUD: Blog Articles ---- */
  const resetArticleForm = useCallback(() => {
    setArticleTitle('');
    setArticleCategory('education');
    setArticleLanguage('fr');
    setArticleEmoji('📝');
    setArticleExcerpt('');
    setArticleContent('');
    setArticleDate(new Date().toISOString().split('T')[0]);
    setArticleReadTime('5 min');
  }, []);

  const handleAddArticle = async () => {
    if (!articleTitle.trim()) {
      showToast(
        L('العنوان مطلوب', 'Title is required', 'Le titre est obligatoire'),
        'error'
      );
      return;
    }
    try {
      const catDefaults = getBlogCatDefaults(articleCategory);
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleFr: articleTitle,
          titleEn: articleTitle,
          titleAr: articleTitle,
          category: articleCategory,
          catLabelFr: catDefaults.catLabel,
          catLabelEn: catDefaults.catLabel,
          catLabelAr: catDefaults.catLabel,
          date: articleDate || new Date().toISOString().split('T')[0],
          readTime: articleReadTime || '5 min',
          excerptFr: articleExcerpt,
          excerptEn: articleExcerpt,
          excerptAr: articleExcerpt,
          contentFr: articleContent,
          contentEn: articleContent,
          contentAr: articleContent,
          emoji: articleEmoji,
          catColor: catDefaults.catColor,
          catText: catDefaults.catText,
        }),
      });
      if (res.ok) {
        showToast(L('تم إنشاء المقال بنجاح', 'Article created successfully', 'Article créé avec succès'));
        resetArticleForm();
        setAddArticleOpen(false);
        fetchArticles();
      } else {
        showToast(
          L('خطأ أثناء الإنشاء', 'Error creating article', "Erreur lors de la création de l'article"),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleTitle(language === 'ar' ? article.titleAr : language === 'en' ? article.titleEn : article.titleFr);
    setArticleCategory(article.category || 'education');
    setArticleEmoji(article.emoji || '📝');
    setArticleExcerpt(language === 'ar' ? (article.excerptAr || '') : language === 'en' ? (article.excerptEn || '') : (article.excerptFr || ''));
    setArticleContent(language === 'ar' ? (article.contentAr || '') : language === 'en' ? (article.contentEn || '') : (article.contentFr || ''));
    setArticleDate(article.date ? article.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setArticleReadTime(article.readTime || '5 min');
    setEditArticleOpen(true);
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle || !articleTitle.trim()) {
      showToast(
        L('العنوان مطلوب', 'Title is required', 'Le titre est obligatoire'),
        'error'
      );
      return;
    }
    try {
      const catDefaults = getBlogCatDefaults(articleCategory);
      const res = await fetch('/api/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingArticle.id,
          [`title${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]: articleTitle,
          category: articleCategory,
          [`catLabel${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]: catDefaults.catLabel,
          date: articleDate,
          readTime: articleReadTime,
          [`excerpt${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]: articleExcerpt,
          [`content${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]: articleContent,
          emoji: articleEmoji,
          catColor: catDefaults.catColor,
          catText: catDefaults.catText,
        }),
      });
      if (res.ok) {
        showToast(L('تم تحديث المقال', 'Article updated', 'Article mis à jour'));
        setEditArticleOpen(false);
        setEditingArticle(null);
        resetArticleForm();
        fetchArticles();
      } else {
        showToast(
          L('خطأ أثناء التحديث', 'Error updating', "Erreur lors de la mise à jour"),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  /* ---- CRUD: FAQ ---- */
  const resetFaqForm = useCallback(() => {
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('gratuit');
    setFaqLanguage('fr');
    setFaqOrder(0);
  }, []);

  const handleAddFaq = async () => {
    if (!faqQuestion.trim()) {
      showToast(
        L('السؤال مطلوب', 'Question is required', 'La question est obligatoire'),
        'error'
      );
      return;
    }
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionFr: faqQuestion,
          questionEn: faqQuestion,
          questionAr: faqQuestion,
          answerFr: faqAnswer,
          answerEn: faqAnswer,
          answerAr: faqAnswer,
          category: faqCategory,
          order: faqOrder,
        }),
      });
      if (res.ok) {
        showToast(L('تمت إضافة السؤال بنجاح', 'Question added successfully', 'Question ajoutée avec succès'));
        resetFaqForm();
        setAddFaqOpen(false);
        fetchFaqs();
      } else {
        showToast(
          L('خطأ أثناء الإضافة', 'Error adding', "Erreur lors de l'ajout"),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  const handleEditFaq = (faq: Faq) => {
    setEditingFaq(faq);
    setFaqQuestion(language === 'ar' ? faq.questionAr : language === 'en' ? faq.questionEn : faq.questionFr);
    setFaqAnswer(language === 'ar' ? (faq.answerAr || '') : language === 'en' ? (faq.answerEn || '') : (faq.answerFr || ''));
    setFaqCategory(faq.category || 'gratuit');
    setFaqOrder(faq.order || 0);
    setEditFaqOpen(true);
  };

  const handleUpdateFaq = async () => {
    if (!editingFaq || !faqQuestion.trim()) {
      showToast(
        L('السؤال مطلوب', 'Question is required', 'La question est obligatoire'),
        'error'
      );
      return;
    }
    try {
      const res = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFaq.id,
          [`question${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]: faqQuestion,
          [`answer${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]: faqAnswer,
          category: faqCategory,
          order: faqOrder,
        }),
      });
      if (res.ok) {
        showToast(L('تم تحديث السؤال', 'Question updated', 'Question mise à jour'));
        setEditFaqOpen(false);
        setEditingFaq(null);
        resetFaqForm();
        fetchFaqs();
      } else {
        showToast(
          L('خطأ أثناء التحديث', 'Error updating', "Erreur lors de la mise à jour"),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  /* ---- Settings save ---- */
  const handleSaveSettings = async () => {
    try {
      // Build telegram URL if user entered just a handle
      let tgValue = telegramHandle.trim();
      if (tgValue && !tgValue.startsWith('http')) {
        tgValue = tgValue.replace(/^@/, '');
        tgValue = `https://t.me/${tgValue}`;
      }
      const updates = [
        { key: 'siteName', value: siteName },
        { key: 'EMAIL', value: contactEmail },
        { key: 'TELEGRAM_URL', value: tgValue },
        { key: 'YOUTUBE_URL', value: youtubeChannel },
        { key: 'webhookRegister', value: webhookRegUrl },
        { key: 'webhookSecret', value: webhookSecret },
      ];
      await Promise.all(
        updates.map((u) =>
          fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u),
          })
        )
      );
      showToast(L('تم حفظ الإعدادات', 'Settings saved', 'Paramètres sauvegardés'));
      fetchSettings();
    } catch {
      showToast(
        L('خطأ أثناء الحفظ', 'Error saving', 'Erreur lors de la sauvegarde'),
        'error'
      );
    }
  };

  const handleApplyXmLinks = async () => {
    if (!xmLinkFr.trim() && !xmLinkEn.trim() && !xmLinkAr.trim()) {
      showToast(
        L('يرجى إدخال رابط واحد على الأقل', 'Please enter at least one XM link', 'Veuillez entrer au moins un lien XM'),
        'error'
      );
      return;
    }
    try {
      const updates = [
        { key: 'XM_LINK_FR', value: xmLinkFr.trim() },
        { key: 'XM_LINK_EN', value: xmLinkEn.trim() },
        { key: 'XM_LINK_AR', value: xmLinkAr.trim() },
      ];
      let allOk = true;
      for (const u of updates) {
        if (!u.value) continue;
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(u),
        });
        if (!res.ok) allOk = false;
      }
      if (allOk) {
        showToast(
          L('تم تحديث روابط XM بنجاح', 'XM links updated successfully', 'Liens XM mis à jour avec succès')
        );
        fetchSettings();
      } else {
        showToast(
          L('خطأ أثناء التحديث', 'Error updating', 'Erreur lors de la mise à jour'),
          'error'
        );
      }
    } catch {
      showToast(L('خطأ في الشبكة', 'Network error', 'Erreur réseau'), 'error');
    }
  };

  /* ---- computed ---- */
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const activeCount = members.filter((m) => m.status === 'active').length;

  const totalArticleViews = useMemo(() => {
    return articles.reduce((sum, art) => sum + (art.views || 0), 0);
  }, [articles]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.xmId.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  /* ---- yearPerf: computed from fetched results ---- */
  const yearPerf = useMemo(() => {
    const allMonths = (results as any)?.all || [];
    if (Array.isArray(allMonths) && allMonths.length > 0) {
      const yearMap: Record<string, number> = {};
      for (const m of allMonths) {
        const y = String(m.year);
        if (!yearMap[y]) yearMap[y] = 0;
        if (m.lowRisk != null) yearMap[y] += m.lowRisk;
      }
      return Object.entries(yearMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, value]) => ({ year, value: Math.round(value * 100) / 100 }));
    }
    // fallback if no results data
    return [
      { year: '2023', value: 62 },
      { year: '2024', value: 43 },
      { year: '2025', value: 128 },
      { year: '2026', value: 17 },
    ];
  }, [results]);

  /* dynamic max for perf bars */
  const perfMaxVal = useMemo(() => {
    if (yearPerf.length === 0) return 140;
    const maxAbs = Math.max(...yearPerf.map((y) => Math.abs(y.value)));
    return Math.max(maxAbs * 1.15, 10);
  }, [yearPerf]);

  /* current year performance for KPI */
  const currentYearPerf = useMemo(() => {
    const currentYear = String(new Date().getFullYear());
    const found = yearPerf.find((y) => y.year === currentYear);
    return found ? found.value : 0;
  }, [yearPerf]);

  /* ---- category color helper ---- */
  const catColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'analyse':
      case 'analysis':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'stratégie':
      case 'strategy':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'tutorial':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'actualité':
      case 'news':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  /* ---- navigate helper ---- */
  const nav = (view: string) => {
    setDashboardView(view);
    setSidebarOpen(false);
  };

  /* ================================================================ */
  /*  LOADING SKELETON                                                 */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Sidebar skeleton */}
        <aside className="hidden w-[252px] flex-shrink-0 border-r border-border bg-sidebar lg:block">
          <div className="flex items-center gap-3 border-b border-border px-5 py-5">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="px-3 py-4 space-y-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </aside>
        {/* Content skeleton */}
        <main className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="flex min-h-screen bg-background">
      {/* ---- Desktop Sidebar ---- */}
      <aside className="hidden w-[252px] flex-shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarContent language={language} dashboardView={dashboardView} nav={nav} pendingCount={pendingCount} />
      </aside>

      {/* ---- Mobile Sidebar Overlay ---- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] bg-sidebar border-r border-border shadow-2xl">
            <SidebarContent language={language} dashboardView={dashboardView} nav={nav} pendingCount={pendingCount} />
          </aside>
        </div>
      )}

      {/* ---- Main Content ---- */}
      <main className="flex-1 lg:ml-0">
        {/* Top bar (mobile) */}
        <div className="sticky top-0 z-40 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-foreground">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-foreground">Admin Dashboard</span>
        </div>

        <div className="p-4 lg:p-8">
          {/* ======================= OVERVIEW ======================= */}
          {dashboardView === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('dash.overview', language)}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {L('نظرة عامة على منصتك', 'Overview of your platform', 'Vue d&apos;ensemble de votre plateforme')}
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="rounded-xl border-t-2 border-t-green-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {L('أعضاء نشطين', 'Active members', 'Membres actifs')}
                        </p>
                        <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                          {activeCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-t-2 border-t-amber-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {L(`أداء ${new Date().getFullYear()}`, `Performance ${new Date().getFullYear()}`, `Performance ${new Date().getFullYear()}`)}
                        </p>
                        <p className="mt-2 text-3xl font-bold font-mono text-green-400">
                          {currentYearPerf >= 0 ? `+${currentYearPerf}%` : `${currentYearPerf}%`}
                        </p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
                        {currentYearPerf >= 0 ? `+${currentYearPerf}%` : `${currentYearPerf}%`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-t-2 border-t-blue-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {L('مشاهدات المقالات', 'Article views', 'Vues des articles')}
                        </p>
                        <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                          {totalArticleViews.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-t-2 border-t-red-500">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {L('طلبات معلقة', 'Pending requests', 'Demandes en attente')}
                        </p>
                        <p className="mt-2 text-3xl font-bold font-mono text-foreground">
                          {pendingCount}
                        </p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
                        {pendingCount > 0
                          ? `${pendingCount} ${L('معلقة', 'pending', 'en attente')}`
                          : '0'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {L('إجراءات سريعة', 'Quick actions', 'Actions rapides')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      setAddMemberOpen(true);
                    }}
                    className="h-auto flex-col gap-2 rounded-xl bg-green-500/10 border border-green-500/20 py-5 text-foreground hover:bg-green-500/20 hover:text-green-400"
                  >
                    <span className="text-2xl">➕</span>
                    <span className="text-xs font-medium">{L('إضافة عضو', 'Add member', 'Ajouter membre')}</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setAddSignalOpen(true);
                    }}
                    className="h-auto flex-col gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 py-5 text-foreground hover:bg-blue-500/20 hover:text-blue-400"
                  >
                    <span className="text-2xl">📡</span>
                    <span className="text-xs font-medium">{L('نشر إشارة', 'Publish signal', 'Publier signal')}</span>
                  </Button>
                  <Button
                    onClick={() => nav('blog')}
                    className="h-auto flex-col gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 py-5 text-foreground hover:bg-amber-500/20 hover:text-amber-400"
                  >
                    <span className="text-2xl">✍️</span>
                    <span className="text-xs font-medium">{L('كتابة مقال', 'Write article', 'Écrire article')}</span>
                  </Button>
                  <Button
                    onClick={() => nav('affiliate')}
                    className="h-auto flex-col gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 py-5 text-foreground hover:bg-purple-500/20 hover:text-purple-400"
                  >
                    <span className="text-2xl">🔗</span>
                    <span className="text-xs font-medium">{L('رابط XM', 'XM Link', 'Lien XM')}</span>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Bottom section: Perf bars + Latest signals */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Performance bars */}
                <Card className="rounded-xl">
                  <CardHeader className="pb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {L('أداء سنوي', 'Annual performance', 'Performance annuelle')}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {yearPerf.map((y) => (
                      <PerfBar key={y.year} year={y.year} value={y.value} maxVal={perfMaxVal} />
                    ))}
                  </CardContent>
                </Card>

                {/* Latest signals */}
                <Card className="rounded-xl">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {L('آخر الإشارات', 'Latest signals', 'Derniers signaux')}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => nav('signals')} className="text-xs text-green-400 hover:text-green-300">
                      {L('عرض الكل ←', 'View all ←', 'Voir tout →')}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {signals.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        {L('لا توجد إشارات منشورة', 'No signals published', 'Aucun signal publié')}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {signals.slice(0, 4).map((sig) => (
                          <div
                            key={sig.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5"
                          >
                            <Badge
                              className={`text-[10px] font-bold ${
                                sig.direction === 'BUY'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {sig.direction}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">
                                {sig.instrument}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                E: {sig.entry} · TP: {sig.takeProfit} · SL: {sig.stopLoss}
                              </div>
                            </div>
                            <div className="text-right">
                              {sig.result === 'open' && (
                                <span className="text-xs font-medium text-red-400">🔴 LIVE</span>
                              )}
                              {sig.result && sig.result !== 'open' && (
                                <span
                                  className={`text-xs font-bold font-mono ${
                                    Number(sig.result) >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  {Number(sig.result) >= 0 ? '+' : ''}
                                  {sig.result}
                                </span>
                              )}
                              {!sig.result && (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ======================= MEMBERS ======================= */}
          {dashboardView === 'members' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('dash.members', language)}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {L('إدارة أعضاء مجتمعك', 'Manage your community members', 'Gérez les membres de votre communauté')}
                  </p>
                </div>
                <Button
                  onClick={() => setAddMemberOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  ➕ {t('dash.add', language)} {L('عضو', 'a member', 'un membre')}
                </Button>
              </div>

              {/* Search */}
              <div className="relative max-w-sm">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Input
                  placeholder={L('البحث بالاسم، البريد أو ID XM...', 'Search by name, email or XM ID...', 'Rechercher par nom, email ou ID XM...')}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Table */}
              <Card className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{L('الاسم', 'Name', 'Nom')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('البريد', 'Email', 'Email')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('معرف XM', 'XM ID', 'ID XM')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('إثبات', 'Proof', 'Preuve')}</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">{L('التاريخ', 'Date', 'Date')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('الحالة', 'Status', 'Statut')}</TableHead>
                      <TableHead className="text-muted-foreground text-right">{L('إجراء', 'Action', 'Action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                          {memberSearch
                            ? L('لم يتم العثور على عضو', 'No member found', 'Aucun membre trouvé')
                            : L('لا يوجد أعضاء مسجلين', 'No members registered', 'Aucun membre inscrit')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {member.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {member.email}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-amber-400">
                            {member.xmId}
                          </TableCell>
                          <TableCell>
                            {member.proofFile ? (
                              <a href={member.proofFile} target="_blank" rel="noreferrer" className="text-blue-400 font-medium hover:text-blue-300 hover:underline text-[11px] truncate block max-w-[100px]">
                                {L('عرض', 'View', 'Voir')}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {member.date ? new Date(member.date).toLocaleDateString('fr-FR') : '—'}
                          </TableCell>
                          <TableCell>
                            {member.status === 'pending' && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                {L('معلقة', 'Pending', 'En attente')}
                              </Badge>
                            )}
                            {member.status === 'active' && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                ✅ {L('نشط', 'Active', 'Actif')}
                              </Badge>
                            )}
                            {member.status === 'rejected' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                ❌ {L('مرفوض', 'Rejected', 'Rejeté')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {member.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                    onClick={() => handleUpdateMemberStatus(member.id, 'active')}
                                  >
                                    ✓ {L('قبول', 'Approve', 'Approuver')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    onClick={() => handleUpdateMemberStatus(member.id, 'rejected')}
                                  >
                                    ✕ {L('رفض', 'Reject', 'Rejeter')}
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-red-500 hover:bg-red-500/20"
                                onClick={() => setDeleteTarget({ type: 'member', id: member.id })}
                              >
                                🗑
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* ======================= SIGNALS ======================= */}
          {dashboardView === 'signals' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('dash.signals', language)}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {L('تاريخ وإدارة إشارات الفوركس', 'Forex signals history and management', 'Historique et gestion des signaux forex')}
                  </p>
                </div>
                <Button
                  onClick={() => setAddSignalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  📡 {L('إشارة جديدة', 'New signal', 'Nouveau signal')}
                </Button>
              </div>

              <Card className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{L('الأداة', 'Instrument', 'Instrument')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('الاتجاه', 'Direction', 'Direction')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('الدخول', 'Entry', 'Entrée')}</TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">{L('TP / SL', 'TP / SL', 'TP / SL')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('النتيجة', 'Result', 'Résultat')}</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">{L('التاريخ', 'Date', 'Date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                          {L('لا توجد إشارات منشورة', 'No signals published', 'Aucun signal publié')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      signals.map((sig) => (
                        <TableRow key={sig.id} className="border-border">
                          <TableCell className="font-semibold text-foreground">
                            {sig.instrument}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`font-bold ${
                                sig.direction === 'BUY'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {sig.direction}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{sig.entry}</TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                            {sig.takeProfit} / {sig.stopLoss}
                          </TableCell>
                          <TableCell>
                            {sig.result === 'open' && (
                              <span className="text-sm font-medium text-red-400">🔴 LIVE</span>
                            )}
                            {sig.result && sig.result !== 'open' && (
                              <span
                                className={`text-sm font-bold font-mono ${
                                  Number(sig.result) >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {Number(sig.result) >= 0 ? '+' : ''}
                                {sig.result}
                              </span>
                            )}
                            {!sig.result && (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {sig.date ? new Date(sig.date).toLocaleDateString('fr-FR') : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* ======================= PAGES (redirects) ======================= */}
          {dashboardView === 'pages' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('dash.pages', language)}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {L('وصول سريع لأقسام المحتوى', 'Quick access to content sections', 'Accès rapide aux sections de contenu')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: 'blog', icon: '✍️', label: t('dash.blog', language), desc: L('مقالات وتحليلات', 'Articles and analyses', 'Articles et analyses'), color: 'border-blue-500/30 hover:border-blue-500/60' },
                  { id: 'results', icon: '📈', label: t('dash.results', language), desc: L('الأداء السنوي', 'Annual performances', 'Performances annuelles'), color: 'border-green-500/30 hover:border-green-500/60' },
                  { id: 'faq', icon: '❓', label: t('dash.faq', language), desc: L('أسئلة شائعة', 'Frequently asked questions', 'Questions fréquentes'), color: 'border-amber-500/30 hover:border-amber-500/60' },
                ].map((page) => (
                  <Card
                    key={page.id}
                    className={`cursor-pointer rounded-xl border-2 bg-card transition-all ${page.color}`}
                    onClick={() => nav(page.id)}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <span className="text-3xl">{page.icon}</span>
                      <div>
                        <div className="font-semibold text-foreground">{page.label}</div>
                        <div className="text-sm text-muted-foreground">{page.desc}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================= BLOG ======================= */}
          {dashboardView === 'blog' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('dash.blog', language)}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {L('إدارة مقالات المدونة', 'Blog articles management', 'Gestion des articles du blog')}
                  </p>
                </div>
                <Button onClick={() => { resetArticleForm(); setAddArticleOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">
                  ✍️ {L('مقال جديد', 'New article', 'Nouvel article')}
                </Button>
              </div>

              <Card className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">{L('العنوان', 'Title', 'Titre')}</TableHead>
                      <TableHead className="text-muted-foreground">{L('التصنيف', 'Category', 'Catégorie')}</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">{L('التاريخ', 'Date', 'Date')}</TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">{L('المشاهدات', 'Views', 'Vues')}</TableHead>
                      <TableHead className="text-muted-foreground text-right">{L('إجراء', 'Action', 'Action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                          {L('لا توجد مقالات منشورة', 'No articles published', 'Aucun article publié')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      articles.map((article) => (
                        <TableRow key={article.id} className="border-border">
                          <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                            {language === 'ar' ? article.titleAr : language === 'en' ? article.titleEn : article.titleFr}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border ${catColor(article.category)}`}
                              variant="outline"
                            >
                              {article.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {article.date ? new Date(article.date).toLocaleDateString('fr-FR') : '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                            {article.views?.toLocaleString() ?? '0'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-blue-400 hover:bg-blue-500/10" onClick={() => handleEditArticle(article)}>
                                ✏️ {L('تعديل', 'Edit', 'Modifier')}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10"
                                onClick={() => setDeleteTarget({ type: 'article', id: article.id })}
                              >
                                🗑 {L('حذف', 'Delete', 'Supprimer')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* ======================= RESULTS ======================= */}
          {dashboardView === 'results' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {t('dash.results', language)}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {L('أداء وإحصائيات التداول', 'Trading performance and statistics', 'Performance et statistiques de trading')}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    fetchResults();
                    showToast(L('تم تحديث البيانات', 'Data refreshed', 'Données actualisées'));
                  }}
                  variant="outline"
                  className="border-border"
                >
                  🔄 {t('dash.refresh', language)}
                </Button>
              </div>

              {/* Large performance bars */}
              <Card className="rounded-xl">
                <CardHeader>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {L('الرصيد السنوي', 'Annual balance', 'Bilan annuel')}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {yearPerf.map((y) => (
                    <PerfBar key={y.year} year={y.year} value={y.value} maxVal={perfMaxVal} />
                  ))}
                </CardContent>
              </Card>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-xl border-l-2 border-l-green-500">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {L(`إجمالي ${new Date().getFullYear()}`, `Total ${new Date().getFullYear()}`, `Total ${new Date().getFullYear()}`)}
                    </p>
                    <p className="mt-2 text-2xl font-bold font-mono text-green-400">
                      {currentYearPerf >= 0 ? `+${currentYearPerf}%` : `${currentYearPerf}%`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-l-2 border-l-blue-500">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {L('معدل الفوز', 'Win Rate', 'Win Rate')}
                    </p>
                    <p className="mt-2 text-2xl font-bold font-mono text-blue-400">42%</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-l-2 border-l-amber-500">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {L('أشهر نشطة', 'Active months', 'Mois actifs')}
                    </p>
                    <p className="mt-2 text-2xl font-bold font-mono text-amber-400">2</p>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-l-2 border-l-purple-500">
                  <CardContent className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {L('نقاط ربحت', 'Pips won', 'Pips gagnés')}
                    </p>
                    <p className="mt-2 text-2xl font-bold font-mono text-purple-400">901</p>
                  </CardContent>
                </Card>
              </div>

              <Button className="bg-green-600 hover:bg-green-700 text-white">
                🔄 {L('تحديث', 'Update', 'Mettre à jour')}
              </Button>
            </div>
          )}

          {/* ======================= FAQ ======================= */}
          {dashboardView === 'faq' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">FAQ</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {L('إدارة الأسئلة الشائعة', 'FAQ management', 'Gestion des questions fréquentes')}
                  </p>
                </div>
                <Button onClick={() => { resetFaqForm(); setAddFaqOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">
                  ➕ {L('سؤال جديد', 'New question', 'Nouvelle question')}
                </Button>
              </div>

              <Card className="rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground w-12">#</TableHead>
                      <TableHead className="text-muted-foreground">{L('السؤال', 'Question', 'Question')}</TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">{L('التصنيف', 'Category', 'Catégorie')}</TableHead>
                      <TableHead className="text-muted-foreground text-right">{L('إجراء', 'Action', 'Action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                          {L('لا توجد أسئلة مسجلة', 'No questions registered', 'Aucune question enregistrée')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      faqs.map((faq, idx) => (
                        <TableRow key={faq.id} className="border-border">
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-foreground max-w-[300px] truncate">
                            {language === 'ar' ? faq.questionAr : language === 'en' ? faq.questionEn : faq.questionFr}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              className={`border ${catColor(faq.category)}`}
                              variant="outline"
                            >
                              {faq.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-blue-400 hover:bg-blue-500/10" onClick={() => handleEditFaq(faq)}>
                                ✏️ {L('تعديل', 'Edit', 'Modifier')}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-red-400 hover:bg-red-500/10"
                                onClick={() => setDeleteTarget({ type: 'faq', id: faq.id })}
                              >
                                🗑 {L('حذف', 'Delete', 'Supprimer')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* ======================= SETTINGS ======================= */}
          {dashboardView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {t('dash.settings', language)}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {L('الإعدادات العامة للموقع', 'General site configuration', 'Configuration générale du site')}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* General settings */}
                <Card className="rounded-xl">
                  <CardHeader>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {L('إعدادات عامة', 'General settings', 'Paramètres généraux')}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{L('اسم الموقع', 'Site name', 'Nom du site')}</Label>
                      <Input
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="Chebbi Trading"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{L('البريد الإلكتروني', 'Contact email', 'Email de contact')}</Label>
                      <Input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@chebbitrade.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Telegram</Label>
                      <Input
                        value={telegramHandle}
                        onChange={(e) => setTelegramHandle(e.target.value)}
                        placeholder="@chebbitrading"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">{L('قناة يوتيوب', 'YouTube channel', 'Chaîne YouTube')}</Label>
                      <Input
                        value={youtubeChannel}
                        onChange={(e) => setYoutubeChannel(e.target.value)}
                        placeholder="https://youtube.com/@chebbitrading"
                      />
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      💾 {t('dash.save', language)}
                    </Button>
                  </CardContent>
                </Card>


                {/* Webhook settings */}
                <Card className="rounded-xl lg:col-span-2">
                  <CardHeader>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {L('إعدادات Webhook', 'Webhook Settings', 'Paramètres Webhook')}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {L('رابط Webhook التسجيل (n8n)', 'Registration Webhook URL (n8n)', 'URL Webhook inscription (n8n)')}
                      </Label>
                      <Input
                        value={webhookRegUrl}
                        onChange={(e) => setWebhookRegUrl(e.target.value)}
                        placeholder="https://n8n.example.com/webhook/xxx"
                        className="font-mono text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {L(
                          'عند تسجيل عضو جديد، سيتم إرسال البيانات إلى هذا الرابط',
                          'When a new member registers, data will be sent to this URL',
                          `Quand un nouveau membre s'inscrit, les données seront envoyées à cette URL`
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {L('مفتاح Webhook السري', 'Webhook Secret Key', 'Clé secrète Webhook')}
                      </Label>
                      <Input
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        placeholder="your-secret-key"
                        className="font-mono text-xs"
                        type="password"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {L(
                          'يُستخدم من قبل n8n عند استدعاء /api/webhook/member-status لقبول أو رفض العضو',
                          'Used by n8n when calling /api/webhook/member-status to accept or reject a member',
                          `Utilisé par n8n lors de l'appel à /api/webhook/member-status pour accepter ou refuser un membre`
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      💾 {t('dash.save', language)}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ======================= AFFILIATE ======================= */}
          {dashboardView === 'affiliate' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {L('رابط XM المباشر', 'XM Direct Link', 'Lien XM Direct')}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {L('أدخل رابط الإحالة الكامل الذي سيظهر في جميع الصفحات', 'Enter the full referral URL that will appear on all pages', 'Entrez l\'URL de parrainage complète qui s\'affichera sur toutes les pages')}
                </p>
              </div>

              <Card className="rounded-xl max-w-xl">
                <CardHeader>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {L('روابط الإحالة', 'Referral Links', 'Liens de parrainage')}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-semibold">🇫🇷 {L('الفرنسية', 'French', 'Français')}</Label>
                    <Input
                      value={xmLinkFr}
                      onChange={(e) => setXmLinkFr(e.target.value)}
                      placeholder="https://..."
                      className="font-mono text-xs"
                    />
                    {xmLinkFr && <div className="rounded-md bg-muted/30 px-3 py-1.5 text-xs font-mono text-foreground/60 truncate">{xmLinkFr}</div>}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-semibold">🇬🇧 {L('الإنجليزية', 'English', 'English')}</Label>
                    <Input
                      value={xmLinkEn}
                      onChange={(e) => setXmLinkEn(e.target.value)}
                      placeholder="https://..."
                      className="font-mono text-xs"
                    />
                    {xmLinkEn && <div className="rounded-md bg-muted/30 px-3 py-1.5 text-xs font-mono text-foreground/60 truncate">{xmLinkEn}</div>}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-semibold">🇸🇦 {L('العربية', 'Arabic', 'Arabe')}</Label>
                    <Input
                      value={xmLinkAr}
                      onChange={(e) => setXmLinkAr(e.target.value)}
                      placeholder="https://..."
                      className="font-mono text-xs"
                    />
                    {xmLinkAr && <div className="rounded-md bg-muted/30 px-3 py-1.5 text-xs font-mono text-foreground/60 truncate">{xmLinkAr}</div>}
                  </div>

                  <Button
                    onClick={handleApplyXmLinks}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    🔗 {L('حفظ الروابط', 'Save Links', 'Enregistrer les liens')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ======================= TRADES ======================= */}
          {dashboardView === 'trades' && (
            <TradesView language={language} showToast={(msg, type) => setToast({ message: msg, type })} />
          )}

          {/* ======================= CRYPTO VIP ======================= */}
          {dashboardView === 'crypto' && (
            <CryptoView language={language} showToast={(msg, type) => setToast({ message: msg, type })} />
          )}

          {/* ======================= CRYPTO SUBS ======================= */}
          {dashboardView === 'crypto-subs' && (
            <CryptoSubscribersView language={language} showToast={(msg, type) => setToast({ message: msg, type })} />
          )}
        </div>
      </main>

      {/* ===================== ADD MEMBER MODAL ===================== */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>➕ {L('إضافة عضو', 'Add a member', 'Ajouter un membre')}</DialogTitle>
            <DialogDescription>
              {L('أضف عضوا يدويا إلى المجتمع', 'Manually add a member to the community', 'Ajoutez manuellement un membre à la communauté')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('الاسم الكامل', 'Full name', 'Nom complet')}</Label>
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder={L('مثال: أحمد محمد', 'E.g.: John Doe', 'Ex: Jean Dupont')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('البريد الإلكتروني', 'Email', 'Email')}</Label>
              <Input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('معرف XM', 'XM ID', 'ID XM')}</Label>
              <Input
                value={newMemberXmId}
                onChange={(e) => setNewMemberXmId(e.target.value)}
                placeholder={L('مثال: 12345678', 'E.g.: 12345678', 'Ex: 12345678')}
                className="font-mono"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setAddMemberOpen(false)}
              >
                {L('إلغاء', 'Cancel', 'Annuler')}
              </Button>
              <Button
                onClick={handleAddMember}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {L('إضافة', 'Add', 'Ajouter')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== ADD SIGNAL MODAL ===================== */}
      <Dialog open={addSignalOpen} onOpenChange={setAddSignalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>📡 {L('إشارة جديدة', 'New signal', 'Nouveau signal')}</DialogTitle>
            <DialogDescription>
              {L('انشر إشارة تداول جديدة', 'Publish a new trading signal', 'Publiez un nouveau signal de trading')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('الأداة', 'Instrument', 'Instrument')}</Label>
              <Input
                value={newSignalInstrument}
                onChange={(e) => setNewSignalInstrument(e.target.value)}
                placeholder={L('مثال: EUR/USD', 'E.g.: EUR/USD', 'Ex: EUR/USD')}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('الاتجاه', 'Direction', 'Direction')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={newSignalDirection === 'BUY' ? 'default' : 'outline'}
                  className={
                    newSignalDirection === 'BUY'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border-border text-foreground'
                  }
                  onClick={() => setNewSignalDirection('BUY')}
                >
                  📈 BUY
                </Button>
                <Button
                  type="button"
                  variant={newSignalDirection === 'SELL' ? 'default' : 'outline'}
                  className={
                    newSignalDirection === 'SELL'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'border-border text-foreground'
                  }
                  onClick={() => setNewSignalDirection('SELL')}
                >
                  📉 SELL
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('الدخول', 'Entry', 'Entrée')}</Label>
                <Input
                  value={newSignalEntry}
                  onChange={(e) => setNewSignalEntry(e.target.value)}
                  placeholder="1.0850"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Take Profit</Label>
                <Input
                  value={newSignalTP}
                  onChange={(e) => setNewSignalTP(e.target.value)}
                  placeholder="1.0950"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Stop Loss</Label>
                <Input
                  value={newSignalSL}
                  onChange={(e) => setNewSignalSL(e.target.value)}
                  placeholder="1.0800"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setAddSignalOpen(false)}
              >
                {L('إلغاء', 'Cancel', 'Annuler')}
              </Button>
              <Button
                onClick={handleAddSignal}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                📡 {L('نشر', 'Publish', 'Publier')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== ADD ARTICLE MODAL ===================== */}
      <Dialog open={addArticleOpen} onOpenChange={setAddArticleOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✍️ {L('مقال جديد', 'New article', 'Nouvel article')}</DialogTitle>
            <DialogDescription>
              {L('أنشئ مقال مدونة جديد', 'Create a new blog article', 'Créez un nouvel article de blog')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('العنوان *', 'Title *', 'Titre *')}</Label>
              <Input
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder={L('مثال: تحليل EUR/USD - سبتمبر 2025', 'E.g.: EUR/USD Analysis - September 2025', 'Ex: Analyse EUR/USD - Septembre 2025')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('التصنيف', 'Category', 'Catégorie')}</Label>
                <Select value={articleCategory} onValueChange={setArticleCategory}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">🏆 Gold</SelectItem>
                    <SelectItem value="education">📚 {L('تعليم', 'Education', 'Éducation')}</SelectItem>
                    <SelectItem value="strategie">🎯 {L('استراتيجية', 'Strategy', 'Stratégie')}</SelectItem>
                    <SelectItem value="analyse">📊 {L('تحليل', 'Analysis', 'Analyse')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('اللغة', 'Language', 'Langue')}</Label>
                <Select value={articleLanguage} onValueChange={setArticleLanguage}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Emoji</Label>
                <Input
                  value={articleEmoji}
                  onChange={(e) => setArticleEmoji(e.target.value)}
                  placeholder="📝"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('وقت القراءة', 'Read time', 'Temps de lecture')}</Label>
                <Input
                  value={articleReadTime}
                  onChange={(e) => setArticleReadTime(e.target.value)}
                  placeholder="5 min"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('التاريخ', 'Date', 'Date')}</Label>
              <Input
                type="date"
                value={articleDate}
                onChange={(e) => setArticleDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('المقتطف', 'Excerpt', 'Extrait')}</Label>
              <Textarea
                value={articleExcerpt}
                onChange={(e) => setArticleExcerpt(e.target.value)}
                placeholder={L('ملخص قصير للمقال...', 'Short article summary...', 'Résumé court de l\'article...')}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('المحتوى', 'Content', 'Contenu')}</Label>
              <Textarea
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                placeholder={L('المحتوى الكامل للمقال (يدعم HTML)...', 'Full article content (supports HTML)...', 'Contenu complet de l\'article (supporte le HTML)...')}
                rows={6}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setAddArticleOpen(false)}
              >
                {L('إلغاء', 'Cancel', 'Annuler')}
              </Button>
              <Button
                onClick={handleAddArticle}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                ✍️ {L('إنشاء', 'Create', 'Créer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== EDIT ARTICLE MODAL ===================== */}
      <Dialog open={editArticleOpen} onOpenChange={setEditArticleOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ {L('تعديل المقال', 'Edit article', "Modifier l'article")}</DialogTitle>
            <DialogDescription>
              {L('عدل معلومات المقال', 'Edit article information', "Modifiez les informations de l'article")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('العنوان *', 'Title *', 'Titre *')}</Label>
              <Input
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder={L('عنوان المقال', 'Article title', "Titre de l'article")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('التصنيف', 'Category', 'Catégorie')}</Label>
                <Select value={articleCategory} onValueChange={setArticleCategory}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">🏆 Gold</SelectItem>
                    <SelectItem value="education">📚 {L('تعليم', 'Education', 'Éducation')}</SelectItem>
                    <SelectItem value="strategie">🎯 {L('استراتيجية', 'Strategy', 'Stratégie')}</SelectItem>
                    <SelectItem value="analyse">📊 {L('تحليل', 'Analysis', 'Analyse')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('اللغة', 'Language', 'Langue')}</Label>
                <Select value={articleLanguage} onValueChange={setArticleLanguage}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                    <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Emoji</Label>
                <Input
                  value={articleEmoji}
                  onChange={(e) => setArticleEmoji(e.target.value)}
                  placeholder="📝"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('وقت القراءة', 'Read time', 'Temps de lecture')}</Label>
                <Input
                  value={articleReadTime}
                  onChange={(e) => setArticleReadTime(e.target.value)}
                  placeholder="5 min"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('التاريخ', 'Date', 'Date')}</Label>
              <Input
                type="date"
                value={articleDate}
                onChange={(e) => setArticleDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('المقتطف', 'Excerpt', 'Extrait')}</Label>
              <Textarea
                value={articleExcerpt}
                onChange={(e) => setArticleExcerpt(e.target.value)}
                placeholder={L('ملخص قصير للمقال...', 'Short article summary...', 'Résumé court de l\'article...')}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('المحتوى', 'Content', 'Contenu')}</Label>
              <Textarea
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                placeholder={L('المحتوى الكامل للمقال...', 'Full article content...', 'Contenu complet de l\'article...')}
                rows={6}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => { setEditArticleOpen(false); setEditingArticle(null); }}
              >
                {L('إلغاء', 'Cancel', 'Annuler')}
              </Button>
              <Button
                onClick={handleUpdateArticle}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                💾 {L('حفظ', 'Save', 'Enregistrer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== ADD FAQ MODAL ===================== */}
      <Dialog open={addFaqOpen} onOpenChange={setAddFaqOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>➕ {L('سؤال جديد', 'New question', 'Nouvelle question')}</DialogTitle>
            <DialogDescription>
              {L('أضف سؤالا شائعا جديدا', 'Add a new frequently asked question', 'Ajoutez une nouvelle question fréquente')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('السؤال *', 'Question *', 'Question *')}</Label>
              <Input
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder={L('مثال: كيف أنضم للمجموعة؟', 'E.g.: How to join the group?', 'Ex: Comment rejoindre le groupe ?')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('الإجابة', 'Answer', 'Réponse')}</Label>
              <Textarea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder={L('إجابة مفصلة (تدعم HTML)...', 'Detailed answer (supports HTML)...', 'Réponse détaillée (supporte le HTML)...')}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('التصنيف', 'Category', 'Catégorie')}</Label>
                <Select value={faqCategory} onValueChange={setFaqCategory}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuit">🆓 {L('مجاني', 'Free', 'Gratuit')}</SelectItem>
                    <SelectItem value="xm">🏦 XM Broker</SelectItem>
                    <SelectItem value="signaux">📡 {L('إشارات', 'Signals', 'Signaux')}</SelectItem>
                    <SelectItem value="resultats">📈 {L('نتائج', 'Results', 'Résultats')}</SelectItem>
                    <SelectItem value="capital">💰 {L('رأس مال', 'Capital', 'Capital')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('اللغة', 'Language', 'Langue')}</Label>
                <Select value={faqLanguage} onValueChange={setFaqLanguage}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 FR</SelectItem>
                    <SelectItem value="en">🇬🇧 EN</SelectItem>
                    <SelectItem value="ar">🇸🇦 AR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('الترتيب', 'Order', 'Ordre')}</Label>
                <Input
                  type="number"
                  value={faqOrder}
                  onChange={(e) => setFaqOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setAddFaqOpen(false)}
              >
                {L('إلغاء', 'Cancel', 'Annuler')}
              </Button>
              <Button
                onClick={handleAddFaq}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                ➕ {L('إضافة', 'Add', 'Ajouter')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== EDIT FAQ MODAL ===================== */}
      <Dialog open={editFaqOpen} onOpenChange={setEditFaqOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ {L('تعديل السؤال', 'Edit question', 'Modifier la question')}</DialogTitle>
            <DialogDescription>
              {L('عدل السؤال وإجابته', 'Edit the question and its answer', 'Modifiez la question et sa réponse')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('السؤال *', 'Question *', 'Question *')}</Label>
              <Input
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder={L('السؤال', 'Question', 'Question')}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{L('الإجابة', 'Answer', 'Réponse')}</Label>
              <Textarea
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder={L('إجابة مفصلة...', 'Detailed answer...', 'Réponse détaillée...')}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('التصنيف', 'Category', 'Catégorie')}</Label>
                <Select value={faqCategory} onValueChange={setFaqCategory}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuit">🆓 {L('مجاني', 'Free', 'Gratuit')}</SelectItem>
                    <SelectItem value="xm">🏦 XM Broker</SelectItem>
                    <SelectItem value="signaux">📡 {L('إشارات', 'Signals', 'Signaux')}</SelectItem>
                    <SelectItem value="resultats">📈 {L('نتائج', 'Results', 'Résultats')}</SelectItem>
                    <SelectItem value="capital">💰 {L('رأس مال', 'Capital', 'Capital')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('اللغة', 'Language', 'Langue')}</Label>
                <Select value={faqLanguage} onValueChange={setFaqLanguage}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">🇫🇷 FR</SelectItem>
                    <SelectItem value="en">🇬🇧 EN</SelectItem>
                    <SelectItem value="ar">🇸🇦 AR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{L('الترتيب', 'Order', 'Ordre')}</Label>
                <Input
                  type="number"
                  value={faqOrder}
                  onChange={(e) => setFaqOrder(Number(e.target.value))}
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => { setEditFaqOpen(false); setEditingFaq(null); }}
              >
                {L('إلغاء', 'Cancel', 'Annuler')}
              </Button>
              <Button
                onClick={handleUpdateFaq}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                💾 {L('حفظ', 'Save', 'Enregistrer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE CONFIRM ===================== */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>🗑 {L('تأكيد الحذف', 'Confirm deletion', 'Confirmer la suppression')}</DialogTitle>
            <DialogDescription>
              {L('هذا الإجراء لا يمكن التراجع عنه. هل تريد حقا حذف هذا العنصر؟', 'This action is irreversible. Do you really want to delete this item?', 'Cette action est irréversible. Voulez-vous vraiment supprimer cet élément ?')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={() => setDeleteTarget(null)}
            >
              {L('إلغاء', 'Cancel', 'Annuler')}
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {L('حذف', 'Delete', 'Supprimer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== TOAST ===================== */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TRADES VIEW                                                         */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TradeRow {
  id: string;
  year: number;
  month: number;
  contract: string;
  direction: string;
  entry: number;
  exit: number;
  pips: number;
  result: string;
  period: string;
  notes: string;
}

interface TradeStats {
  yearStats: Record<string, {
    totalTrades: number;
    wins: number;
    losses: number;
    breakEven: number;
    winrate: number;
    totalPips: number;
    biggestWin: number;
    biggestLoss: number;
    lowRiskPct: number;
    mediumRiskPct: number;
  }>;
  totalTrades: number;
}

function TradesView({ language, showToast }: { language: string; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    contract: 'GOLD',
    direction: 'BUY',
    entry: '',
    exit: '',
    pips: '',
    result: 'W',
    period: '',
    notes: '',
  });

  const fetchTrades = useCallback(async () => {
    try {
      const [trRes, stRes] = await Promise.all([
        fetch('/api/trades').then(r => r.json()),
        fetch('/api/trades/stats').then(r => r.json()),
      ]);
      setTrades(trRes.data || []);
      setStats(stRes);
    } catch (_e) { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  const handleAddTrade = async () => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          entry: Number(form.entry),
          exit: Number(form.exit),
          pips: Number(form.pips),
        }),
      });
      if (!res.ok) throw new Error();
      showToast('Trade added', 'success');
      setAddOpen(false);
      setForm({ year: new Date().getFullYear(), month: new Date().getMonth(), contract: 'GOLD', direction: 'BUY', entry: '', exit: '', pips: '', result: 'W', period: '', notes: '' });
      fetchTrades();
    } catch (_e) {
      showToast('Error adding trade', 'error');
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
      showToast('Trade deleted', 'success');
      fetchTrades();
    } catch (_e) {
      showToast('Error deleting trade', 'error');
    }
  };

  const filtered = filterYear === 'all' ? trades : trades.filter(t => String(t.year) === filterYear);
  const years = [...new Set(trades.map(t => String(t.year)))].sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📋 Trades Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter trades from the spreadsheet — stats auto-calculate</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
          ➕ Add Trade
        </Button>
      </div>

      {/* Auto-calculated stats */}
      {stats && Object.keys(stats.yearStats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(stats.yearStats).sort(([a], [b]) => Number(b) - Number(a)).map(([year, s]) => (
            <Card key={year} className="rounded-xl">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-xs text-muted-foreground font-mono mb-1">{year}</div>
                <div className="text-lg font-bold text-green-400 font-mono">+{s.totalPips} pips</div>
                <div className="text-xs text-muted-foreground mt-1">
                  WR: {s.winrate}% | W:{s.wins} L:{s.losses}
                </div>
                <div className="text-xs text-muted-foreground">
                  Low: {s.lowRiskPct}% | Med: {s.mediumRiskPct}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="all">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
      ) : (
        <Card className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Dir</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Pips</TableHead>
                <TableHead>Result</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No trades yet</TableCell>
                </TableRow>
              ) : filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-bold text-xs">{t.contract}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.period || `${MONTH_NAMES[t.month]} ${t.year}`}</TableCell>
                  <TableCell>
                    <Badge variant={t.direction === 'BUY' ? 'default' : 'destructive'} className={`text-[10px] ${t.direction === 'BUY' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {t.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.entry}</TableCell>
                  <TableCell className="font-mono text-xs">{t.exit}</TableCell>
                  <TableCell className={`font-mono text-xs font-bold ${t.pips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.pips >= 0 ? '+' : ''}{t.pips}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${t.result === 'W' ? 'bg-green-600' : t.result === 'L' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                      {t.result}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => handleDeleteTrade(t.id)} className="text-red-400 hover:text-red-300 text-xs">🗑️</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Trade Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle>➕ Add Trade</DialogTitle>
            <DialogDescription>Enter trade data from the spreadsheet</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Month (0–11)</Label>
              <Input type="number" min={0} max={11} value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Contract</Label>
              <Input value={form.contract} onChange={e => setForm({ ...form, contract: e.target.value })} placeholder="GOLD" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Direction</Label>
              <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Entry Price</Label>
              <Input type="number" step="any" value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Exit Price</Label>
              <Input type="number" step="any" value={form.exit} onChange={e => setForm({ ...form, exit: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pip AVG</Label>
              <Input type="number" step="any" value={form.pips} onChange={e => setForm({ ...form, pips: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Result</Label>
              <select value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
                <option value="W">Win</option>
                <option value="L">Loss</option>
                <option value="BE">Break Even</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Period</Label>
              <Input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. First week March" />
            </div>
          </div>
          <Button onClick={handleAddTrade} className="w-full bg-green-600 hover:bg-green-700 text-white mt-2">
            Save Trade
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CRYPTO VIP VIEW                                                     */
/* ------------------------------------------------------------------ */

interface CryptoRow {
  id: string;
  year: number;
  monthIndex: number;
  percentage: number;
}

interface CryptoSub {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  new: '🆕 New',
  contacted: '📤 Contacted',
  active: '✅ Active',
  rejected: '❌ Rejected',
};

function CryptoView({ language, showToast }: { language: string; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const L = (ar: string, en: string, fr: string) =>
    language === 'ar' ? ar : language === 'en' ? en : fr;

  const [records, setRecords] = useState<CryptoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    monthIndex: new Date().getMonth(),
    percentage: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/crypto').then(r => r.json());
      setRecords(res.all || []);
    } catch (_e) { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: form.year,
          monthIndex: form.monthIndex,
          percentage: Number(form.percentage),
        }),
      });
      if (!res.ok) throw new Error();
      showToast('Crypto record saved', 'success');
      setAddOpen(false);
      setForm({ year: new Date().getFullYear(), monthIndex: new Date().getMonth(), percentage: '' });
      fetchData();
    } catch (_e) {
      showToast('Error saving record', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/crypto?id=${id}`, { method: 'DELETE' });
      showToast('Record deleted', 'success');
      fetchData();
    } catch (_e) {
      showToast('Error deleting record', 'error');
    }
  };

  // Group by year
  const grouped = useMemo(() => {
    const g: Record<string, CryptoRow[]> = {};
    for (const r of records) {
      const y = String(r.year);
      if (!g[y]) g[y] = [];
      g[y].push(r);
    }
    return g;
  }, [records]);

  const years = Object.keys(grouped).sort().reverse();

  return (
    <div className="space-y-8">
      {/* ═══ Monthly Performance Section ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">₿ Crypto VIP Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monthly % results for the Crypto VIP page</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
          ➕ Add Month
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
      ) : years.length === 0 ? (
        <Card className="rounded-xl"><CardContent className="py-8 text-center text-muted-foreground">No crypto records yet</CardContent></Card>
      ) : (
        years.map(year => {
          const months = grouped[year].sort((a, b) => a.monthIndex - b.monthIndex);
          let compound = 1;
          for (const m of months) compound *= (1 + m.percentage / 100);
          const total = Math.round((compound - 1) * 10000) / 100;

          return (
            <Card key={year} className="rounded-xl overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <span className="font-bold font-mono">{year}</span>
                <span className={`font-mono text-sm font-bold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {total >= 0 ? '+' : ''}{total.toFixed(2)}%
                </span>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {months.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{MONTH_NAMES[r.monthIndex]}</TableCell>
                      <TableCell className={`font-mono font-bold text-sm ${r.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {r.percentage >= 0 ? '+' : ''}{r.percentage.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-300 text-xs">🗑️</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          );
        })
      )}

      {/* Add Crypto Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>➕ Add Crypto Month</DialogTitle>
            <DialogDescription>Enter monthly performance for the crypto group</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Month</Label>
              <select value={form.monthIndex} onChange={e => setForm({ ...form, monthIndex: Number(e.target.value) })} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm">
                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Percentage (%)</Label>
              <Input type="number" step="0.01" value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="e.g. 12.34 or -5.98" />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full bg-amber-600 hover:bg-amber-700 text-white mt-2">
            Save Record
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CRYPTO SUBSCRIBERS VIEW                                           */
/* ------------------------------------------------------------------ */

function CryptoSubscribersView({ language, showToast }: { language: string; showToast: (msg: string, type: 'success' | 'error') => void }) {
  const L = (ar: string, en: string, fr: string) =>
    language === 'ar' ? ar : language === 'en' ? en : fr;

  const [subscribers, setSubscribers] = useState<CryptoSub[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch('/api/crypto-subscribers').then(r => r.json());
      setSubscribers(res.data || []);
    } catch (_e) { /* ignore */ }
    setSubsLoading(false);
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleDeleteSub = async (id: string) => {
    try {
      await fetch(`/api/crypto-subscribers?id=${id}`, { method: 'DELETE' });
      showToast('Subscriber removed', 'success');
      fetchSubscribers();
    } catch (_e) {
      showToast('Error removing subscriber', 'error');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/crypto-subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      showToast(`Status updated to ${status}`, 'success');
      fetchSubscribers();
    } catch (_e) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            📧 {L('المشتركين بالبريد', 'Email Subscribers', 'Abonnés email VIP')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {L('قائمة الأشخاص الذين أرسلوا بريدهم للانضمام', 'People who submitted their email to join VIP Crypto', 'Personnes ayant soumis leur email pour rejoindre VIP Crypto')}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs font-bold text-background bg-foreground hover:bg-foreground/90 py-1.5 px-3">
          {subscribers.length} {L('مشترك', 'subscribers', 'abonnés')}
        </Badge>
      </div>

      {subsLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
      ) : subscribers.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="py-8 text-center text-muted-foreground">
            {L('لا يوجد مشتركين بعد', 'No subscribers yet', 'Aucun abonné pour le moment')}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{L('البريد', 'Email', 'Email')}</TableHead>
                <TableHead>{L('الحالة', 'Status', 'Statut')}</TableHead>
                <TableHead>{L('التاريخ', 'Date', 'Date')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map(sub => (
                <TableRow key={sub.id}>
                  <TableCell className="font-mono text-sm font-medium">{sub.email}</TableCell>
                  <TableCell>
                    <select
                      value={sub.status}
                      onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${STATUS_COLORS[sub.status] || STATUS_COLORS.new}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground lowercase">
                    {new Date(sub.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => handleDeleteSub(sub.id)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded-md hover:bg-red-500/10 transition-colors" title="Delete">
                      🗑️
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
