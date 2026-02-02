# VIERKORKEN - Projektstruktur

## Übersicht
Dieses Dokument beschreibt die optimierte Ordnerstruktur der VIERKORKEN-Webanwendung und gibt Best Practices für die Organisation des Codes.

---

## 📁 Hauptstruktur

```
vierkorken-Prototyp/
├── .git/                         # Git Repository
├── .gitignore                    # Git Ignore-Konfiguration
├── .env                          # Environment Variables (NICHT committen!)
├── .env.example                  # Template für .env
├── .eslintrc.json                # ESLint Konfiguration
├── next.config.js                # Next.js Konfiguration
├── package.json                  # Dependencies und Scripts
├── tsconfig.json                 # TypeScript Konfiguration
├── tailwind.config.ts            # Tailwind CSS Konfiguration
├── postcss.config.mjs            # PostCSS Konfiguration
│
├── docs/                         # 📚 Dokumentation
│   ├── SECURITY.md               # Sicherheits-Dokumentation
│   ├── FOLDER_STRUCTURE.md       # Diese Datei
│   ├── PROJEKTÜBERSICHT.md       # Projekt-Übersicht
│   ├── FEATURES.md               # Feature-Liste
│   ├── SETUP.md                  # Setup-Anleitung
│   └── INSTALLATION.md           # Installations-Anleitung
│
├── prisma/                       # 🗄️ Datenbank
│   ├── schema.prisma             # Datenbank-Schema
│   └── migrations/               # Datenbank-Migrationen
│
├── public/                       # 🖼️ Statische Assets
│   ├── images/                   # Bilder
│   ├── icons/                    # Icons
│   └── uploads/                  # Lokale Uploads (falls kein S3)
│
└── src/                          # 💻 Quellcode
    ├── app/                      # Next.js App Router
    ├── components/               # React Components
    ├── contexts/                 # React Contexts
    ├── lib/                      # Utility Libraries
    └── middleware.ts             # Next.js Middleware
```

---

## 📂 Detaillierte Struktur

### `/src/app/` - Next.js App Router
**Verantwortung:** Routing, Pages, API-Routen

