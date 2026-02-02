# Vierkorken - Projektstruktur

**Version:** 1.0
**Letztes Update:** 2025-12-02

## Übersicht

Vierkorken ist ein moderner E-Commerce-Shop für Weine, entwickelt mit Next.js 14, TypeScript, Prisma und Integration mit KLARA API und Stripe.

---

## Ordnerstruktur

```
vierkorken-Prototyp/
├── prisma/                          # Datenbank Schema & Migrationen
│   └── schema.prisma               # Prisma Schema (DB Models)
│
├── public/                          # Statische Assets
│   ├── images/                     # Bilder
│   │   ├── layout/                 # Layout-Bilder (Logo, Banner, Video)
│   │   └── wines/                  # Wein-Produktbilder
│   └── icons/                      # Icons & Favicons
│
├── scripts/                         # Utility Scripts (siehe scripts/README.md)
│   ├── create-admin.js             # Admin-User erstellen
│   ├── import-klara-products.ts    # KLARA Produkte importieren
│   └── [weitere Scripts...]
│
├── src/                            # Hauptquellcode
│   ├── app/                        # Next.js 14 App Router
│   │   ├── api/                    # API Routes (Backend)
│   │   │   ├── admin/              # Admin-only Endpoints
│   │   │   │   ├── coupons/        # Gutscheinverwaltung
│   │   │   │   ├── events/         # Event-Management
│   │   │   │   ├── klara/          # KLARA Sync & Import
│   │   │   │   ├── orders/         # Bestellverwaltung
│   │   │   │   ├── reviews/        # Bewertungsverwaltung
│   │   │   │   ├── tickets/        # Ticket-Scanning
│   │   │   │   ├── upload/         # Datei-Upload
│   │   │   │   ├── users/          # Benutzerverwaltung
│   │   │   │   └── wines/          # Wein-Management
│   │   │   │
│   │   │   ├── auth/               # Authentifizierung
│   │   │   │   ├── [...nextauth]/  # NextAuth Konfiguration
│   │   │   │   └── register/       # Registrierung
│   │   │   │
│   │   │   ├── checkout/           # Checkout & Payment
│   │   │   │   └── create-session/ # Stripe Session erstellen
│   │   │   │
│   │   │   ├── coupons/            # Gutschein-Validierung
│   │   │   ├── events/             # Event API (öffentlich)
│   │   │   ├── gift-cards/         # Geschenkgutscheine
│   │   │   ├── klara/              # KLARA API Proxy
│   │   │   │   ├── articles/       # Produktliste
│   │   │   │   ├── categories/     # Kategorien
│   │   │   │   └── overrides/      # Lokale Overrides
│   │   │   │
│   │   │   ├── orders/             # Bestellungen
│   │   │   │   ├── create-cash/    # Barzahlung
│   │   │   │   └── [id]/           # Order Details & Invoice
│   │   │   │
│   │   │   ├── reviews/            # Weinbewertungen
│   │   │   ├── tickets/            # Event-Tickets
│   │   │   ├── user/               # User-Profil & Adressen
│   │   │   ├── webhooks/           # Webhook Handler
│   │   │   │   └── stripe/         # Stripe Webhooks
│   │   │   └── wines/              # Wein API
│   │   │
│   │   ├── (pages)/                # Frontend Pages
│   │   │   ├── admin/              # Admin Dashboard
│   │   │   │   ├── coupons/        # Gutscheinverwaltung
│   │   │   │   ├── events/         # Event-Verwaltung
│   │   │   │   ├── klara/          # KLARA Import Interface
│   │   │   │   ├── orders/         # Bestellübersicht
│   │   │   │   ├── reviews/        # Bewertungen moderieren
│   │   │   │   ├── tickets/        # Ticket-Scanner
│   │   │   │   ├── users/          # Benutzerverwaltung
│   │   │   │   └── wines/          # Wein-Datenbank
│   │   │   │
│   │   │   ├── checkout/           # Checkout-Prozess
│   │   │   ├── club/               # Loyalty Club Seite
│   │   │   ├── events/             # Event-Übersicht & Details
│   │   │   ├── geschenkgutscheine/ # Geschenkgutscheine kaufen
│   │   │   ├── konto/              # User Account Dashboard
│   │   │   ├── login/              # Login Seite
│   │   │   ├── registrieren/       # Registrierung
│   │   │   ├── warenkorb/          # Warenkorb
│   │   │   └── weine/              # Weinliste & Details
│   │   │
│   │   ├── layout.tsx              # Root Layout
│   │   ├── page.tsx                # Homepage
│   │   └── globals.css             # Globale Styles
│   │
│   ├── components/                 # React Komponenten
│   │   ├── layout/                 # Layout-Komponenten
│   │   │   ├── AdminLayout.tsx     # Admin Dashboard Layout
│   │   │   ├── Footer.tsx          # Footer
│   │   │   ├── Header.tsx          # Header mit Navigation
│   │   │   └── MainLayout.tsx      # Main Site Layout
│   │   │
│   │   ├── ui/                     # UI-Komponenten (Buttons, Cards, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── [weitere...]
│   │   │
│   │   └── [feature-components]/   # Feature-spezifische Komponenten
│   │
│   ├── contexts/                   # React Contexts
│   │   └── CartContext.tsx         # Warenkorb State Management
│   │
│   ├── lib/                        # Utilities & Libraries
│   │   ├── klara/                  # KLARA API Integration
│   │   │   ├── api-client.ts       # KLARA API Client
│   │   │   └── auth.ts             # KLARA Authentifizierung
│   │   │
│   │   ├── prisma.ts               # Prisma Client Singleton
│   │   ├── security.ts             # Security Library (Validation, Rate Limiting)
│   │   ├── stripe.ts               # Stripe Client
│   │   └── utils.ts                # Allgemeine Utilities
│   │
│   └── types/                      # TypeScript Type Definitions
│       └── [type-files].ts
│
├── .env.local                      # Environment Variables (NICHT in Git!)
├── .gitignore                      # Git Ignore Rules
├── next.config.js                  # Next.js Konfiguration
├── package.json                    # NPM Dependencies
├── tailwind.config.ts              # Tailwind CSS Konfiguration
├── tsconfig.json                   # TypeScript Konfiguration
│
├── SECURITY.md                     # Sicherheitsdokumentation
├── STRUCTURE.md                    # Diese Datei
└── README.md                       # Projekt-README

```

