const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LOYALTY_LEVELS = [
  { level: 1, name: 'Novize', minPoints: 0, maxPoints: 499 },
  { level: 2, name: 'Kellerfreund', minPoints: 500, maxPoints: 1499 },
  { level: 3, name: 'Kenner', minPoints: 1500, maxPoints: 4999 },
  { level: 4, name: 'Sommelier-Kreis', minPoints: 5000, maxPoints: 11999 },
  { level: 5, name: 'Weinguts-Partner', minPoints: 12000, maxPoints: 24999 },
  { level: 6, name: 'Connaisseur-Elite', minPoints: 25000, maxPoints: 59999 },
  { level: 7, name: 'Grand-Cru Ehrenmitglied', minPoints: 60000, maxPoints: null },
];

function getLevelFromPoints(points) {
  for (let i = LOYALTY_LEVELS.length - 1; i >= 0; i--) {
    const level = LOYALTY_LEVELS[i];
    if (points >= level.minPoints) {
      return level;
    }
  }
  return LOYALTY_LEVELS[0];
}

async function main() {
  console.log('🔧 Fixing all user loyalty levels...');
  console.log('');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      loyaltyPoints: true,
      loyaltyLevel: true,
    },
  });

  console.log(`Found ${users.length} users`);
  console.log('');

  let fixed = 0;
  let alreadyCorrect = 0;

  for (const user of users) {
    const correctLevel = getLevelFromPoints(user.loyaltyPoints);

    if (correctLevel.level !== user.loyaltyLevel) {
      await prisma.user.update({
        where: { id: user.id },
        data: { loyaltyLevel: correctLevel.level },
      });

      console.log(`✅ Fixed: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Punkte: ${user.loyaltyPoints}`);
      console.log(`   ${user.loyaltyLevel} (alt) → ${correctLevel.level} (${correctLevel.name})`);
      console.log('');

      fixed++;
    } else {
      console.log(`✓ OK: ${user.firstName} ${user.lastName} - Level ${user.loyaltyLevel} (${correctLevel.name})`);
      alreadyCorrect++;
    }
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🎉 Fertig!`);
  console.log(`   ${fixed} User korrigiert`);
  console.log(`   ${alreadyCorrect} User waren bereits korrekt`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Fehler:', e);
  process.exit(1);
});
