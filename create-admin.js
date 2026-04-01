const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('chebbi2024', 10);
  
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { password: hash },
    create: {
      username: 'admin',
      password: hash,
    },
  });
  
  console.log('✅ Admin credentials configured:');
  console.log('Username: admin');
  console.log('Password: chebbi2024');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
