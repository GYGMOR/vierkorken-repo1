const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tickets = await prisma.eventTicket.findMany({
    include: {
      event: {
        select: {
          title: true,
          startDateTime: true
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

  console.log('📊 Tickets in der Datenbank:');
  console.log('Anzahl:', tickets.length);
  console.log('');

  if (tickets.length === 0) {
    console.log('❌ Keine Tickets gefunden!');
    console.log('Du musst zuerst ein Event-Ticket kaufen, damit QR-Codes erstellt werden.');
  } else {
    tickets.forEach((t, i) => {
      console.log(`${i+1}. Ticket ${t.ticketNumber}`);
      console.log('   QR-Code:', t.qrCode);
      console.log('   Event:', t.event.title);
      console.log('   User:', t.user.firstName, t.user.lastName);
      console.log('   Status:', t.status);
      console.log('   Erstellt:', t.createdAt.toLocaleString('de-CH'));
      console.log('');
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Fehler:', e);
  process.exit(1);
});
