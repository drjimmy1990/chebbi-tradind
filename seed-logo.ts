import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.siteSetting.upsert({
    where: { key: 'LOGO_URL' },
    update: {},
    create: { key: 'LOGO_URL', value: 'https://i.imgur.com/USEEiyC.png' }
  });
  console.log('Saved LOGO_URL to database siteSetting table.');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
