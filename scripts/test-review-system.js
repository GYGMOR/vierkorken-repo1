const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Testing Review System...');
  console.log('');

  // 1. Check if user exists
  const user = await prisma.user.findFirst({
    where: { email: 'joel.hediger@sonnenberg-baar.ch' }
  });

  if (!user) {
    console.log('❌ User nicht gefunden!');
    return;
  }
  console.log('✅ User gefunden:', user.firstName, user.lastName);
  console.log('');

  // 2. Check if wines exist
  const wines = await prisma.wine.findMany({ take: 3 });
  console.log('✅ Weine gefunden:', wines.length);
  wines.forEach(w => {
    console.log('   -', w.name, '(ID:', w.id + ')');
  });
  console.log('');

  // 3. Check current reviews
  const currentReviews = await prisma.review.findMany({
    include: {
      wine: { select: { name: true } },
      user: { select: { firstName: true, lastName: true } }
    }
  });

  console.log('📊 Aktuelle Reviews in DB:', currentReviews.length);
  if (currentReviews.length > 0) {
    currentReviews.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.user.firstName} ${r.user.lastName} → ${r.wine.name}`);
      console.log(`      Rating: ${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)} (${r.rating}/5)`);
      console.log(`      Genehmigt: ${r.isApproved ? '✅ Ja' : '⏳ Nein (wartet auf Freigabe)'}`);
    });
  }
  console.log('');

  // 4. Test the API endpoints
  console.log('💡 So testest du das System:');
  console.log('');
  console.log('1. Öffne in deinem Browser: http://localhost:3008/weine/' + (wines[0]?.id || 'WINE_ID'));
  console.log('2. Logge dich ein als: joel.hediger@sonnenberg-baar.ch');
  console.log('3. Gib eine Bewertung mit 1-5 Sternen ab');
  console.log('4. Die Bewertung wird in der Datenbank gespeichert (wartet auf Admin-Freigabe)');
  console.log('5. Gehe zu http://localhost:3008/admin/reviews um die Bewertung zu genehmigen');
  console.log('6. Nach der Genehmigung erscheint die Bewertung auf der Weinseite');
  console.log('');

  console.log('🔍 Überprüfen ob es funktioniert hat:');
  console.log('   node scripts/check-reviews.js');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Fehler:', e);
  process.exit(1);
});
