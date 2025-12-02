const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const levels = await prisma.loyaltyLevel.findMany({
    orderBy: { level: 'asc' }
  });

  console.log('Loyalty Levels:');
  console.log(JSON.stringify(levels, null, 2));

  await prisma.$disconnect();
}

main();
