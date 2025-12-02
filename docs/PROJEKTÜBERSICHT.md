# VIERKORKEN – Projektübersicht

## 🎯 Mission

VIERKORKEN ist nicht nur ein Weinshop – es ist eine **digitale Weinwelt**, die Einkauf, Kultur, Beratung, Genuss und Gemeinschaft verbindet.

## 📋 Projektstatus

### ✅ **Phase 1 ABGESCHLOSSEN** – Grundstruktur & MVP-Basis

**Was wurde umgesetzt:**

1. **Vollständiges Design System**
   - Markenidentität (Farben, Typografie, Komponenten)
   - Ruhige, warme, hochwertige Ästhetik
   - Responsive UI-Komponenten

2. **Komplette Datenbankarchitektur**
   - 20+ Datenmodelle
   - Produkte, Benutzer, Bestellungen, Loyalty, Events, Badges
   - Klara-Integration vorbereitet

3. **Kernfunktionalität**
   - Homepage mit Markenauftritt
   - Weinkatalog mit Filterung
   - Produktdetailseiten mit Sensorikprofilen
   - Warenkorb-System
   - Loyalty Club Übersicht

4. **Business Logic**
   - Loyalty-Punkteberechnung
   - 7-stufiges Level-System
   - Badge-Trigger-System
   - Utility-Funktionen

5. **API-Grundlage**
   - RESTful API Routes
   - Warenkorb-Management
   - Produktabfragen mit Filter

## 📁 Projektstruktur

