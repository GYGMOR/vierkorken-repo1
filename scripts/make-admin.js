const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // ÄNDERE HIER DEINE EMAIL
  const email = 'joel.hediger@sonnenberg-baar.ch';

  console.log(`🔧 Mache ${email} zum Admin...`);

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log('✅ User ist jetzt Admin:', user.email);
  console.log('📧 Email:', user.email);
  console.log('👤 Name:', user.firstName, user.lastName);
  console.log('🔐 Role:', user.role);
  console.log('\n🎉 Du kannst jetzt auf das Admin Panel zugreifen:');
  console.log('   http://localhost:3000/admin');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  });
