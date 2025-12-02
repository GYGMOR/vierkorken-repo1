const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Setze "Burgunderweine Verkostung" auf heute Abend
  const today = new Date();
  const startTime = new Date(today);
  startTime.setHours(19, 0, 0, 0); // Heute 19:00 Uhr

  const endTime = new Date(today);
  endTime.setHours(22, 0, 0, 0); // Heute 22:00 Uhr

  const event = await prisma.event.updateMany({
    where: {
      title: 'Burgunderweine Verkostung'
    },
    data: {
      startDateTime: startTime,
      endDateTime: endTime,
    }
  });

  console.log('✅ Event aktualisiert!');
  console.log('');
  console.log('Event: Burgunderweine Verkostung');
  console.log('Neuer Start:', startTime.toLocaleString('de-CH'));
  console.log('Neues Ende:', endTime.toLocaleString('de-CH'));
  console.log('');
  console.log('Check-in ist jetzt möglich ab:', new Date(startTime.getTime() - 60*60*1000).toLocaleString('de-CH'));
  console.log('Check-in möglich bis:', new Date(endTime.getTime() + 2*60*60*1000).toLocaleString('de-CH'));
  console.log('');
  console.log('🎉 Du kannst jetzt die QR-Codes scannen!');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Fehler:', e);
  process.exit(1);
});
