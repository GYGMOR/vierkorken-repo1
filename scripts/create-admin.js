const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Erstelle Admin-Benutzer...\n');

  const email = 'admin@vierkorken.ch';
  const password = 'Admin2024!Vierkorken'; // SICHERES PASSWORT
  const hashedPassword = await bcrypt.hash(password, 10);

  // Prüfe ob Admin bereits existiert
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin existiert bereits. Aktualisiere Passwort und Rolle...\n');

    const admin = await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin-Benutzer aktualisiert!');
  } else {
    console.log('📝 Erstelle neuen Admin-Benutzer...\n');

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'VIERKORKEN',
        role: 'ADMIN',
        loyaltyPoints: 0,
        loyaltyLevel: 1,
        totalSpent: 0,
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin-Benutzer erstellt!');
  }

  console.log('\n📧 Email:', email);
  console.log('🔐 Passwort:', password);
  console.log('\n🎉 Du kannst dich jetzt einloggen:');
  console.log('   1. Gehe zu: http://localhost:3000/auth/signin');
  console.log('   2. Logge dich mit den obigen Credentials ein');
  console.log('   3. Gehe dann zu: http://localhost:3000/admin');
  console.log('\n⚠️  WICHTIG: Ändere das Passwort nach dem ersten Login!');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  });