```
src/app/
├── (auth)/                       # Auth-Layout-Gruppe
│   ├── login/                    # Login-Seite
│   └── registrieren/             # Registrierungs-Seite
│
├── (public)/                     # Public-Layout-Gruppe
│   ├── weine/                    # Wein-Katalog
│   │   ├── [slug]/               # Einzelne Wein-Detailseite
│   │   ├── page.tsx              # Wein-Liste
│   │   └── WineListContent.tsx   # Client-Component
│   │
│   ├── events/                   # Events & Tastings
│   │   ├── [slug]/               # Einzelnes Event
│   │   └── page.tsx              # Events-Liste
│   │
│   ├── club/                     # Weinclub-Seite
│   ├── blog/                     # Blog
│   ├── uber-uns/                 # Über Uns
│   ├── kontakt/                  # Kontakt
│   ├── datenschutz/              # Datenschutz
│   ├── agb/                      # AGB
│   ├── versand/                  # Versandinfo
│   └── widerruf/                 # Widerrufsrecht
│
├── (shop)/                       # Shop-Layout-Gruppe
│   ├── warenkorb/                # Warenkorb
│   ├── checkout/                 # Checkout
│   │   └── success/              # Bestellbestätigung
│   └── geschenkgutscheine/       # Geschenkgutscheine
│       └── erfolg/               # Kauf-Erfolg
│
├── (user)/                       # User-Layout-Gruppe
│   ├── konto/                    # Benutzerkonto
│   │   └── bestellung/           # Bestellungen
│   │       └── [id]/             # Einzelne Bestellung
│   └── favoriten/                # Favoriten-Liste
│
├── (admin)/                      # Admin-Layout-Gruppe
│   └── admin/                    # Admin-Dashboard
│       ├── page.tsx              # Dashboard
│       ├── settings/             # Einstellungen
│       ├── wines/                # Wein-Verwaltung
│       │   └── [id]/             # Wein bearbeiten
│       ├── events/               # Event-Verwaltung
│       ├── orders/               # Bestellungs-Verwaltung
│       │   └── [id]/             # Bestellung Details
│       ├── users/                # Benutzer-Verwaltung
│       ├── reviews/              # Bewertungs-Verwaltung
│       ├── tickets/              # Ticket-Verwaltung
│       ├── coupons/              # Gutschein-Verwaltung
│       ├── klara/                # KLARA-Integration
│       └── test-qr/              # QR-Code-Tester
│
├── api/                          # 🔌 API-Routen
│   ├── auth/                     # Authentifizierung
│   │   ├── [...nextauth]/        # NextAuth Handler
│   │   └── register/             # Registrierung
│   │
│   ├── user/                     # Benutzer-Endpunkte
│   │   ├── profile/              # Profil
│   │   ├── addresses/            # Adressen
│   │   │   └── [id]/             # Einzelne Adresse
│   │   └── tickets/              # User-Tickets
│   │
│   ├── admin/                    # Admin-Endpunkte
│   │   ├── stats/                # Statistiken
│   │   ├── wines/                # Wein-Management
│   │   │   └── [id]/             # Wein CRUD
│   │   │       ├── images/       # Bild-Management
│   │   │       │   └── [imageId]/
│   │   │       └── variants/     # Varianten
│   │   │           └── [variantId]/
│   │   ├── events/               # Event-Management
│   │   │   └── [id]/
│   │   ├── orders/               # Bestellungs-Management
│   │   │   └── [id]/
│   │   ├── users/                # User-Management
│   │   │   └── [id]/
│   │   ├── reviews/              # Review-Management
│   │   │   └── [id]/
│   │   ├── tickets/              # Ticket-Management
│   │   │   └── scan/             # QR-Scanner
│   │   ├── coupons/              # Coupon-Management
│   │   │   └── [id]/
│   │   ├── klara/                # KLARA-Integration
│   │   │   ├── import/           # Import
│   │   │   ├── test-connection/  # Connection-Test
│   │   │   └── override/         # Product-Override
│   │   │       └── [id]/
│   │   └── upload/               # File-Upload
│   │
│   ├── wines/                    # Öffentliche Wein-API
│   │   └── [slug]/
│   ├── events/                   # Öffentliche Events-API
│   │   └── [slug]/
│   ├── cart/                     # Warenkorb-API
│   ├── orders/                   # Bestellungen
│   │   └── [id]/
│   │       ├── confirm/          # Bestätigung
│   │       └── invoice/          # Rechnung
│   ├── reviews/                  # Bewertungen
│   ├── coupons/                  # Gutscheine
│   │   └── validate/             # Validierung
│   ├── checkout/                 # Checkout
│   │   ├── session/              # Stripe Session
│   │   └── create-session/       # Session erstellen
│   ├── gift-cards/               # Geschenkgutscheine
│   │   └── purchase/
│   ├── tickets/                  # Tickets
│   │   └── [id]/
│   │       └── wallet/           # Wallet-Pass
│   ├── klara/                    # KLARA Public API
│   │   ├── sync/                 # Synchronisation
│   │   ├── articles/             # Artikel
│   │   ├── categories/           # Kategorien
│   │   └── overrides/            # Overrides
│   └── webhooks/                 # Webhooks
│       └── stripe/               # Stripe Webhooks
│
├── layout.tsx                    # Root Layout
└── page.tsx                      # Homepage
```

### `/src/components/` - React Components
**Verantwortung:** Wiederverwendbare UI-Komponenten

