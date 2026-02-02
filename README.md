# VIERKORKEN – Premium Weinshop

Eine digitale Weinwelt, die Einkauf, Kultur, Beratung, Genuss und Gemeinschaft verbindet.

![VIERKORKEN](https://via.placeholder.com/1200x400/FAF8F5/3D3D3D?text=VIERKORKEN)

## 🚀 Schnellstart

```bash
# Repository klonen
git clone https://github.com/GYGMOR/vierkorken-repo1.git
cd vierkorken-repo1

# Dependencies installieren
npm install

# .env konfigurieren
cp .env.example .env
# Bearbeite .env mit deinen Credentials

# Entwicklungsserver starten
npm run dev
```

Dann öffne [http://localhost:3000](http://localhost:3000)

📚 **Mehr Details:** Siehe [docs/SCHNELLSTART.md](./docs/SCHNELLSTART.md)

---

## Übersicht

VIERKORKEN ist eine professionelle E-Commerce-Plattform für Weinliebhaber, die weit über einen klassischen Online-Shop hinausgeht. Die Plattform kombiniert:

- **Kuratierte Weinauswahl** aus aller Welt
- **Loyalty-Club** mit 7 Leveln und Cashback-System
- **Sammler-Badges** für Gamification
- **Events & Ticketing** für Verkostungen und Masterclasses
- **Sensorikprofile** und Food-Pairing-Empfehlungen
- **Klara-Integration** für Produktdaten
- **Admin-Portal** für vollständige Verwaltung

## Technologie-Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS (Custom Design System)
- **Datenbank:** MariaDB/MySQL mit Prisma ORM
- **Zahlungen:** Stripe (Nexi-Vorbereitung)
- **E-Mail:** Microsoft Graph API (OAuth2)
- **Produktdaten:** Klara API Integration
- **Bilder:** Sharp für Optimierung
- **QR-Codes:** qrcode Library

## Markenidentität

### Designsprache

- **Farben:** Warmweiß, Rosé-Blush, Taupe, Sand, Graphit
- **Typografie:** Serif (Cormorant Garamond) für Überschriften, Sans Serif (Inter) für Text
- **Stil:** Ruhig, hell, warm, hochwertig – inspiriert von natürlichen Materialien

### Tone of Voice

Ruhig, informativ, vertrauensvoll – ohne verkäuferischen Druck.

## Features

### 1. Produktkatalog

- Umfassende Weindatenbank mit allen Details
- Technische Daten (Alkohol, Säure, Restzucker)
- Sensorikprofile (Trockenheit, Körper, Säure, Tannin)
- Food-Pairing-Empfehlungen
- Zertifikate (Bio, Demeter, Vegan)
- Varianten (Flaschengrößen, Jahrgänge)

### 2. Suche & Filter

- Volltextsuche mit Synonymen
- Facettenfilter: Rebsorte, Region, Jahrgang, Preis
- **Sommelier-Modus:** Geschmacksbasierte Suche
  - Körper (leicht/mittel/voll)
  - Aromatik (fruchtig/würzig/holzbetont)
  - Säurestruktur (mild/frisch/lebhaft)
  - Tannin (weich/ausgewogen/präsent)

### 3. Loyalty-Club (7 Level)

| Level | Punkte      | Name                    | Cashback | Vorteile                           |
| ----- | ----------- | ----------------------- | -------- | ---------------------------------- |
| 1     | 0–499       | Novize                  | 0%       | Einstieg                           |
| 2     | 500–1499    | Kellerfreund            | 1%       | Persönliche Vorschläge             |
| 3     | 1500–4999   | Kenner                  | 2%       | Vorverkaufszugang                  |
| 4     | 5000–11999  | Sommelier-Kreis         | 3%       | Exklusive Probierpakete            |
| 5     | 12000–24999 | Weinguts-Partner        | 4%       | Winzer-Event-Zugang                |
| 6     | 25000–59999 | Connaisseur-Elite       | 5%       | Reservierungen & Beratung          |
| 7     | 60000+      | Grand-Cru Ehrenmitglied | 7%       | Private Tastings & Raritäten       |

**Punkteberechnung:** 1 CHF = 1.2 Punkte

**Zusatzpunkte:**
- Event-Teilnahme: +150 Punkte
- Bewertung: +40 Punkte
- Empfehlung: +250 Punkte

### 4. Sammler-Badges

Dezente Gamification mit stilvollen Badges:

- **Nachtflüsterer** – Kauf zwischen 00:00–03:00 Uhr
- **Morgenkurator** – Kauf vor 10:00 Uhr
- **Regionen-Entdecker** – 6+ verschiedene Regionen gekauft
- **Jahrgangssammler** – 8+ verschiedene Jahrgänge
- **Event-Gast** – Teilnahme an Event
- **Weinfreund des Hauses** – 12 Monate aktiv

### 5. Events & Ticketing

- Verkostungen, Wine Dinners, Masterclasses
- Online-Buchung mit QR-Code-Tickets
- Check-in System für Veranstaltungen
- Nach-Event Follow-Up: Weine des Abends zeitlich begrenzt verfügbar

### 6. Warenkorb & Checkout

- Kisten- & Paketvorschläge (3er, 6er, 12er)
- Geschenkoptionen:
  - Geschenkverpackung
  - Persönliche Grußkarte
  - Versand an andere Adresse

### 7. Zahlungssysteme

- **Stripe:** Kreditkarte, Apple Pay, Google Pay
- **Nexi:** Via Payment-Adapter vorbereitet

### 8. Admin-Portal

Vollständige Verwaltung für:
- Produkte & Varianten
- Bestellungen & Fulfillment
- Kunden & Segmente
- Events & Tickets
- Loyalty-Level & Badges
- Media (DAM)
- Klara-Sync

## Installation

### Voraussetzungen

- Node.js 18+ und npm
- PostgreSQL 14+
- (Optional) Meilisearch für Suche
- Stripe-Account
- SMTP-Server für E-Mails

### Setup-Schritte

1. **Repository klonen**

```bash
git clone https://github.com/your-org/vierkorken.git
cd vierkorken
```

2. **Dependencies installieren**

```bash
npm install
```

3. **Umgebungsvariablen konfigurieren**

Kopiere `.env.example` zu `.env` und passe die Werte an:

```bash
cp .env.example .env
```

Erforderliche Variablen:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vierkorken"
NEXTAUTH_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
# ... weitere siehe .env.example
```

4. **Datenbank einrichten**

```bash
# Prisma Client generieren
npm run db:generate

# Datenbank Schema erstellen
npm run db:push

# (Optional) Prisma Studio öffnen
npm run db:studio
```

5. **Development Server starten**

```bash
npm run dev
```

Die Anwendung läuft auf [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

```
vierkorken/
├── docs/                      # 📚 Dokumentation
│   ├── README.md             # Dokumentations-Übersicht
│   ├── EMAIL-SETUP-QUICKSTART.md
│   ├── AZURE-APP-REGISTRATION.md
│   ├── MICROSOFT-365-SETUP.md
│   ├── PRODUCTION-SETUP.md
│   ├── SCHNELLSTART.md
│   └── API-KEYS-ANLEITUNG.md
│
├── deployment/               # 🚀 Deployment Konfigurationen
│   ├── README.md            # Deployment-Anleitung
│   ├── docker-compose.production.yml
│   ├── PORTAINER-STACK-READY.yml
│   └── docker-compose.FERTIG.yml
│
├── scripts/                  # 🛠️ Hilfsskripte
│   ├── README.md            # Script-Dokumentation
│   └── mariadb-setup.sql    # Datenbank Setup
│
├── prisma/                   # 🗄️ Datenbank
│   └── schema.prisma        # Datenbank Schema
│
├── src/                      # 💻 Source Code
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── weine/          # Wine Catalog Pages
│   │   ├── club/           # Loyalty Club Pages
│   │   ├── events/         # Event Pages
│   │   └── ...
│   ├── components/
│   │   ├── ui/             # Base UI Components
│   │   ├── layout/         # Layout Components
│   │   ├── wine/           # Wine-specific Components
│   │   └── loyalty/        # Loyalty Components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client
│   │   ├── email.ts        # Email (Microsoft Graph API)
│   │   ├── utils.ts        # Utility Functions
│   │   └── loyalty.ts      # Loyalty Logic
│   ├── styles/
│   │   └── globals.css     # Global Styles
│   └── types/              # TypeScript Types
│
├── public/                   # 📦 Static Assets
├── .env.example             # Environment Beispiel
├── Dockerfile               # Docker Build
├── next.config.js           # Next.js Konfiguration
├── tailwind.config.ts       # Tailwind Config
├── package.json             # Dependencies
└── README.md                # Dieses Dokument
```

## Datenbank-Schema

Die Datenbank umfasst folgende Hauptentitäten:

- **User** – Benutzer mit Loyalty-Daten
- **Wine** – Weinprodukte mit allen Details
- **WineVariant** – Varianten (Größen, Jahrgänge)
- **Order** – Bestellungen
- **LoyaltyTransaction** – Punktehistorie
- **Badge** & **UserBadge** – Badge-System
- **Event** & **EventTicket** – Events und Tickets
- **Review** – Bewertungen
- **Cart** & **CartItem** – Warenkorb
- **MediaAsset** – Media Asset Management

Vollständiges Schema: siehe `prisma/schema.prisma`

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Datenbank
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
```

## 🚀 Deployment

### Docker + Portainer (Production)

Die Produktionsumgebung läuft mit Docker und Portainer.

**Deployment-Dateien:** Siehe [deployment/](./deployment/)

**Schnellstart:**

1. Kopiere `deployment/PORTAINER-STACK-READY.yml`
2. Trage echte Credentials ein
3. Deploye in Portainer als neuen Stack

📚 **Detaillierte Anleitung:** [deployment/README.md](./deployment/README.md)

### Lokale Entwicklung

```bash
npm run dev              # Development Server
npm run build            # Production Build
npm run start            # Production Server (lokal)
```

### Docker Build

```bash
# Build
docker build -t ghcr.io/gygmor/vierkorken-repo1:latest .

# Push zu GitHub Container Registry
docker push ghcr.io/gygmor/vierkorken-repo1:latest
```

## Klara-Integration

Die Plattform ist vorbereitet für die Integration mit dem Klara-System:

1. **KlaraSync Model** in Prisma für Sync-Historie
2. **klaraId** Felder in Wine und WineVariant
3. **Konfliktregeln** für Feldüberschreibungen definierbar

Sync-Jobs können via Cron oder manuell im Admin ausgelöst werden.

## Stripe-Integration

```typescript
// Client-side
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Server-side
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

Webhook-Endpunkt: `/api/webhooks/stripe`

## SEO & Performance

- **SSR/SSG** mit Next.js für beste Performance
- **Schema.org** Markup für Produkte, Reviews, Events
- **Core Web Vitals** Optimierung
- **Image Optimization** mit Next.js Image und Sharp
- **Lazy Loading** für Bilder und Komponenten

## Sicherheit

- **2FA** für Admin-Accounts
- **Rate Limiting** auf API Routes
- **CSP Headers** konfiguriert
- **CSRF Protection** via Next.js
- **Secure Cookies** (httpOnly, sameSite)
- **Input Validation** mit Zod

## 📚 Dokumentation

Alle Dokumentationen findest du im [docs/](./docs/) Verzeichnis:

- **[Schnellstart](./docs/SCHNELLSTART.md)** - Entwicklungsumgebung einrichten
- **[Email Setup](./docs/EMAIL-SETUP-QUICKSTART.md)** - Microsoft Graph API konfigurieren
- **[Azure App Registration](./docs/AZURE-APP-REGISTRATION.md)** - Azure Setup für E-Mails
- **[Production Setup](./docs/PRODUCTION-SETUP.md)** - Production Deployment
- **[API Keys](./docs/API-KEYS-ANLEITUNG.md)** - API-Schlüssel einrichten
- **[VLAN Setup](./docs/VLAN-DB-SETUP.md)** - Netzwerk & Datenbank

## Support

- **Issues:** [GitHub Issues](https://github.com/GYGMOR/vierkorken-repo1/issues)
- **E-Mail:** admin@vierkorken.ch

## Lizenz

Proprietär – Alle Rechte vorbehalten.

© 2024 VIERKORKEN. Alle Rechte vorbehalten.

---

**Entwickelt für Weinliebhaber**
