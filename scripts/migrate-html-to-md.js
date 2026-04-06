const { PrismaClient } = require('@prisma/client');
const TurndownService = require('turndown');

const prisma = new PrismaClient();
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});

async function migrate() {
  console.log('Starting migration from HTML to Markdown...');
  const articles = await prisma.blogArticle.findMany();

  let count = 0;
  for (const article of articles) {
    const hasHtmlFr = /<[a-z][\s\S]*>/i.test(article.contentFr);
    const hasHtmlEn = /<[a-z][\s\S]*>/i.test(article.contentEn);
    const hasHtmlAr = /<[a-z][\s\S]*>/i.test(article.contentAr);

    if (!hasHtmlFr && !hasHtmlEn && !hasHtmlAr && article.contentFr.length > 0) {
      console.log(`Skipping article ${article.id} - seems to be already Markdown or plain text.`);
      continue;
    }

    const mdFr = hasHtmlFr ? turndownService.turndown(article.contentFr) : article.contentFr;
    const mdEn = hasHtmlEn ? turndownService.turndown(article.contentEn) : article.contentEn;
    const mdAr = hasHtmlAr ? turndownService.turndown(article.contentAr) : article.contentAr;

    await prisma.blogArticle.update({
      where: { id: article.id },
      data: {
        contentFr: mdFr,
        contentEn: mdEn,
        contentAr: mdAr,
      },
    });
    
    count++;
    console.log(`Migrated article: ${article.slug} (${article.id})`);
  }

  console.log(`Migration complete! Successfully migrated ${count} articles.`);
  await prisma.$disconnect();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
