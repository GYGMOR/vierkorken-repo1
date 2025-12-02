const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking KLARA products in Wine table...');
  console.log('');

  // Get all wines from database
  const wines = await prisma.wine.findMany({
    select: {
      id: true,
      name: true,
      articleNumber: true,
      winery: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('📊 Weine in Datenbank:', wines.length);
  wines.forEach(w => {
    console.log(`   - ${w.id}`);
    console.log(`     Name: ${w.name}`);
    console.log(`     Artikelnummer: ${w.articleNumber || 'N/A'}`);
    console.log(`     Weingut: ${w.winery || 'N/A'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Fehler:', e);
  process.exit(1);
});
