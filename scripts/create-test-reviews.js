const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get a user and some wines
  const user = await prisma.user.findFirst({
    where: { email: 'joel.hediger@sonnenberg-baar.ch' }
  });

  if (!user) {
    console.log('❌ Kein User gefunden! Bitte zuerst einloggen.');
    return;
  }

  const wines = await prisma.wine.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  if (wines.length === 0) {
    console.log('❌ Keine Weine gefunden!');
    return;
  }

  console.log('📝 Erstelle Test-Reviews...');
  console.log('');

  const reviewData = [
    {
      wineId: wines[0].id,
      userId: user.id,
      rating: 5,
      title: 'Ausgezeichneter Wein!',
      comment: 'Ein wundervoller Wein mit komplexem Bouquet und langer Abgang. Sehr zu empfehlen!',
      isApproved: true,
      isVerifiedPurchase: true
    },
    {
      wineId: wines[0].id,
      userId: user.id,
      rating: 4,
      title: 'Sehr gut',
      comment: 'Toller Wein für den Preis. Würde ich wieder kaufen.',
      isApproved: false,
      isVerifiedPurchase: true
    },
    {
      wineId: wines[1]?.id || wines[0].id,
      userId: user.id,
      rating: 3,
      title: 'Solide',
      comment: 'Guter Alltagswein, nichts Besonderes aber durchaus trinkbar.',
      isApproved: true,
      isVerifiedPurchase: false
    },
    {
      wineId: wines[2]?.id || wines[0].id,
      userId: user.id,
      rating: 5,
      title: 'Mein Favorit',
      comment: 'Dieser Wein hat mich absolut überzeugt. Perfekt zu Fleischgerichten!',
      isApproved: false,
      isVerifiedPurchase: true
    },
    {
      wineId: wines[3]?.id || wines[0].id,
      userId: user.id,
      rating: 2,
      title: 'Nicht mein Geschmack',
      comment: 'Leider zu sauer für meinen Geschmack. Vielleicht braucht er noch Zeit.',
      isApproved: true,
      isVerifiedPurchase: true
    }
  ];

  for (const data of reviewData) {
    const review = await prisma.review.create({
      data,
      include: {
        wine: { select: { name: true, winery: true } }
      }
    });

    console.log(`✅ Review erstellt für: ${review.wine.name}`);
    console.log(`   Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)} (${review.rating}/5)`);
    console.log(`   Status: ${review.isApproved ? 'Genehmigt ✅' : 'Ausstehend ⏳'}`);
    console.log('');
  }

  console.log('🎉 Test-Reviews erfolgreich erstellt!');
  console.log('');
  console.log('Du kannst sie jetzt im Admin Portal unter "Reviews" sehen.');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Fehler:', e);
  process.exit(1);
});
