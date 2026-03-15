# VIERKORKEN – Installationsanleitung

Schritt-für-Schritt-Anleitung zur Installation und Einrichtung der VIERKORKEN Plattform.

## Voraussetzungen

Stellen Sie sicher, dass folgende Software installiert ist:

- **Node.js** 18 oder höher ([Download](https://nodejs.org/))
- **npm** oder **yarn** (kommt mit Node.js)
- **PostgreSQL** 14 oder höher ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

## 1. Repository klonen

```bash
git clone https://github.com/your-org/vierkorken.git
cd vierkorken
```

## 2. Dependencies installieren

```bash
npm install
```

Dies installiert alle benötigten Pakete aus `package.json`.

## 3. PostgreSQL Datenbank erstellen

Öffnen Sie PostgreSQL und erstellen Sie eine neue Datenbank:

```sql
CREATE DATABASE vierkorken;
CREATE USER vierkorken_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vierkorken TO vierkorken_user;
```

## 4. Umgebungsvariablen konfigurieren

Kopieren Sie die Beispiel-Env-Datei:

```bash
cp .env.example .env
```

Öffnen Sie `.env` und passen Sie die Werte an:

### Datenbank

```env
DATABASE_URL="postgresql://vierkorken_user:your_secure_password@localhost:5432/vierkorken"
```

### NextAuth / JWT

Generieren Sie sichere Secrets:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Fügen Sie die Secrets ein:

```env
NEXTAUTH_SECRET="generated_secret_here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="another_generated_secret"
```

### Stripe (für Zahlungen)

1. Erstellen Sie einen Account auf [stripe.com](https://stripe.com)
2. Navigieren Sie zu Developers → API keys
3. Kopieren Sie die Keys:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

### E-Mail (optional für Development)

Für Entwicklung können Sie [Mailtrap](https://mailtrap.io/) verwenden:

```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your_mailtrap_user"
SMTP_PASSWORD="your_mailtrap_password"
EMAIL_FROM="VIERKORKEN <noreply@vierkorken.ch>"
```

### Weitere Variablen

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="VIERKORKEN"
NEXT_PUBLIC_CURRENCY="CHF"
```

## 5. Datenbank Schema einrichten

Generieren Sie den Prisma Client und pushen Sie das Schema:

```bash
npm run db:generate
npm run db:push
```

### Optional: Prisma Studio öffnen

Um die Datenbank grafisch zu verwalten:

```bash
npm run db:studio
```

Dies öffnet Prisma Studio unter `http://localhost:5555`

## 6. Development Server starten

```bash
npm run dev
```

Die Anwendung ist jetzt erreichbar unter: **http://localhost:3000**

## 7. Erste Daten anlegen (Optional)

### Über Prisma Studio

1. Öffnen Sie Prisma Studio: `npm run db:studio`
2. Legen Sie manuell Testdaten an:
   - Wines
   - WineVariants
   - Users
   - LoyaltyLevels

### Über Seed-Script (wenn vorhanden)

```bash
npm run db:seed
```

## Production Build

Für Production:

```bash
npm run build
npm run start
```

## Troubleshooting

### Problem: Prisma Client nicht gefunden

**Lösung:**
```bash
npm run db:generate
```

### Problem: Datenbankverbindung fehlgeschlagen

**Prüfen Sie:**
- Ist PostgreSQL gestartet?
- Sind die Credentials in `.env` korrekt?
- Existiert die Datenbank?

```bash
# PostgreSQL Status prüfen (Linux/Mac)
sudo systemctl status postgresql

# PostgreSQL Status prüfen (Windows)
# Services → PostgreSQL überprüfen
```

### Problem: Port 3000 bereits belegt

**Lösung:** Verwenden Sie einen anderen Port:

```bash
PORT=3001 npm run dev
```

### Problem: Module nicht gefunden

**Lösung:** Dependencies neu installieren:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Docker Setup (Alternative)

Falls Sie Docker verwenden möchten:

### 1. Docker Compose Datei erstellen

Erstellen Sie `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: vierkorken_user
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: vierkorken
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://vierkorken_user:your_secure_password@db:5432/vierkorken
    env_file:
      - .env

volumes:
  postgres_data:
```

### 2. Dockerfile erstellen

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run db:generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. Docker starten

```bash
docker-compose up -d
```

## Deployment auf Vercel

### 1. Vercel Account erstellen

Erstellen Sie einen Account auf [vercel.com](https://vercel.com)

### 2. Projekt importieren

1. Klicken Sie auf "New Project"
2. Importieren Sie Ihr Git Repository
3. Vercel erkennt Next.js automatisch

### 3. Umgebungsvariablen setzen

Fügen Sie alle Variablen aus `.env` im Vercel Dashboard hinzu:
- Settings → Environment Variables

### 4. Datenbank bereitstellen

Verwenden Sie einen PostgreSQL-Anbieter:
- [Neon](https://neon.tech/) (empfohlen, kostenlos)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

Kopieren Sie die Connection URL in Vercel:
```
DATABASE_URL="postgresql://..."
```

### 5. Deploy

Vercel deployed automatisch bei jedem Git Push!

## Nächste Schritte

Nach erfolgreicher Installation:

1. ✅ Admin-User anlegen
2. ✅ Erste Weine importieren (oder via Klara-Integration)
3. ✅ Loyalty-Levels konfigurieren
4. ✅ Badges einrichten
5. ✅ Stripe im Live-Modus konfigurieren
6. ✅ E-Mail-Versand testen

## Support

Bei Fragen oder Problemen:
- 📧 E-Mail: support@vierkorken.ch
- 🐛 GitHub Issues: [GitHub](https://github.com/your-org/vierkorken/issues)
- 📖 Dokumentation: [Wiki](https://github.com/your-org/vierkorken/wiki)

---

**Viel Erfolg mit VIERKORKEN! 🍷**