```
vierkorken/
├── prisma/
│   └── schema.prisma              # Vollständiges Datenbank-Schema
├── src/
│   ├── app/
│   │   ├── api/                   # API Routes
│   │   │   ├── wines/            # Wein-Endpunkte
│   │   │   └── cart/             # Warenkorb-Endpunkte
│   │   ├── weine/                # Produktseiten
│   │   │   ├── page.tsx          # Katalog
│   │   │   └── [slug]/page.tsx   # Detailseite
│   │   ├── club/                 # Loyalty Club
│   │   ├── warenkorb/            # Warenkorb
│   │   ├── layout.tsx            # Root Layout
│   │   └── page.tsx              # Homepage
│   ├── components/
│   │   ├── ui/                   # Basis-Komponenten
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── wine/                 # Wein-Komponenten
│   │   │   ├── WineCard.tsx
│   │   │   ├── SensorikProfile.tsx
│   │   │   └── FoodPairing.tsx
│   │   └── loyalty/              # Loyalty-Komponenten
│   │       ├── LoyaltyProgress.tsx
│   │       └── BadgeDisplay.tsx
│   ├── lib/
│   │   ├── prisma.ts             # Prisma Client
│   │   ├── utils.ts              # Utility-Funktionen
│   │   └── loyalty.ts            # Loyalty-Logik
│   └── styles/
│       └── globals.css           # Globale Styles
├── public/                       # Static Assets
├── README.md                     # Haupt-Dokumentation
├── INSTALLATION.md               # Setup-Anleitung
├── FEATURES.md                   # Feature-Liste
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 🎨 Design-Prinzipien

### Visuelle Identität

**Farben:**
- Warmweiß (#FAF8F5) – Basis
- Rosé-Blush (#F4E8E8) – Akzente
- Taupe (#C8BFB7) – Sekundär
- Sand (#D9CFC3) – Hintergründe
- Graphit (#3D3D3D) – Text
- Akzent Burgundy (#6D2932) – Highlights
- Akzent Gold (#C9A961) – Premium

**Typografie:**
- **Serif (Cormorant Garamond):** Überschriften, Zahlen, edle Elemente
- **Sans Serif (Inter):** Fließtext, UI-Elemente

**Stil:**
- Viel Weißraum
- Subtile Schatten
- Sanfte Übergänge
- Monoline Icons
- Keine aufdringlichen Effekte

### UX-Prinzipien

1. **Ruhe vor Aufregung** – Kein Marketing-Stress
2. **Informieren statt verkaufen** – Weinkompetenz vermitteln
3. **Vertrauen schaffen** – Transparente Informationen
4. **Entdeckungsfreude fördern** – Intuitive Navigation
5. **Luxus ohne Protz** – Stilvoller Minimalismus

## 🏗️ Technische Architektur

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Hooks (Context API vorbereitet)

### Backend
- **API:** Next.js API Routes
- **ORM:** Prisma
- **Datenbank:** PostgreSQL
- **Suche:** Meilisearch (vorbereitet)

### Zahlungen
- **Aktiv:** Stripe
- **Vorbereitet:** Nexi (via Adapter-Pattern)

### Deployment
- **Platform:** Vercel (empfohlen)
- **Alternative:** Docker, Self-Hosted

## 💎 Kern-Features

### 1. Produktkatalog

**Weinattribute:**
- Weingut, Region, Land
- Rebsorten, Jahrgang
- Alkohol, Säure, Restzucker
- **Sensorikprofile** (1-10 Skala):
  - Trockenheit
  - Körper
  - Säure
  - Tannin
- Food-Pairing-Empfehlungen
- Zertifikate (Bio, Demeter, Vegan)
- Mehrere Varianten (Flaschengrößen)

**Besonderheit:** Sommelier-Modus für geschmacksbasierte Suche

### 2. Loyalty Club (7 Level)

**System:**
- 1 CHF Umsatz = 1.2 Punkte
- Cashback: 0-7% je nach Level
- Zusatzpunkte für Reviews, Events, Empfehlungen

**Level:**
1. **Novize** (0-499) – 0% Cashback
2. **Kellerfreund** (500-1.499) – 1%
3. **Kenner** (1.500-4.999) – 2%
4. **Sommelier-Kreis** (5.000-11.999) – 3%
5. **Weinguts-Partner** (12.000-24.999) – 4%
6. **Connaisseur-Elite** (25.000-59.999) – 5%
7. **Grand-Cru Ehrenmitglied** (60.000+) – 7%

### 3. Sammler-Badges

Stilvolle, dezente Gamification:
- **Nachtflüsterer** – Kauf 00:00-03:00 Uhr
- **Morgenkurator** – Kauf vor 10:00 Uhr
- **Regionen-Entdecker** – 6+ Regionen
- **Jahrgangssammler** – 8+ Jahrgänge
- **Event-Gast** – Event-Teilnahme
- **Weinfreund des Hauses** – 12 Monate aktiv

### 4. Events & Ticketing

- Online-Buchung
- QR-Code-Tickets (PDF/Wallet)
- Check-in System
- **Follow-Up:** Weine des Abends 48h nach Event verfügbar

### 5. Warenkorb & Checkout

- Kisten-Vorschläge (3er, 6er, 12er)
- Geschenkoptionen:
  - Verpackung
  - Grußkarte
  - Andere Lieferadresse
- Loyalty-Punkte-Anzeige

## 📊 Datenmodell (Auszug)

### Hauptentitäten

```
User
├── Loyalty Points & Level
├── Addresses (1:n)
├── Orders (1:n)
├── Badges (n:m)
└── EventTickets (1:n)

Wine
├── Variants (1:n)
│   ├── Bottle Sizes
│   ├── Pricing
│   └── Inventory
├── Images (1:n)
├── Reviews (1:n)
└── Sensory Profile

Order
├── OrderItems (1:n)
├── Loyalty Points Earned
├── Cashback Applied
└── Gift Options

