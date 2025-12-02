const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { tickets: true }
      }
    }
  });

  console.log('📅 Events und Check-in Zeitfenster:');
  console.log('');

  const now = new Date();
  console.log('Aktuelle Zeit:', now.toLocaleString('de-CH'));
  console.log('');

  events.forEach(e => {
    const start = new Date(e.startDateTime);
    const end = new Date(e.endDateTime);
    const checkInFrom = new Date(start.getTime() - 60*60*1000); // 1h vor Start
    const checkInUntil = new Date(end.getTime() + 2*60*60*1000); // 2h nach Ende
    const isValid = now >= checkInFrom && now <= checkInUntil;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Event:', e.title);
    console.log('  Start:', start.toLocaleString('de-CH'));
    console.log('  Ende:', end.toLocaleString('de-CH'));
    console.log('  Check-in erlaubt von:', checkInFrom.toLocaleString('de-CH'));
    console.log('  Check-in erlaubt bis:', checkInUntil.toLocaleString('de-CH'));
    console.log('  Tickets:', e._count.tickets);
    console.log('  Status:', isValid ? '✅ Check-in MÖGLICH' : '❌ Check-in ABGELAUFEN');
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Fehler:', e);
  process.exit(1);
});