---

## Technologie-Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **UI-Komponenten:** Custom Components
- **State Management:** React Context API

### Backend
- **API:** Next.js API Routes
- **Datenbank:** MySQL (via Prisma ORM)
- **ORM:** Prisma
- **Authentifizierung:** NextAuth.js
- **Payment:** Stripe Checkout

### Externe APIs
- **KLARA API:** ERP-Integration für Produktdaten
- **Stripe:** Zahlungsabwicklung

### Development Tools
- **Package Manager:** npm
- **Linter:** ESLint
- **Type Checking:** TypeScript Compiler

---

## Wichtige Dateien

### Konfiguration

| Datei | Beschreibung |
|-------|-------------|
| `prisma/schema.prisma` | Datenbank Schema Definition |
| `.env.local` | Environment Variables (lokal, nicht in Git) |
| `next.config.js` | Next.js Konfiguration |
| `tailwind.config.ts` | Tailwind CSS Design System |
| `tsconfig.json` | TypeScript Compiler Optionen |

### Core Libraries

| Datei | Beschreibung |
|-------|-------------|
| `src/lib/prisma.ts` | Prisma Client Singleton |
| `src/lib/security.ts` | Security Helpers (Validation, Rate Limiting) |
| `src/lib/stripe.ts` | Stripe Client Konfiguration |
| `src/lib/klara/api-client.ts` | KLARA API Integration |
| `src/lib/utils.ts` | Allgemeine Utilities (formatPrice, etc.) |

### Layouts

| Datei | Beschreibung |
|-------|-------------|
| `src/app/layout.tsx` | Root Layout (HTML, Body, Providers) |
| `src/components/layout/MainLayout.tsx` | Main Site Layout (Header, Footer) |
| `src/components/layout/AdminLayout.tsx` | Admin Dashboard Layout |

---

## API Route Kategorien

### Öffentliche APIs (keine Auth erforderlich)
- `GET /api/wines` - Weinliste
- `GET /api/wines/[slug]` - Wein-Details
- `GET /api/events` - Event-Liste
- `GET /api/klara/articles` - KLARA Produkte
- `GET /api/klara/categories` - KLARA Kategorien
- `POST /api/coupons/validate` - Gutschein validieren (Rate Limited)
- `POST /api/gift-cards/purchase` - Geschenkgutschein kaufen

### Authentifizierte APIs (Session erforderlich)
- `GET /api/user/profile` - User-Profil
- `GET /api/user/addresses` - Adressen
- `GET /api/user/tickets` - Event-Tickets
- `GET /api/orders` - Bestellungen
- `POST /api/orders/create-cash` - Barzahlung (optional auth)
- `POST /api/reviews` - Bewertung schreiben (Rate Limited)

### Admin APIs (Admin-Role erforderlich)
- `/api/admin/wines/**` - Wein-Management
- `/api/admin/events/**` - Event-Management
- `/api/admin/orders/**` - Bestellverwaltung
- `/api/admin/users/**` - Benutzerverwaltung
- `/api/admin/reviews/**` - Bewertungen moderieren
- `/api/admin/coupons/**` - Gutscheinverwaltung
- `/api/admin/tickets/**` - Ticket-Scanning
- `/api/admin/upload` - Datei-Upload (Rate Limited)

### Webhooks
- `POST /api/webhooks/stripe` - Stripe Webhook Handler

---

## Datenbank Schema

### Core Models