Event
├── Tickets (1:n)
├── Featured Wines
└── Follow-Up Offer
```

## 🔌 Integrationen

### Klara (Produktdaten)

**Vorbereitet für:**
- Automatischer Import via API/CSV
- Delta-Updates (nur Änderungen)
- Konfliktregeln (welche Felder lokal überschreibbar)
- Sync-Historie & Fehler-Logging

**Ablauf:**
1. Klara liefert Produktdaten
2. Sync-Job importiert/aktualisiert
3. Lokale Anreicherungen (Sensorik, Pairing) bleiben erhalten

### Stripe (Zahlungen)

**Features:**
- Kreditkarten
- Apple Pay / Google Pay
- Webhooks für Bestellstatus
- Automatische Rechnungserstellung

### Nexi (vorbereitet)

**Implementierung über Payment Adapter:**
```typescript
interface PaymentProvider {
  createPayment(amount, currency, orderId)
  capturePayment(paymentId)
  refundPayment(paymentId)
}
```

## 🚀 Roadmap

### Q1 2025
- [ ] Authentication (NextAuth)
- [ ] Checkout-Flow komplett
- [ ] Admin-Panel (Basis)
- [ ] E-Mail-System
- [ ] MVP Launch

### Q2 2025
- [ ] Meilisearch Integration
- [ ] Events & Ticketing live
- [ ] Klara-Anbindung aktiv
- [ ] Mobile-Optimierungen

### Q3 2025
- [ ] Erweiterte Features (Abos, Pakete)
- [ ] AI-Weinempfehlungen
- [ ] Performance-Optimierung
- [ ] Marketing-Launch

### Q4 2025
- [ ] Mobile App (React Native)
- [ ] Erweiterte Analytics
- [ ] Internationalisierung (FR, IT, EN)

## 📈 Erfolgskennzahlen (KPIs)

### Business
- Conversion Rate > 2%
- Average Order Value > CHF 150
- Customer Lifetime Value > CHF 800
- Loyalty Club Participation > 60%

### Technical
- Lighthouse Score > 90
- Page Load Time < 2s
- API Response Time < 200ms
- Uptime > 99.9%

## 👥 Team & Rollen

### Entwicklung
- **Backend/Full-Stack:** Prisma, API, Business Logic
- **Frontend:** React/Next.js, UI/UX
- **Design:** Markenidentität, UI-Design

### Business
- **Produkt-Owner:** Feature-Priorisierung
- **Sommelier:** Wein-Kuratierung, Content
- **Marketing:** Community, Events

## 📚 Dokumentation

- **README.md** – Projektübersicht & Quick Start
- **INSTALLATION.md** – Detaillierte Setup-Anleitung
- **FEATURES.md** – Feature-Liste & Status
- **PROJEKTÜBERSICHT.md** – Dieses Dokument
- **Inline-Kommentare** – Im Code selbst

## 🔒 Sicherheit & Compliance

- HTTPS-Only
- Sichere Cookies (httpOnly, sameSite)
- CSRF Protection (via Next.js)
- Input Validation (Zod)
- SQL Injection Prevention (Prisma)
- DSGVO-konform (Schweiz/EU)

## 💰 Kostenübersicht (monatlich, geschätzt)

### Hosting & Infrastruktur
- **Vercel Pro:** ~$20
- **PostgreSQL (Neon):** ~$20
- **Meilisearch Cloud:** ~$30
- **CDN & Storage:** ~$10

### Services
- **Stripe:** 1.5% + CHF 0.25 pro Transaktion
- **E-Mail (SendGrid):** ~$15
- **Monitoring:** ~$10

**Total:** ~$105/Monat + variable Transaktionsgebühren

## 🎓 Lernressourcen & Support

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Stripe Docs:** https://stripe.com/docs

## 📞 Kontakt

- **E-Mail:** support@vierkorken.ch
- **GitHub:** https://github.com/your-org/vierkorken
- **Website:** https://vierkorken.ch

---

## ✨ Das Besondere an VIERKORKEN

VIERKORKEN ist mehr als Software – es ist eine **Philosophie**:

1. **Ruhe statt Hektik** – Kein aggressives Marketing
2. **Bildung statt Verkauf** – Weinkompetenz vermitteln
3. **Gemeinschaft statt Transaktion** – Loyalty als Beziehung
4. **Ästhetik statt Effekt** – Stilvoller Minimalismus
5. **Qualität statt Quantität** – Kuratierte Auswahl

**Status:** Bereit für die nächste Phase! 🍷

**Letzte Aktualisierung:** November 2024
