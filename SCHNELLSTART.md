# ⚡ SCHNELLSTART - Minimum Setup

## 🎯 Was du SOFORT brauchst (3 Schritte):

### 1️⃣ NEXTAUTH_SECRET generieren (30 Sekunden)

```bash
openssl rand -hex 32
```

**Kopiere das Ergebnis!** Beispiel:
```
a8f3c9e2b7d1f4a6e3b8c9d2f5a7e1b3c6d9f2a5e8b1c4d7f0a3e6b9c2d5f8a1
```

---

### 2️⃣ Stripe Test Account erstellen (5 Minuten)

1. **Registrieren:** https://dashboard.stripe.com/register
2. **Test Mode aktivieren** (Toggle oben rechts)
3. **API Keys kopieren:** https://dashboard.stripe.com/test/apikeys

Du brauchst:
- **Publishable key**: `pk_test_51...`
- **Secret key**: `sk_test_51...`

---

### 3️⃣ Docker-Compose anpassen (2 Minuten)

**Kopiere dieses YAML in Portainer:**

```yaml
version: "3.8"

networks:
  web:
    external: true

services:
  app:
    image: ghcr.io/gygmor/vierkorken-repo1:latest
    container_name: vierkorken-app
    restart: unless-stopped
    networks:
      - web
    environment:
      # App
      NODE_ENV: "production"
      PORT: "3000"
      NEXT_PUBLIC_APP_URL: "http://192.168.20.10:8080"

      # Database (BEREITS KONFIGURIERT ✅)
      DATABASE_URL: "mysql://vierkorken_app:FGDN8YEH1IiRei8@192.168.30.10:3306/vierkorken"

      # NextAuth - SETZE DEIN GENERIERTES SECRET! ⚠️
      NEXTAUTH_URL: "http://192.168.20.10:8080"
      NEXTAUTH_SECRET: "SETZE_HIER_DEIN_GENERIERTES_SECRET"  # ⚠️ VON SCHRITT 1

      # Stripe - SETZE DEINE TEST KEYS! ⚠️
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_DEINE_KEY"  # ⚠️ VON SCHRITT 2
      STRIPE_SECRET_KEY: "sk_test_DEINE_KEY"                    # ⚠️ VON SCHRITT 2
      STRIPE_WEBHOOK_SECRET: ""  # Leer lassen für jetzt

      # Maintenance
      MAINTENANCE_MODE: "false"

    expose:
      - "3000"
```

**WICHTIG:**
- Ersetze `SETZE_HIER_DEIN_GENERIERTES_SECRET` mit deinem Secret aus Schritt 1
- Ersetze `pk_test_DEINE_KEY` mit deinem Publishable Key aus Schritt 2
- Ersetze `sk_test_DEINE_KEY` mit deinem Secret Key aus Schritt 2

---

## 🚀 Stack Updaten

1. Öffne Portainer → Dein Stack
2. Klicke "Editor"
3. Ersetze alles mit dem YAML oben
4. ✅ "Re-pull image and redeploy" aktivieren
5. Klicke "Update the stack"

---

## ✅ Fertig!

Nach 1-2 Minuten:

```bash
# Prüfe Logs
docker logs -f vierkorken-app
```

**Sollte zeigen:**
```
✅ Server running on http://0.0.0.0:3000
✅ Ready in XXXms
```

**Dann teste:**
- Login: http://192.168.20.10:8080/login
- Shop: http://192.168.20.10:8080/weine

---

## 📧 Email (Optional - später hinzufügen)

**Ohne Email funktioniert:**
- ✅ Login
- ✅ Bestellungen
- ✅ Stripe Zahlungen

**Ohne Email funktioniert NICHT:**
- ❌ Bestellbestätigungen per E-Mail
- ❌ Passwort-Reset

**Um Email zu aktivieren, füge hinzu:**

```yaml
# Gmail Beispiel
SMTP_HOST: "smtp.gmail.com"
SMTP_PORT: "587"
SMTP_USER: "deine-email@gmail.com"
SMTP_PASSWORD: "app-passwort"  # Google App-Passwort!
EMAIL_FROM: "VIERKORKEN <deine-email@gmail.com>"
```

**Anleitung:** Siehe `API-KEYS-ANLEITUNG.md` → Abschnitt "Email/SMTP"

---

## 🎯 Was du später brauchst (Production):

1. **Domain & SSL:** vierkorken.ch mit HTTPS
2. **Stripe Live Keys:** Wechsel von `pk_test_` zu `pk_live_`
3. **Email konfigurieren:** Für Bestellbestätigungen
4. **Webhook einrichten:** Stripe Webhook für Bestellbestätigungen

**Aber für JETZT kannst du testen! 🚀**

---

## 🆘 Probleme?

```bash
# Container Logs checken
docker logs vierkorken-app

# Container neu starten
docker restart vierkorken-app

# Stack komplett neu deployen
# → In Portainer: "Update the stack" mit ✅ "Re-pull image"
```

**Häufige Fehler:**
- `NO_SECRET` → NEXTAUTH_SECRET fehlt oder falsch
- `DATABASE_URL not found` → Sollte jetzt weg sein (gefixt!)
- `Stripe error` → Prüfe Stripe Keys

---

## 📚 Mehr Details?

- **Alle Schnittstellen:** Siehe `API-KEYS-ANLEITUNG.md`
- **Komplettes YAML:** Siehe `docker-compose.production.yml`
- **DB-Setup:** Siehe `VLAN-DB-SETUP.md`
