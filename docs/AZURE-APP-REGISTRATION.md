# Azure App Registration für Microsoft Graph API

## 🎯 Ziel

Eine **App Registration** in Azure erstellen, damit deine App E-Mails über Microsoft Graph API senden kann.

**Vorteil gegenüber SMTP:**
- ✅ Keine SMTP Authentication Probleme
- ✅ Keine App-Passwörter nötig
- ✅ Moderne OAuth2 Authentifizierung
- ✅ Funktioniert mit Security Defaults
- ✅ Bessere Fehlerbehandlung

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Azure Portal öffnen

1. Gehe zu: https://portal.azure.com
2. Melde dich mit deinem **admin@vierkorken.ch** Account an
3. Suche nach **"App registrations"** (App-Registrierungen)

---

### Schritt 2: Neue App Registration erstellen

1. Klicke auf **"New registration"** (Neue Registrierung)
2. Fülle aus:
   - **Name:** `VIERKORKEN Email Service`
   - **Supported account types:** "Accounts in this organizational directory only (Single tenant)"
   - **Redirect URI:** Leer lassen (nicht benötigt)
3. Klicke auf **"Register"**

---

### Schritt 3: IDs kopieren

Nach der Erstellung siehst du die **Overview** Seite:

1. **Kopiere diese Werte:**
   - **Application (client) ID** → Das ist deine `MS_CLIENT_ID`
   - **Directory (tenant) ID** → Das ist deine `MS_TENANT_ID`

2. **Trage sie in `.env` ein:**
   ```bash
   MS_TENANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   MS_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

---

### Schritt 4: Client Secret erstellen

1. Klicke im linken Menü auf **"Certificates & secrets"**
2. Gehe zum Tab **"Client secrets"**
3. Klicke auf **"New client secret"**
4. Fülle aus:
   - **Description:** `VIERKORKEN Email Secret`
   - **Expires:** 24 months (empfohlen)
5. Klicke auf **"Add"**

6. **WICHTIG:** Kopiere sofort den **Value** (wird nur einmal angezeigt!)
7. **Trage ihn in `.env` ein:**
   ```bash
   MS_CLIENT_SECRET="dein-secret-value-hier"
   ```

---

### Schritt 5: API Permissions hinzufügen

1. Klicke im linken Menü auf **"API permissions"**
2. Klicke auf **"Add a permission"**
3. Wähle **"Microsoft Graph"**
4. Wähle **"Application permissions"** (NICHT Delegated!)
5. Suche und aktiviere:
   - ✅ `Mail.Send` - Erlaubt das Senden von E-Mails

6. Klicke auf **"Add permissions"**

7. **WICHTIG:** Klicke auf **"Grant admin consent for [Your Org]"**
   - Dieser Button ist **SEHR WICHTIG**!
   - Ohne diesen Schritt funktioniert es nicht!
   - Bestätige mit "Yes"

8. **Überprüfung:**
   - Neben `Mail.Send` sollte ein **grüner Haken** mit "Granted for..." stehen

---

### Schritt 6: Mailboxen vorbereiten

Die App braucht Zugriff auf die Mailboxen:

**Option A: Shared Mailboxes** (Empfohlen)

1. Gehe zu https://admin.microsoft.com
2. **Teams & groups** → **Shared mailboxes**
3. Erstelle (falls noch nicht vorhanden):
   - `info@vierkorken.ch`
   - `no-reply@vierkorken.ch`

**Option B: Reguläre Mailboxen**

Falls die Mailboxen bereits als reguläre User existieren, ist das auch OK!

---

### Schritt 7: .env Datei vervollständigen

Deine `.env` Datei sollte jetzt so aussehen:

```bash
# Microsoft Graph API für E-Mail-Versand
MS_TENANT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← Deine Tenant ID
MS_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← Deine Client ID
MS_CLIENT_SECRET="dein-secret-value"                 # ← Dein Secret

