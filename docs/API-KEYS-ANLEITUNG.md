# 🔑 API Keys & Schnittstellen Anleitung

## Übersicht - Was du brauchst:

| Schnittstelle | Zweck | Priorität |
|---------------|-------|-----------|
| **Database** | Produktdaten, Bestellungen, User | 🔴 KRITISCH |
| **NextAuth** | Login-System | 🔴 KRITISCH |
| **Stripe** | Online-Zahlungen | 🔴 KRITISCH |
| **Email/SMTP** | Bestellbestätigungen, Passwort-Reset | 🟡 WICHTIG |
| **Klara API** | Externe Produktdatenbank | 🟡 WICHTIG |
| **Nexi** | Alternative Zahlungen | 🟢 OPTIONAL |
| **Google Maps** | Standortkarte | 🟢 OPTIONAL |

---

## 1️⃣ DATABASE (MariaDB) - ✅ BEREITS KONFIGURIERT

```yaml
DATABASE_URL: "mysql://vierkorken_app:FGDN8YEH1IiRei8@192.168.30.10:3306/vierkorken"
```

**Status:** ✅ Fertig eingerichtet!

---

## 2️⃣ NEXTAUTH_SECRET - 🔴 MUSS GENERIERT WERDEN!

### **Was ist das?**
Secret für Session-Verschlüsselung und Login-System.

### **Wie bekomme ich es?**

**Auf deinem Server:**
```bash
openssl rand -hex 32
```

**Ausgabe (Beispiel):**
```
a8f3c9e2b7d1f4a6e3b8c9d2f5a7e1b3c6d9f2a5e8b1c4d7f0a3e6b9c2d5f8a1
```

**Im Docker-Compose setzen:**
```yaml
NEXTAUTH_SECRET: "a8f3c9e2b7d1f4a6e3b8c9d2f5a7e1b3c6d9f2a5e8b1c4d7f0a3e6b9c2d5f8a1"
JWT_SECRET: "a8f3c9e2b7d1f4a6e3b8c9d2f5a7e1b3c6d9f2a5e8b1c4d7f0a3e6b9c2d5f8a1"  # Kann gleiches Secret sein
```

**⚠️ WICHTIG:** Ohne dieses Secret funktioniert der Login NICHT!

---

## 3️⃣ STRIPE (Zahlungen) - 🔴 KRITISCH FÜR ONLINE-SHOP

### **Was ist Stripe?**
Zahlungsdienstleister für Kreditkarten, Twint, etc.

### **Wie bekomme ich die Keys?**

1. **Stripe Account erstellen:**
   - Gehe zu: https://dashboard.stripe.com/register
   - Registriere dich mit deiner Email
   - Verifiziere dein Geschäft (Name, Adresse, Bank-Details)

2. **API Keys finden:**
   - Öffne: https://dashboard.stripe.com/apikeys
   - Dort findest du:

#### **Publishable Key** (öffentlich):
```
pk_test_51ABC...  (Test)
pk_live_51ABC...  (Production)
```

#### **Secret Key** (geheim):
```
sk_test_51ABC...  (Test)
sk_live_51ABC...  (Production)
```

3. **Webhook Secret einrichten:**
   - Gehe zu: https://dashboard.stripe.com/webhooks
   - Klicke "Add endpoint"
   - URL: `https://vierkorken.ch/api/webhooks/stripe` (später mit echter Domain!)
   - Events auswählen:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Klicke "Add endpoint"
   - Kopiere den **Signing Secret**: `whsec_...`

### **Im Docker-Compose setzen:**

```yaml
# TEST KEYS (für lokales Testing):
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_51ABC..."
STRIPE_SECRET_KEY: "sk_test_51ABC..."
STRIPE_WEBHOOK_SECRET: "whsec_test_..."

# PRODUCTION KEYS (für Live-Shop):
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_51ABC..."
# STRIPE_SECRET_KEY: "sk_live_51ABC..."
# STRIPE_WEBHOOK_SECRET: "whsec_..."
```

**⚠️ WICHTIG:**
- Starte mit **Test Keys** für lokales Testing!
- Wechsle zu **Live Keys** wenn du live gehst
- **NIEMALS** Live Keys in GitHub committen!

---

## 4️⃣ EMAIL / SMTP (Benachrichtigungen) - 🟡 WICHTIG

### **Was wird es gebraucht?**
- Bestellbestätigungen an Kunden
- Passwort-Reset E-Mails
- Admin-Benachrichtigungen bei neuen Bestellungen

### **Optionen:**

#### **Option A: Gmail (Einfach)**

1. **Gmail App-Passwort erstellen:**
   - Gehe zu: https://myaccount.google.com/apppasswords
   - Wähle "Mail" und "Anderes Gerät"
   - Generiere Passwort
   - Kopiere das 16-stellige Passwort

2. **Im Docker-Compose:**
```yaml
SMTP_HOST: "smtp.gmail.com"
SMTP_PORT: "587"
SMTP_SECURE: "false"
SMTP_USER: "deine-email@gmail.com"
SMTP_PASSWORD: "abcd efgh ijkl mnop"  # App-Passwort
EMAIL_FROM: "VIERKORKEN <deine-email@gmail.com>"
```

#### **Option B: Eigener Mail-Server (z.B. Infomaniak, Hostpoint)**

```yaml
SMTP_HOST: "mail.infomaniak.com"  # Oder dein Provider
SMTP_PORT: "587"
SMTP_SECURE: "false"
SMTP_USER: "noreply@vierkorken.ch"
SMTP_PASSWORD: "dein-passwort"
EMAIL_FROM: "VIERKORKEN <noreply@vierkorken.ch>"
```

