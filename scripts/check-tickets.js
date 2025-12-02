const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tickets = await prisma.eventTicket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('\n📋 Latest Event Tickets in DB:');
  console.log(JSON.stringify(tickets, null, 2));
  console.log(`\nTotal tickets: ${tickets.length}`);

  await prisma.$disconnect();
}

main();
