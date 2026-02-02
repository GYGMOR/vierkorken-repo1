# 🚀 Production Setup - Was du noch machen musst

## ✅ Was bereits gefixt wurde (im Code)

1. **Prisma aus Middleware entfernt** - Edge Runtime kompatibel ✅
2. **Node.js Runtime zu allen API Routes hinzugefügt** - Prisma kann jetzt laufen ✅
3. **Maintenance Mode nutzt nur ENV Variable** - Kein DB-Zugriff in Middleware ✅

---

## 🔧 Was DU jetzt in Portainer machen musst

### 1️⃣ NEXTAUTH_SECRET setzen (PFLICHT!)

**Warum?**
```
[next-auth][error][NO_SECRET] Please define a secret in production.
```
Ohne dieses Secret funktioniert der Login in Production **NIE**!

---

### 📋 Schritt-für-Schritt Anleitung

#### **Schritt 1: Secret generieren**

**Option A - Im Container generieren:**
```bash
# Verbinde dich mit deinem Container
docker exec -it <container-name> sh

# Generiere Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Kopiere die Ausgabe (z.B.: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...)
```

**Option B - Auf deinem Linux Server:**
```bash
# Mit OpenSSL
openssl rand -hex 32

# Oder mit Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C - Online (nur für Dev/Test!):**
https://generate-secret.now.sh/32

**Das Ergebnis sieht aus wie:**
```
a7f3e9c2b8d1f4a6e3b7c9d2f5a8e1b3c6d9f2a5e8b1c4d7f0a3e6b9c2d5f8a1
```

---

#### **Schritt 2: In Portainer setzen**

1. **Öffne Portainer** → Stack: `vierkorken` (oder wie dein Stack heisst)

2. **Klicke auf "Editor"** (oder "Stack bearbeiten")

3. **Füge im `environment:` Abschnitt hinzu:**

```yaml
version: '3.8'

services:
  web:
    image: ghcr.io/gygmor/vierkorken-repo1:latest
    container_name: vierkorken-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # Bestehende Variablen...
      DATABASE_URL: "mysql://appuser:DEIN_PASSWORD@192.168.30.10:3306/vierkorken"
      NODE_ENV: "production"

      # ⚠️ WICHTIG - DIESE ZEILEN HINZUFÜGEN:
      NEXTAUTH_URL: "https://deine-domain.tld"
      NEXTAUTH_SECRET: "a7f3e9c2b8d1f4a6e3b7c9d2f5a8e1b3c6d9f2a5e8b1c4d7f0a3e6b9c2d5f8a1"

      # Optional aber empfohlen:
      MAINTENANCE_MODE: "false"
```

**Ersetze:**
- `https://deine-domain.tld` → Deine echte Domain (z.B. `https://vierkorken.ch`)
- `a7f3e9c2b8...` → Dein generiertes Secret

---

#### **Schritt 3: Stack aktualisieren**

1. **Klicke auf "Update the stack"** (unten rechts)
2. ✅ **Checkbox aktivieren**: "Re-pull image and redeploy"
3. **Klicke "Update"**

Der Container wird neu gestartet und zieht das neue Image von GitHub.

---

### 2️⃣ DATABASE_URL prüfen (sollte schon gesetzt sein)

```yaml
DATABASE_URL: "mysql://appuser:DEIN_PASSWORT@192.168.30.10:3306/vierkorken"
```

**Wichtig:**
- IP: `192.168.30.10` (deine MariaDB im VLAN 30)
- User: `appuser` (oder dein DB-User)
- Password: **URL-encoded** falls Sonderzeichen (`@` → `%40`, `#` → `%23`)
- Database: `vierkorken`

---

### 3️⃣ Optional: Weitere wichtige Environment Variables