```
src/components/
├── admin/                        # Admin-spezifische Components
│   ├── AdminLayout.tsx           # Admin Layout-Wrapper
│   ├── ImageUploader.tsx         # Bild-Upload-Component
│   ├── UserDetailModal.tsx       # User-Detail-Modal
│   └── KlaraProductEditModal.tsx # KLARA-Produkt-Editor
│
├── effects/                      # Visuelle Effekte
│   └── Snowflakes.tsx            # Schneefall-Effekt
│
├── events/                       # Event-Components
│   └── EventImageCarousel.tsx    # Event-Bildergalerie
│
├── layout/                       # Layout-Components
│   ├── MainLayout.tsx            # Haupt-Layout
│   ├── Navigation.tsx            # Navigation
│   └── Footer.tsx                # Footer
│
├── loyalty/                      # Loyalty-System
│   ├── BadgeDisplay.tsx          # Badge-Anzeige
│   └── LoyaltyProgress.tsx       # Loyalty-Fortschritt
│
├── providers/                    # React Providers
│   └── SessionProvider.tsx       # Auth Session Provider
│
├── search/                       # Such-Components
│   └── WineFilters.tsx           # Wein-Filter
│
├── seasonal/                     # Saisonale Components
│   └── ChristmasWreath.tsx       # Weihnachtskranz
│
├── tickets/                      # Ticket-Components
│   └── QRCodeModal.tsx           # QR-Code-Modal
│
├── ui/                           # Basis UI-Components
│   ├── BackButton.tsx            # Zurück-Button
│   ├── Badge.tsx                 # Badge
│   ├── Button.tsx                # Button
│   ├── Card.tsx                  # Card
│   ├── Input.tsx                 # Input-Feld
│   ├── QuantityPicker.tsx        # Mengen-Picker
│   ├── ResponsiveTable.tsx       # Responsive Tabelle
│   └── UserAvatar.tsx            # Benutzer-Avatar
│
├── wine/                         # Wein-Components
│   ├── FoodPairing.tsx           # Food-Pairing
│   ├── SensorikProfile.tsx       # Sensorik-Profil
│   └── WineCard.tsx              # Wein-Karte
│
└── AgeVerification.tsx           # Altersverifikation
```

### `/src/contexts/` - React Contexts
**Verantwortung:** Globaler State Management

```
src/contexts/
└── CartContext.tsx               # Warenkorb-Context
```

### `/src/lib/` - Utility Libraries
**Verantwortung:** Wiederverwendbare Utility-Funktionen

```
src/lib/
├── klara/                        # KLARA-Integration
│   ├── excel-importer.ts         # Excel-Import
│   └── mock-data.ts              # Mock-Daten
│
├── local-upload.ts               # Lokale Datei-Uploads
├── loyalty.ts                    # Loyalty-System-Logik
├── pdf-generator.ts              # PDF-Generierung (Rechnungen)
├── prisma.ts                     # Prisma Client Singleton
├── s3-upload.ts                  # S3-Upload
├── security.ts                   # 🔒 SICHERHEITS-BIBLIOTHEK
├── stripe.ts                     # Stripe-Integration
├── ticket-pdf-generator.ts       # Ticket-PDF-Generierung
└── utils.ts                      # Allgemeine Utils
```

---

## 🏗️ Architektur-Prinzipien

### 1. **Separation of Concerns**
- **API-Routen** (`/src/app/api/`) - Backend-Logik
- **Pages** (`/src/app/**/ page.tsx`) - Server Components
- **Components** (`/src/components/`) - UI-Komponenten
- **Lib** (`/src/lib/`) - Business Logic & Utils

### 2. **Component Organization**
- **Atomic Design:** UI-Components in `/components/ui/`
- **Feature-Based:** Komponenten nach Features gruppiert
- **Reusability:** Wiederverwendbare Komponenten in eigenen Ordnern

### 3. **API Structure**
- **RESTful:** Klare Ressourcen-Hierarchie
- **Authentication:** Auth-Endpunkte in `/api/auth/`
- **Authorization:** Admin-Endpunkte in `/api/admin/`
- **Public vs Private:** Klare Trennung

### 4. **File Naming**
- **Pages:** `page.tsx`
- **Layouts:** `layout.tsx`
- **Components:** `PascalCase.tsx`
- **Utils:** `kebab-case.ts`
- **APIs:** `route.ts`

