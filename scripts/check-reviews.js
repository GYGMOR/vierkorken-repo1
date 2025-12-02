const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const reviews = await prisma.review.findMany({
    include: {
      wine: {
        select: {
          name: true,
          winery: true
        }
      },
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  console.log('📊 Reviews in der Datenbank:');
  console.log('Anzahl:', reviews.length);
  console.log('');

  if (reviews.length === 0) {
    console.log('❌ Keine Reviews gefunden!');
    console.log('Bewertungen werden erstellt wenn Benutzer Weine bewerten.');
  } else {
    reviews.forEach((r, i) => {
      console.log(`${i+1}. Review von ${r.user.firstName} ${r.user.lastName}`);
      console.log('   Wein:', r.wine.name, '(' + r.wine.winery + ')');
      console.log('   Rating:', '★'.repeat(r.rating) + '☆'.repeat(5-r.rating), `(${r.rating}/5)`);
      console.log('   Title:', r.title || '(kein Titel)');
      console.log('   Comment:', r.comment || '(kein Kommentar)');
      console.log('   Genehmigt:', r.isApproved ? '✅ Ja' : '❌ Nein');
      console.log('   Erstellt:', r.createdAt.toLocaleString('de-CH'));
      console.log('');
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Fehler:', e);
  process.exit(1);
});
