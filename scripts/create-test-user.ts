import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@vierkorken.ch';
  const password = 'Test1234!';
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('✅ Test-Benutzer existiert bereits:');
    console.log('   E-Mail:', email);
    console.log('   Passwort:', password);
    return;
  }

  // Create test user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Test',
      lastName: 'Benutzer',
      role: 'CUSTOMER',
      loyaltyPoints: 3500,
      loyaltyLevel: 3,
      totalSpent: 2950.0,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Test-Benutzer erfolgreich erstellt!');
  console.log('');
  console.log('Login-Daten:');
  console.log('─────────────────────────────');
  console.log('E-Mail:', email);
  console.log('Passwort:', password);
  console.log('─────────────────────────────');
  console.log('');
  console.log('Benutzer-ID:', user.id);
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
