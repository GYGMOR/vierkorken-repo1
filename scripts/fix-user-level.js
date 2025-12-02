const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Same logic as in loyalty.ts
function getLevelFromPoints(points) {
  const LOYALTY_LEVELS = [
    { level: 1, minPoints: 0, maxPoints: 499 },
    { level: 2, minPoints: 500, maxPoints: 1499 },
    { level: 3, minPoints: 1500, maxPoints: 4999 },
    { level: 4, minPoints: 5000, maxPoints: 11999 },
    { level: 5, minPoints: 12000, maxPoints: 24999 },
    { level: 6, minPoints: 25000, maxPoints: 59999 },
    { level: 7, minPoints: 60000, maxPoints: null },
  ];

  for (let i = LOYALTY_LEVELS.length - 1; i >= 0; i--) {
    const level = LOYALTY_LEVELS[i];
    if (points >= level.minPoints) {
      return level.level;
    }
  }
  return 1;
}

async function main() {
  console.log('🔧 Fixing user loyalty levels...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      loyaltyPoints: true,
      loyaltyLevel: true,
    },
  });

  let fixed = 0;

  for (const user of users) {
    const correctLevel = getLevelFromPoints(user.loyaltyPoints);

    if (correctLevel !== user.loyaltyLevel) {
      console.log(`📧 ${user.email}`);
      console.log(`   Points: ${user.loyaltyPoints}`);
      console.log(`   Current Level: ${user.loyaltyLevel}`);
      console.log(`   Correct Level: ${correctLevel}`);

      await prisma.user.update({
        where: { id: user.id },
        data: { loyaltyLevel: correctLevel },
      });

      console.log(`   ✅ Updated to Level ${correctLevel}\n`);
      fixed++;
    }
  }

  console.log(`\n✨ Fixed ${fixed} user(s)`);
  await prisma.$disconnect();
}

main();
