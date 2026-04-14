import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import BlogPostClient from './blog-post-client';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function getArticle(slug: string) {
  const article = await db.blogArticle.findUnique({
    where: { slug },
  });
  return article;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Article non trouvé — Chebbi Trading' };
  }

  // Pick title/description based on ?lang= param (default: Arabic if filled, else French)
  let title: string;
  let description: string;
  if (lang === 'ar') {
    title = article.titleAr || article.titleFr;
    description = article.excerptAr || article.titleAr || article.excerptFr || article.titleFr;
  } else if (lang === 'en') {
    title = article.titleEn || article.titleFr;
    description = article.excerptEn || article.titleEn || article.excerptFr || article.titleFr;
  } else if (lang === 'fr') {
    title = article.titleFr;
    description = article.excerptFr || article.titleFr;
  } else {
    // Default: use Arabic if available (most users are Arabic-speaking), else French
    title = article.titleAr || article.titleFr;
    description = article.excerptAr || article.excerptFr || article.titleFr;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chebbitrade.com';

  const defaultImage = 'https://i.imgur.com/MrRODMe.png';
  const rawImage = article.coverImage || defaultImage;
  // Social platforms require absolute URLs — convert relative paths like /api/files/... to full URLs
  const ogImage = rawImage.startsWith('http') ? rawImage : `${siteUrl}${rawImage}`;

  return {
    title: `${title} — Chebbi Trading`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
      siteName: 'Chebbi Trading',
      images: [ogImage],
      publishedTime: article.date,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Increment views
  await db.blogArticle.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  // Serialize for client component
  const articleData = {
    ...article,
    coverImage: article.coverImage || undefined,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };

  return <BlogPostClient article={articleData} />;
}
