# VIERKORKEN Setup Guide

Vollständige Anleitung zur Einrichtung der VIERKORKEN-Plattform.

## Voraussetzungen

Stellen Sie sicher, dass folgende Software installiert ist:

- **Node.js** 18.x oder höher
- **npm** 9.x oder höher
- **PostgreSQL** 14.x oder höher
- **Git**

Optional:
- **Docker** (für containerisierte Entwicklung)
- **Meilisearch** (für erweiterte Suchfunktionen)

## Schritt 1: Repository klonen

```bash
git clone https://github.com/your-org/vierkorken.git
cd vierkorken
```

## Schritt 2: Dependencies installieren

```bash
npm install
```

Dies installiert alle erforderlichen Pakete aus `package.json`.

## Schritt 3: MariaDB-Datenbank erstellen

### Lokale Installation (XAMPP/MAMP)

1. Starten Sie XAMPP/MAMP
2. Öffnen Sie phpMyAdmin (meist `http://localhost/phpmyadmin`)
3. Erstellen Sie eine neue Datenbank:
   - Name: `backend`
   - Zeichensatz: `utf8mb4_unicode_ci`

**Oder via MySQL Kommandozeile:**

```bash
# MySQL starten und einloggen
mysql -u root -p

# Datenbank erstellen
CREATE DATABASE backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Benutzer erstellen
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'Init1234!';
CREATE USER 'appuser'@'%' IDENTIFIED BY 'Init1234!';

# Berechtigungen vergeben
GRANT ALL PRIVILEGES ON backend.* TO 'appuser'@'localhost';
GRANT ALL PRIVILEGES ON backend.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

exit;
```

### Docker (MariaDB)

```bash
docker run --name vierkorken-mariadb \
  -e MYSQL_DATABASE=backend \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=Init1234! \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -p 3306:3306 \
  -d mariadb:10.11
```

## Schritt 4: Umgebungsvariablen konfigurieren

Kopieren Sie die Beispiel-Datei:

```bash
cp .env.example .env
```

Bearbeiten Sie `.env` und setzen Sie folgende Werte:

### Pflichtfelder

```env
# Datenbank (MariaDB/MySQL)
DATABASE_URL="mysql://appuser:Init1234!@localhost:3306/backend"

# Für Docker verwenden Sie:
# DATABASE_URL="mysql://appuser:Init1234!@mariadb:3306/backend"

# NextAuth / JWT
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="generate-with-openssl-rand-base64-32"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="VIERKORKEN"
```

**Secrets generieren:**

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# JWT_SECRET
openssl rand -base64 32
```

### Stripe (Zahlungen)

1. Erstellen Sie einen Account auf [stripe.com](https://stripe.com)
2. Holen Sie sich die Test-API-Keys aus dem Dashboard
3. Setzen Sie die Keys in `.env`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### E-Mail (SMTP)

Für Bestellbestätigungen und Event-Tickets:

```env
SMTP_HOST="smtp.gmail.com"  # Beispiel für Gmail
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="VIERKORKEN <noreply@vierkorken.ch>"
```

**Gmail App-Passwort erstellen:**
1. Google Account > Sicherheit > 2-Faktor-Authentifizierung
2. App-Passwörter generieren
3. Passwort in `.env` einfügen

## Schritt 5: Datenbank Schema einrichten

### Option A: Via phpMyAdmin (empfohlen)

1. Öffnen Sie phpMyAdmin
2. Wählen Sie die Datenbank `backend`
3. Klicken Sie auf "Importieren"
4. Wählen Sie die Datei `database/vierkorken_schema.sql`
5. Klicken Sie auf "OK"

**Detaillierte Anleitung:** Siehe `database/PHPMYADMIN_SETUP.md`

### Option B: Via Prisma

```bash
# Prisma Client generieren
npm run db:generate

# Schema in Datenbank pushen
npm run db:push
```

**Hinweis:** Prisma Push ist für schnelle Entwicklung, aber für Production sollten Sie Migrationen verwenden oder das SQL-Script.

### Option C: Via Kommandozeile

```bash
mysql -u appuser -p backend < database/vierkorken_schema.sql
```

Passwort: `Init1234!`

## Schritt 6: (Optional) Seed-Daten einfügen

Erstellen Sie eine Datei `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin-Benutzer erstellen
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vierkorken.ch' },
    update: {},
    create: {
      email: 'admin@vierkorken.ch',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      loyaltyLevel: 7,
      loyaltyPoints: 100000,
    },
  });

  console.log('Admin created:', admin);

  // Loyalty Levels erstellen
  const levels = [
    { level: 1, name: 'Novize', minPoints: 0, maxPoints: 499, cashbackPercent: 0, benefits: ['Einstieg'] },
    { level: 2, name: 'Kellerfreund', minPoints: 500, maxPoints: 1499, cashbackPercent: 1, benefits: ['1% Cashback', 'Persönliche Vorschläge'] },
    // ... weitere Level
  ];

  for (const level of levels) {
    await prisma.loyaltyLevel.upsert({
      where: { level: level.level },
      update: level,
      create: level,
    });
  }

  console.log('Loyalty levels created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Dann ausführen:

```bash
npx tsx prisma/seed.ts
```

## Schritt 7: Development Server starten

```bash
npm run dev
```

Die Anwendung ist nun verfügbar unter:
- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3000/api](http://localhost:3000/api)

## Schritt 8: Prisma Studio öffnen (optional)

Zum Verwalten der Daten:

```bash
npm run db:studio
```

Öffnet ein Web-Interface auf [http://localhost:5555](http://localhost:5555)

## Zusätzliche Services

### Meilisearch (Suchfunktion)

```bash
# Docker
docker run -d -p 7700:7700 \
  -e MEILI_MASTER_KEY=your_master_key \
  getmeili/meilisearch:latest

# In .env setzen
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_MASTER_KEY="your_master_key"
```

### S3-kompatibles Storage (Bilder)

Für lokale Entwicklung können Sie MinIO verwenden:

```bash
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# In .env
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="vierkorken-media"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
```

## Troubleshooting

### Fehler: "Can't reach database server"

- MariaDB/MySQL läuft nicht: Starten Sie XAMPP/MAMP oder Docker Container
- Falscher Port oder Host in `DATABASE_URL`
- Firewall blockiert Port 3306
- Bei Docker: Verwenden Sie `mariadb` statt `localhost` als Host

### Fehler: "Prisma Client not generated"

```bash
npm run db:generate
```

### Fehler: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Fehler: "Port 3000 already in use"

Ändern Sie den Port:

```bash
PORT=3001 npm run dev
```

## Production Build

```bash
# Build erstellen
npm run build

# Production Server starten
npm run start
```

## Docker Deployment

```bash
# Build
docker build -t vierkorken:latest .

# Run
docker run -p 3000:3000 --env-file .env vierkorken:latest
```

## Vercel Deployment

1. Repository mit Vercel verbinden
2. Environment Variables im Dashboard setzen
3. MySQL/MariaDB-Datenbank bereitstellen (PlanetScale, AWS RDS, etc.)
4. Build Command: `npm run build`
5. Output Directory: `.next`

## Nächste Schritte

Nach erfolgreichem Setup:

1. Stripe Webhook konfigurieren
2. Admin-Account erstellen
3. Test-Weine hinzufügen
4. SMTP testen
5. Logo und Bilder hochladen

## Support

Bei Problemen:
- GitHub Issues: [Repository Issues](https://github.com/your-org/vierkorken/issues)
- E-Mail: dev@vierkorken.ch