#### **Option C: SendGrid (Professionell)**

1. Account erstellen: https://signup.sendgrid.com/
2. API Key generieren
3. **Im Docker-Compose:**
```yaml
SMTP_HOST: "smtp.sendgrid.net"
SMTP_PORT: "587"
SMTP_SECURE: "false"
SMTP_USER: "apikey"
SMTP_PASSWORD: "SG.DEIN_API_KEY"
EMAIL_FROM: "VIERKORKEN <noreply@vierkorken.ch>"
```

**⚠️ WICHTIG:** Teste E-Mails erst lokal, bevor du live gehst!

---

## 5️⃣ KLARA API (Externe Produktdatenbank) - 🟡 WICHTIG

### **Was ist Klara?**
Externe Datenbank für Produktdaten (falls du diese nutzt).

### **Wie bekomme ich die Keys?**

1. **Bei Klara anmelden:**
   - Kontaktiere deinen Klara Account Manager
   - Oder: https://klara.ch/kontakt

2. **API Credentials erhalten:**
   - API URL (z.B. `https://api.klara.ch`)
   - API Key (z.B. `klara_live_abc123...`)

3. **Im Docker-Compose:**
```yaml
KLARA_API_URL: "https://api.klara.ch"
KLARA_API_KEY: "dein_api_key_hier"
```

**Falls du Klara NICHT verwendest:**
```yaml
# KLARA_API_URL: ""
# KLARA_API_KEY: ""
```
Einfach auskommentiert lassen!

---

## 6️⃣ NEXI Payment (Optional) - 🟢 OPTIONAL

### **Was ist Nexi?**
Schweizer Zahlungsdienstleister (Alternative zu Stripe).

### **Brauchst du das?**
- ✅ JA, wenn du zusätzlich zu Stripe auch Nexi anbieten willst
- ❌ NEIN, wenn Stripe alleine reicht

**Falls nicht benötigt:**
```yaml
NEXI_API_KEY: ""
NEXI_MERCHANT_ID: ""
```

---

## 7️⃣ Google Maps (Optional) - 🟢 OPTIONAL

### **Was wird es gebraucht?**
- Standortkarte auf "Kontakt" Seite
- Store Locator

### **Wie bekomme ich es?**

1. Gehe zu: https://console.cloud.google.com/
2. Erstelle neues Projekt
3. Aktiviere "Maps JavaScript API"
4. Gehe zu "APIs & Services" → "Credentials"
5. Erstelle "API Key"
6. Kopiere den Key

**Im Docker-Compose:**
```yaml
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "AIzaSyABC..."
```

---

## 📋 CHECKLISTE - Was du JETZT machen musst:

### **MINIMUM (zum Testen):**
- [x] Database - ✅ Bereits eingerichtet
- [ ] NEXTAUTH_SECRET - ⚠️ GENERIEREN!
- [ ] Stripe Test Keys - ⚠️ VON STRIPE DASHBOARD

### **FÜR PRODUCTION:**
- [ ] NEXTAUTH_SECRET - ✅ Generiert
- [ ] Stripe Live Keys - ⚠️ VON STRIPE DASHBOARD
- [ ] Email/SMTP - ⚠️ KONFIGURIEREN
- [ ] Klara API (falls verwendet) - ⚠️ VON KLARA
- [ ] Domain & SSL (https://vierkorken.ch)

### **OPTIONAL:**
- [ ] Nexi (nur wenn benötigt)
- [ ] Google Maps (nur wenn Karte gewünscht)
- [ ] Sentry (für Error Tracking)

---

## 🚀 NEXT STEPS:

### **1. Jetzt (Lokales Testing):**

```bash
# 1. NEXTAUTH_SECRET generieren
openssl rand -hex 32

# 2. Stripe Test Account erstellen
# → https://dashboard.stripe.com/register

# 3. Docker-Compose anpassen
# → Setze NEXTAUTH_SECRET
# → Setze Stripe TEST Keys
# → Optional: Email konfigurieren
```

### **2. Später (Production):**

```bash
# 1. Domain einrichten (vierkorken.ch)
# 2. SSL Zertifikat (Let's Encrypt)
# 3. Stripe auf LIVE Keys umstellen
# 4. Email SMTP konfigurieren
# 5. Alle URLs auf https:// ändern
```

---

## ⚡ QUICK START - MINIMUM SETUP:

**Kopiere das `docker-compose.production.yml` und setze:**

```yaml
# 1. NEXTAUTH_SECRET (generiert mit: openssl rand -hex 32)
NEXTAUTH_SECRET: "DEIN_GENERIERTES_SECRET"

# 2. Stripe Test Keys (von https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_..."
STRIPE_SECRET_KEY: "sk_test_..."
STRIPE_WEBHOOK_SECRET: "whsec_..."  # Optional für später

# 3. Email (optional für Tests, aber wichtig für Production)
SMTP_HOST: "smtp.gmail.com"
SMTP_USER: "deine-email@gmail.com"
SMTP_PASSWORD: "app-passwort"
```

**Dann: Stack in Portainer updaten mit "Re-pull image" ✅**

---

## 🆘 HILFE?

**Bei Problemen:**
1. Prüfe Container Logs: `docker logs vierkorken-app`
2. Teste einzelne Services
3. Siehe `TROUBLESHOOTING.md` (falls vorhanden)

**Wichtige Links:**
- Stripe Dashboard: https://dashboard.stripe.com/
- Stripe Docs: https://stripe.com/docs
- NextAuth Docs: https://next-auth.js.org/