```yaml
environment:
  # === Datenbank ===
  DATABASE_URL: "mysql://appuser:PASSWORD@192.168.30.10:3306/vierkorken"

  # === NextAuth (PFLICHT!) ===
  NEXTAUTH_URL: "https://vierkorken.ch"
  NEXTAUTH_SECRET: "dein-generiertes-secret-hier"

  # === App ===
  NODE_ENV: "production"
  NEXT_PUBLIC_APP_URL: "https://vierkorken.ch"

  # === Email (falls du Email-Benachrichtigungen willst) ===
  SMTP_HOST: "smtp.example.com"
  SMTP_PORT: "587"
  SMTP_USER: "noreply@vierkorken.ch"
  SMTP_PASSWORD: "dein-smtp-password"
  EMAIL_FROM: "VIERKORKEN <noreply@vierkorken.ch>"

  # === Stripe (falls du Payments hast) ===
  STRIPE_SECRET_KEY: "sk_live_..."
  STRIPE_WEBHOOK_SECRET: "whsec_..."
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_..."

  # === Maintenance Mode (optional) ===
  MAINTENANCE_MODE: "false"
```

---

## 🔍 Wie prüfe ich, ob es funktioniert?

### Nach dem Update:

```bash
# 1. Prüfe Container Logs
docker logs -f vierkorken-web

# Suche nach Fehlern wie:
# ❌ [next-auth][error][NO_SECRET]  → Secret fehlt!
# ❌ PrismaClient is not configured  → Sollte jetzt weg sein!
# ❌ DATABASE_URL not found         → Sollte jetzt weg sein!

# Gute Zeichen:
# ✅ Server running on http://0.0.0.0:3000
# ✅ Ready in XXXms
```

### Login testen:

1. Gehe auf deine Webseite: `https://vierkorken.ch/login`
2. Versuche dich anzumelden
3. Sollte jetzt funktionieren! 🎉

---

## 🚨 Troubleshooting

### Problem: "NO_SECRET" Fehler bleibt

**Lösung:**
1. Prüfe ob `NEXTAUTH_SECRET` korrekt gesetzt ist:
   ```bash
   docker exec vierkorken-web sh -c 'echo $NEXTAUTH_SECRET'
   ```
   Sollte dein Secret ausgeben (nicht leer!)

2. Container komplett neu starten:
   ```bash
   docker restart vierkorken-web
   ```

---

### Problem: "Prisma Edge Runtime" Fehler bleibt

**Lösung:**
1. Stelle sicher, dass das neue Image gepullt wurde:
   ```bash
   docker pull ghcr.io/gygmor/vierkorken-repo1:latest
   ```

2. Container mit neuem Image starten:
   ```bash
   docker-compose down
   docker-compose up -d --force-recreate
   ```

---

### Problem: Login funktioniert, aber DB-Fehler

**Lösung:**
1. Prüfe DB-Verbindung (siehe `VLAN-DB-SETUP.md`)
2. Führe Prisma Migration aus:
   ```bash
   docker exec vierkorken-web npx prisma migrate deploy
   ```

---

## 📚 Zusammenfassung - Checkliste

- [ ] **NEXTAUTH_SECRET generiert** (mit `openssl rand -hex 32`)
- [ ] **NEXTAUTH_URL gesetzt** (z.B. `https://vierkorken.ch`)
- [ ] **DATABASE_URL korrekt** (mit IP 192.168.30.10)
- [ ] **Portainer Stack aktualisiert** (Environment Variablen hinzugefügt)
- [ ] **Stack updated** mit "Re-pull image and redeploy"
- [ ] **Container Logs geprüft** (keine Fehler!)
- [ ] **Login getestet** (funktioniert!)

---

## ✅ Fertig!

Wenn alle Schritte erledigt sind, sollte:
- ✅ Login funktionieren
- ✅ Prisma mit DB verbinden
- ✅ Keine Edge Runtime Fehler mehr auftreten
- ✅ Die Webseite stabil laufen

---

## 🆘 Hilfe benötigt?

Falls etwas nicht funktioniert:
1. Schicke die **Container Logs**: `docker logs vierkorken-web`
2. Prüfe die **Environment Variables**: `docker exec vierkorken-web env | grep -E "DATABASE_URL|NEXTAUTH"`
3. Teste die **DB-Verbindung**: Siehe `VLAN-DB-SETUP.md`

Viel Erfolg! 🚀
