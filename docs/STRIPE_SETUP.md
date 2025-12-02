# 🎯 Stripe Payment Integration - Lokales Testing Setup

## ✅ Was bereits implementiert ist:

1. **Stripe SDK** installiert und konfiguriert
2. **API Routes** für Checkout und Webhook erstellt
3. **Checkout Flow** komplett integriert
4. **Success Page** für Bestellbestätigung
5. **Test Secret Key** bereits in `.env.local` eingetragen

---

## 🚀 So testest du die Zahlung lokal:

### **Schritt 1: Stripe CLI installieren**

#### Windows:
```powershell
# Mit Scoop (empfohlen)
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# ODER mit Chocolatey
choco install stripe-cli
```

#### Mac:
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux:
```bash
# Siehe https://stripe.com/docs/stripe-cli#install
```

---

### **Schritt 2: Stripe CLI einloggen**

```bash
stripe login
```

- Browser öffnet sich automatisch
- Klicke auf "Allow access"
- Du bist jetzt im Testmodus eingeloggt ✅

---

### **Schritt 3: Development Server starten**

Öffne ein **erstes Terminal** und starte Next.js:

```bash
cd C:\Users\joel.hediger\Downloads\vierkorken-Prototyp
npm run dev
```

Server läuft jetzt auf: **http://localhost:3000** ✅

---

### **Schritt 4: Stripe Webhook Listener starten**

Öffne ein **zweites Terminal** (parallel zum ersten!) und starte den Webhook Listener:

```bash
cd C:\Users\joel.hediger\Downloads\vierkorken-Prototyp
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Du siehst jetzt sowas:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**👉 WICHTIG: Kopiere dieses `whsec_...` Secret!**

---

### **Schritt 5: Webhook Secret in .env.local eintragen**

1. Öffne die Datei `.env.local`
2. Füge das `whsec_...` Secret ein:

```env
STRIPE_WEBHOOK_SECRET=whsec_dein_secret_hier
```

3. **Speichern!**
4. **WICHTIG:** Starte `npm run dev` neu (im ersten Terminal mit `Ctrl+C` stoppen, dann neu starten)

---

### **Schritt 6: Zahlung testen! 🎉**

Jetzt hast du 2 Terminals laufen:
- **Terminal 1:** `npm run dev` (Next.js Server)
- **Terminal 2:** `stripe listen --forward-to ...` (Webhook Listener)

**Test-Ablauf:**

1. **Öffne Browser:** http://localhost:3000
2. **Füge Produkte zum Warenkorb** (Weine oder Event-Tickets)
3. **Gehe zu Checkout:** http://localhost:3000/checkout
4. **Klicke durch bis "Jetzt kaufen"**
5. **Stripe Checkout öffnet sich!**

**Zahlung mit Testkarte:**
```
Kartennummer: 4242 4242 4242 4242
Ablaufdatum:  12/34 (beliebiges zukünftiges Datum)
CVC:          123 (beliebige 3 Ziffern)
Name:         Test User
```

6. **Klicke "Pay"**
7. **Success Page** erscheint! ✅

**In deinen Terminals siehst du:**

**Terminal 1 (npm run dev):**
```
POST /api/checkout/create-session 200
POST /api/webhooks/stripe 200
🔔 Webhook received from Stripe
✅ ZAHLUNG ERFOLGREICH!
📦 Session ID: cs_test_xxxxx
💰 Betrag total: 450 CHF
```

**Terminal 2 (stripe listen):**
```
[200] POST http://localhost:3000/api/webhooks/stripe [evt_xxxxx]
```

---

## 🧪 Manuell Events testen (optional)

Du kannst auch ohne echten Checkout Webhook-Events simulieren:

```bash
# Im zweiten Terminal (während stripe listen läuft):
stripe trigger checkout.session.completed
```

Das Event wird sofort an deinen Webhook geschickt!

---

## 📋 Troubleshooting

### Problem: "Webhook secret not configured"

**Lösung:**
1. Prüfe ob `STRIPE_WEBHOOK_SECRET` in `.env.local` steht
2. Starte `npm run dev` neu nach Änderung der `.env.local`

### Problem: "Signature verification failed"

**Lösung:**
1. Stelle sicher dass `stripe listen` läuft
2. Kopiere das Secret erneut aus der `stripe listen` Ausgabe
3. Trage es in `.env.local` ein
4. Starte `npm run dev` neu

### Problem: Webhook wird nicht aufgerufen

**Lösung:**
1. Prüfe ob beide Terminals laufen:
   - `npm run dev` (Port 3000)
   - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. URL muss exakt übereinstimmen: `/api/webhooks/stripe`

---

## 🎯 Produktiv-Deployment (später)

Wenn du live gehst:

1. **In Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint:** `https://deine-domain.ch/api/webhooks/stripe`
3. **Events auswählen:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. **Webhook Secret kopieren** (`whsec_...`)
5. **In Vercel/Hosting eintragen:**
   - Environment Variable: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 📦 Was passiert beim Checkout?

1. User klickt "Jetzt kaufen" → API Call: `/api/checkout/create-session`
2. Backend erstellt Stripe Checkout Session mit allen Produkten
3. User wird zu Stripe Checkout weitergeleitet (stripe.com)
4. User zahlt mit Testkarte
5. Stripe sendet Event → `stripe listen` leitet weiter → `/api/webhooks/stripe`
6. Webhook loggt Bestellung (später: in DB speichern)
7. User wird zur Success Page weitergeleitet: `/checkout/success?session_id=...`

---

## ✅ Checkliste

- [ ] Stripe CLI installiert
- [ ] `stripe login` ausgeführt
- [ ] Terminal 1: `npm run dev` läuft
- [ ] Terminal 2: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` läuft
- [ ] Webhook Secret aus Terminal 2 in `.env.local` eingetragen
- [ ] `npm run dev` nach .env Änderung neu gestartet
- [ ] Test-Checkout durchgeführt mit Karte `4242 4242 4242 4242`
- [ ] Success Page erscheint
- [ ] In Terminal 1 erscheint "✅ ZAHLUNG ERFOLGREICH!"

---

**Fertig! 🎉** Du kannst jetzt lokal Zahlungen testen!