---

## 🔐 Sicherheits-relevante Dateien

### Kritische Dateien mit Sicherheitslogik:
```
src/
├── lib/
│   └── security.ts               # ⚠️ ZENTRALE SICHERHEITSBIBLIOTHEK
│
├── middleware.ts                 # ⚠️ SECURITY HEADERS & CORS
│
└── app/api/
    ├── auth/                     # ⚠️ AUTHENTIFIZIERUNG
    ├── admin/                    # ⚠️ ADMIN-ENDPUNKTE (geschützt)
    └── webhooks/                 # ⚠️ WEBHOOKS (validieren!)
```

### `.env` Variablen (NIEMALS committen!):
```
DATABASE_URL=                     # Datenbank-Connection
NEXTAUTH_SECRET=                  # NextAuth Secret
NEXTAUTH_URL=                     # App URL

STRIPE_SECRET_KEY=                # Stripe Secret
STRIPE_PUBLISHABLE_KEY=           # Stripe Public Key
STRIPE_WEBHOOK_SECRET=            # Webhook Secret

S3_BUCKET=                        # S3 Bucket (optional)
S3_ACCESS_KEY=                    # S3 Access Key
S3_SECRET_KEY=                    # S3 Secret Key

KLARA_API_URL=                    # KLARA API URL
KLARA_API_KEY=                    # KLARA API Key
```

---

## 📝 Best Practices

### DO ✅
- Gruppiere verwandte Dateien in eigenen Ordnern
- Nutze aussagekräftige Dateinamen
- Halte Components klein und fokussiert
- Verwende TypeScript-Interfaces
- Dokumentiere komplexe Logik
- Teste kritische Funktionen
- Verwende `/lib/` für Business Logic

### DON'T ❌
- Keine Business Logic in Components
- Keine Secrets in Code committen
- Keine großen monolithischen Dateien
- Keine verschachtelten Ordner ohne Grund
- Keine doppelten Utilities
- Keine ungenutzten Dateien belassen

---

## 🧹 Code-Qualität

### Linting & Formatting:
```bash
npm run lint                      # ESLint ausführen
npm run format                    # Prettier (falls konfiguriert)
```

### TypeScript:
```bash
tsc --noEmit                      # Type-Check ohne Build
```

### Dependencies:
```bash
npm audit                         # Security Audit
npm outdated                      # Veraltete Packages finden
npm update                        # Dependencies aktualisieren
```

---

## 📦 Deployment-Struktur

### Production Build:
```
.next/                            # Next.js Build-Output
├── cache/                        # Build Cache
├── server/                       # Server-seitiger Code
├── static/                       # Statische Assets
└── standalone/                   # Standalone-Deployment
```

### Empfohlene Ignore-Patterns (`.gitignore`):
```
node_modules/
.next/
.env
.env.local
*.log
.DS_Store
/public/uploads/                  # Lokale Uploads nicht committen
/prisma/migrations/*.sql          # Nur Schema committen
```

---

## 🚀 Skalierungs-Empfehlungen

### Wenn die Anwendung wächst:

1. **Feature-Based Structure:**
   ```
   src/
   └── features/
       ├── auth/
       ├── wines/
       ├── events/
       └── admin/
   ```

2. **Shared Libraries:**
   ```
   src/lib/
   ├── api/                       # API Clients
   ├── hooks/                     # Custom Hooks
   ├── types/                     # Shared Types
   └── constants/                 # Constants
   ```

3. **Testing:**
   ```
   src/
   ├── __tests__/                 # Unit Tests
   ├── __mocks__/                 # Mocks
   └── e2e/                       # E2E Tests
   ```

---

## 📊 Aktuelle Projekt-Statistiken

- **Total API Routes:** ~52 Endpunkte
- **Total Components:** ~40 Komponenten
- **Total Pages:** ~25 Seiten
- **Total Libraries:** ~14 Utility-Dateien

---

**Letztes Update:** 2025-12-02
**Version:** 1.0
