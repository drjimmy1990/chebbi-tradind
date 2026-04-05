// Backfill slugs for existing blog articles
const { PrismaClient } = require('@prisma/client');

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const db = new PrismaClient();
  const articles = await db.blogArticle.findMany();
  console.log(`Found ${articles.length} articles to backfill`);
  
  const usedSlugs = new Set();
  
  for (const article of articles) {
    if (article.slug && article.slug !== '') {
      usedSlugs.add(article.slug);
      console.log(`  ✓ "${article.titleFr}" already has slug: ${article.slug}`);
      continue;
    }
    
    let base = slugify(article.titleFr);
    if (!base) base = article.id; // Fallback to ID
    
    let slug = base;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);
    
    await db.blogArticle.update({
      where: { id: article.id },
      data: { slug },
    });
    console.log(`  → "${article.titleFr}" → ${slug}`);
  }
  
  console.log('Done!');
  await db.$disconnect();
}

main().catch(console.error);
