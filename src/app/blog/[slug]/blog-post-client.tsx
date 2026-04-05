'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArticleData {
  id: string;
  slug: string;
  titleFr: string;
  titleEn: string;
  titleAr: string;
  excerptFr: string;
  excerptEn: string;
  excerptAr: string;
  contentFr: string;
  contentEn: string;
  contentAr: string;
  category: string;
  catLabelFr: string;
  catLabelEn: string;
  catLabelAr: string;
  date: string;
  readTime: string;
  views: number;
  emoji: string;
  catColor: string;
  catText: string;
}

type Lang = 'fr' | 'en' | 'ar';

function pickLang(article: ArticleData, field: string, lang: Lang): string {
  const suffix = lang === 'ar' ? 'Ar' : lang === 'en' ? 'En' : 'Fr';
  const obj = article as unknown as Record<string, string>;
  return obj[`${field}${suffix}`] || obj[`${field}Fr`] || '';
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'gold': return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' };
    case 'education': return { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' };
    case 'strategie': return { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' };
    default: return { bg: 'rgba(16,185,129,0.15)', text: '#10b981' };
  }
}

const langLabels: Record<Lang, { back: string; views: string; share: string; copied: string }> = {
  fr: { back: '← Retour au blog', views: 'vues', share: 'Copier le lien', copied: 'Lien copié !' },
  en: { back: '← Back to blog', views: 'views', share: 'Copy link', copied: 'Link copied!' },
  ar: { back: '← العودة للمدونة', views: 'مشاهدة', share: 'نسخ الرابط', copied: 'تم النسخ!' },
};

export default function BlogPostClient({ article }: { article: ArticleData }) {
  const [lang, setLang] = useState<Lang>('fr');
  const [copied, setCopied] = useState(false);
  const labels = langLabels[lang];

  const catColor = getCategoryColor(article.category);
  const title = pickLang(article, 'title', lang);
  const content = pickLang(article, 'content', lang);
  const catLabel = pickLang(article, 'catLabel', lang);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            {labels.back}
          </Link>
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
              {(['fr', 'en', 'ar'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    lang === l
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l === 'fr' ? '🇫🇷' : l === 'en' ? '🇬🇧' : '🇸🇦'}
                </button>
              ))}
            </div>
            {/* Share button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs gap-1.5"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
              {copied ? labels.copied : labels.share}
            </Button>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-5 py-10 lg:py-16">
        {/* Meta header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              style={{ backgroundColor: catColor.bg, color: catColor.text }}
              className="px-3 py-1 text-xs font-bold rounded-full border-0"
            >
              {article.emoji} {catLabel}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> {article.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {article.views.toLocaleString()} {labels.views}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-border mb-10" />

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-li:marker:text-primary
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground
            prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-img:rounded-xl prose-img:border prose-img:border-border
          "
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
          <p className="text-lg font-bold text-foreground mb-2">
            {lang === 'fr' ? 'Rejoignez Chebbi Trading' : lang === 'en' ? 'Join Chebbi Trading' : 'انضم إلى شبي تريدينغ'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {lang === 'fr'
              ? 'Recevez des signaux Forex gratuits et accédez à notre communauté privée.'
              : lang === 'en'
              ? 'Get free Forex signals and access our private community.'
              : 'احصل على إشارات فوركس مجانية وانضم إلى مجتمعنا الخاص.'}
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-xl">
              {lang === 'fr' ? 'Visiter le site →' : lang === 'en' ? 'Visit site →' : 'زيارة الموقع →'}
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}