**User**
- Authentifizierung & Profil
- Loyalty Points System
- Rollen: CUSTOMER, ADMIN

**Wine**
- Wein-Datenbank
- Variants (Grössen: 0.375L, 0.75L, 1.5L, etc.)
- Images
- Reviews
- KLARA Integration (optional)

**Event**
- Weinverkostungen, Masterclasses
- Ticket-System mit QR-Codes
- Teilnehmerlimits

**Order**
- Bestellungen (Weine & Events)
- Order Items (polymorphisch: Wine oder Event)
- Payment Methods: STRIPE, CASH
- Delivery Methods: DELIVERY, PICKUP
- Gutschein-Support

**Coupon**
- Typen: PERCENTAGE, FIXED_AMOUNT, GIFT_CARD
- Verwendungslimits
- Gültigkeitszeitraum

**Review**
- Weinbewertungen (1-5 Sterne)
- Moderations-Workflow
- User-Verifizierung

**Ticket**
- Event-Tickets mit QR-Code
- Check-In System
- Apple Wallet Integration

**Address**
- Liefer- und Rechnungsadressen
- Schweizer Adressformat

**KlaraProductOverride**
- Lokale Overrides für KLARA Produkte
- Custom Pricing
- Extended Data (Winery, Region, etc.)

---

## Features

### E-Commerce
✅ Produktkatalog (KLARA Integration)
✅ Warenkorb mit Local Storage
✅ Checkout mit Stripe
✅ Barzahlung bei Abholung
✅ Gutscheinsystem (%, CHF, Geschenkgutscheine)
✅ Versandkostenberechnung (Standard/Express)
✅ Bestellhistorie

### Events
✅ Event-Verwaltung
✅ Ticket-Buchung
✅ QR-Code Check-In
✅ Apple Wallet Integration
✅ Teilnehmerlimits

### User Management
✅ Registrierung & Login
✅ Profil-Verwaltung
✅ Adressbuch
✅ Loyalty Points System (Levels 1-5)
✅ Bestellhistorie

### Admin Dashboard
✅ Weinverwaltung
✅ Event-Management
✅ Bestellübersicht
✅ Benutzerverwaltung
✅ Bewertungsmoderation
✅ Gutscheinverwaltung
✅ KLARA Import
✅ Statistiken

### Bewertungen
✅ 5-Sterne Bewertungssystem
✅ Kommentare
✅ Admin-Moderation
✅ Spam-Protection (Rate Limiting)

### Sicherheit
✅ SQL Injection Protection (Prisma ORM)
✅ XSS Protection (React + Sanitization)
✅ Authentication (NextAuth.js)
✅ Rate Limiting
✅ Input Validation
✅ File Upload Security
✅ CSRF Protection
✅ Security Headers

---

## Environment Variables

### Erforderlich

```bash
# Database
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# KLARA API
KLARA_API_URL="https://api.klara.ch"
KLARA_API_KEY="your-klara-key"
KLARA_API_SECRET="your-klara-secret"
USE_MOCK_KLARA="false"

# URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Optional

```bash
# Backblaze B2 (für Datei-Upload)
S3_ENDPOINT="https://s3.eu-central-003.backblazeb2.com"
S3_REGION="eu-central-003"
S3_BUCKET="bucket-name"
S3_ACCESS_KEY_ID="key"
S3_SECRET_ACCESS_KEY="secret"
NEXT_PUBLIC_S3_PUBLIC_URL="https://..."
```

---

## Scripts

Siehe `scripts/README.md` für Details zu verfügbaren Scripts.

### Wichtigste Scripts:

```bash
# Development
npm run dev              # Start dev server

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes
npx prisma studio        # Open Prisma Studio

# Production
npm run build            # Build for production
npm start                # Start production server

# Utilities
node scripts/create-admin.js                  # Create admin user
node scripts/import-klara-products.ts         # Import KLARA products
```

---

## Deployment

### Voraussetzungen
1. Node.js 18+
2. MySQL Datenbank
3. KLARA API Credentials
4. Stripe Account
5. Domain mit HTTPS

### Schritte
1. Clone Repository
2. `npm install`
3. `.env.local` konfigurieren (siehe oben)
4. `npx prisma generate`
5. `npx prisma db push`
6. `node scripts/create-admin.js`
7. `npm run build`
8. `npm start`

### Checkliste
- [ ] HTTPS erzwungen
- [ ] Environment Variables gesetzt
- [ ] Database Backups konfiguriert
- [ ] Stripe Webhooks konfiguriert
- [ ] Error Monitoring (Sentry)
- [ ] Rate Limiting aktiviert
- [ ] Security Headers aktiv

---

## Weitere Dokumentation

- **Security:** Siehe `SECURITY.md`
- **Scripts:** Siehe `scripts/README.md`
- **API Docs:** Siehe `docs/API.md` (TODO)

---

**Maintainer:** Vierkorken Team
**Lizenz:** Proprietär
**Version:** 1.0.0