# E-Mail Absender
MAIL_FROM_INFO="info@vierkorken.ch"
MAIL_FROM_NOREPLY="no-reply@vierkorken.ch"
ADMIN_EMAIL="admin@vierkorken.ch"
```

---

### Schritt 8: Test durchführen

Führe das Test-Script aus:

```bash
node test-email-graph.js
```

**Erwartetes Ergebnis:**
```
✅ Authentifizierung erfolgreich!
✅ E-Mail erfolgreich gesendet! (info@)
✅ E-Mail erfolgreich gesendet! (no-reply@)

🎉 ALLE TESTS ERFOLGREICH!
```

Du solltest **2 Test-E-Mails** erhalten haben!

---

## ❌ Fehlerbehandlung

### Error: "AADSTS700016"

**Problem:** Application ID falsch

**Lösung:**
- Überprüfe `MS_CLIENT_ID` in `.env`
- Muss exakt mit "Application (client) ID" aus Azure übereinstimmen

---

### Error: "AADSTS7000215"

**Problem:** Client Secret falsch oder abgelaufen

**Lösung:**
1. Azure Portal → App registrations → Deine App
2. Certificates & secrets
3. Erstelle neues Secret
4. Kopiere und trage in `.env` ein

---

### Error: "ErrorSendAsDenied"

**Problem:** Mail.Send Permission fehlt oder nicht granted

**Lösung:**
1. Azure Portal → App registrations → Deine App
2. API permissions
3. Überprüfe ob `Mail.Send` **grüner Haken** hat
4. Falls nicht: "Grant admin consent" klicken!

---

### Error: "MailboxNotEnabledForRESTAPI"

**Problem:** Mailbox existiert nicht oder ist nicht aktiviert

**Lösung:**
- Überprüfe ob `info@vierkorken.ch` existiert
- Überprüfe ob `no-reply@vierkorken.ch` existiert
- Admin Center → Active users / Shared mailboxes

---

## 🔄 Migration von SMTP zu Graph API

Wenn du bereits die SMTP-Version verwendest:

### 1. Alte email.ts umbenennen (Backup)

```bash
mv src/lib/email.ts src/lib/email-smtp-backup.ts
```

### 2. Neue Graph API Version aktivieren

```bash
mv src/lib/email-graph.ts src/lib/email.ts
```

### 3. .env aktualisieren

Ersetze die SMTP Variablen durch Graph API Variablen:

**ALT (SMTP):**
```bash
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="admin@vierkorken.ch"
SMTP_PASS="..."
```

**NEU (Graph API):**
```bash
MS_TENANT_ID="..."
MS_CLIENT_ID="..."
MS_CLIENT_SECRET="..."
MAIL_FROM_INFO="info@vierkorken.ch"
MAIL_FROM_NOREPLY="no-reply@vierkorken.ch"
```

### 4. Test durchführen

```bash
node test-email-graph.js
```

### 5. Deployment aktualisieren

Vergiss nicht, die ENV-Variablen auch in deinem Production-System zu aktualisieren:
- Docker Compose YAML
- Portainer Stack
- etc.

---

## ✅ Checkliste

- [ ] Azure Portal geöffnet
- [ ] App Registration erstellt
- [ ] MS_TENANT_ID kopiert
- [ ] MS_CLIENT_ID kopiert
- [ ] Client Secret erstellt
- [ ] MS_CLIENT_SECRET kopiert
- [ ] API Permission `Mail.Send` hinzugefügt
- [ ] **Admin Consent granted** ✅
- [ ] IDs in `.env` eingetragen
- [ ] Mailboxen existieren (info@, no-reply@)
- [ ] Test-Script ausgeführt: `node test-email-graph.js`
- [ ] 2 Test-E-Mails erhalten

Wenn alle ✅ sind → **Graph API E-Mail-Versand funktioniert!** 🎉

---

## 📚 Weiterführende Links

- Azure App Registrations: https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps
- Microsoft Graph API Docs: https://learn.microsoft.com/en-us/graph/api/user-sendmail
- Mail.Send Permission: https://learn.microsoft.com/en-us/graph/permissions-reference#mailsend
