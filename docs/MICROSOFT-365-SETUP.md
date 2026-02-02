# Microsoft 365 SMTP Setup Anleitung

## 🚀 Schnelltest

Führe dieses Test-Script aus, um zu prüfen ob alles funktioniert:

```bash
node test-email-smtp.js
```

Das Script testet:
- ✅ SMTP Verbindung zu Microsoft 365
- ✅ Authentifizierung mit admin@vierkorken.ch
- ✅ E-Mail-Versand von info@vierkorken.ch
- ✅ E-Mail-Versand von no-reply@vierkorken.ch

---

## 📋 Voraussetzungen

### 1. Shared Mailboxes erstellt

Im Microsoft 365 Admin Center müssen folgende **Shared Mailboxes** existieren:

- ✉️ `info@vierkorken.ch`
- ✉️ `no-reply@vierkorken.ch`

**Wie erstellen:**
1. Gehe zu https://admin.microsoft.com
2. Teams & Gruppen → Shared Mailboxes → Add a shared mailbox
3. Name eingeben und E-Mail-Adresse festlegen

---

### 2. Send-As Rechte konfigurieren

**Wichtig:** Der Account `admin@vierkorken.ch` muss **Send-As** Rechte für beide Shared Mailboxes haben!

#### Option A: Über Admin Center (GUI)

1. Gehe zu https://admin.microsoft.com
2. **Teams & Gruppen** → **Shared Mailboxes**
3. Klicke auf **info@vierkorken.ch**
4. Gehe zum Tab **Members**
5. Klicke auf **Manage permissions** → **Send as**
6. Füge `admin@vierkorken.ch` hinzu
7. **Speichern**

Wiederhole für `no-reply@vierkorken.ch`!

#### Option B: Über PowerShell

```powershell
# Mit Exchange Online verbinden
Connect-ExchangeOnline

# Send-As Rechte für info@vierkorken.ch
Add-RecipientPermission -Identity "info@vierkorken.ch" -Trustee "admin@vierkorken.ch" -AccessRights SendAs

# Send-As Rechte für no-reply@vierkorken.ch
Add-RecipientPermission -Identity "no-reply@vierkorken.ch" -Trustee "admin@vierkorken.ch" -AccessRights SendAs

# Rechte überprüfen
Get-RecipientPermission -Identity "info@vierkorken.ch" | Where-Object {$_.Trustee -eq "admin@vierkorken.ch"}
Get-RecipientPermission -Identity "no-reply@vierkorken.ch" | Where-Object {$_.Trustee -eq "admin@vierkorken.ch"}
```

---

### 3. SMTP Authentication aktivieren

**Wichtig:** SMTP AUTH muss für `admin@vierkorken.ch` aktiviert sein!

1. Gehe zu https://admin.microsoft.com
2. **Users** → **Active users**
3. Klicke auf `admin@vierkorken.ch`
4. Gehe zum Tab **Mail**
5. Klicke auf **Manage email apps**
6. **Stelle sicher, dass "Authenticated SMTP" aktiviert ist** ✅
7. Speichern

---

### 4. Multi-Factor Authentication (MFA)

**Wenn MFA aktiviert ist**, musst du ein **App-Passwort** verwenden!

#### App-Passwort erstellen:

1. Gehe zu https://mysignins.microsoft.com/security-info
2. Melde dich als `admin@vierkorken.ch` an
3. Klicke auf **Add sign-in method** → **App password**
4. Name eingeben: "VIERKORKEN SMTP"
5. **Passwort kopieren** (wird nur einmal angezeigt!)
6. Trage es in `.env` als `SMTP_PASS` ein

**Ohne MFA:**
Verwende einfach dein normales Passwort als `SMTP_PASS`.

---

## ⚙️ .env Konfiguration

Stelle sicher, dass deine `.env` Datei korrekt ist:

```bash
# Email (Microsoft 365 SMTP)
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="admin@vierkorken.ch"
SMTP_PASS="dein-passwort-oder-app-passwort"  # ← HIER DEIN PASSWORT!
MAIL_FROM_INFO="info@vierkorken.ch"
MAIL_FROM_NOREPLY="no-reply@vierkorken.ch"
```

---

## 🧪 Test durchführen

1. **Stelle sicher, dass dein Passwort in `.env` eingetragen ist**

2. **Führe das Test-Script aus:**
   ```bash
   node test-email-smtp.js
   ```

3. **Erwartetes Ergebnis:**
   ```
   ✅ SMTP Verbindung erfolgreich!
   ✅ E-Mail erfolgreich gesendet! (info@)
   ✅ E-Mail erfolgreich gesendet! (no-reply@)

   🎉 ALLE TESTS ERFOLGREICH!
   ```

4. **Überprüfe dein Postfach** (`admin@vierkorken.ch`)
   Du solltest **2 Test-E-Mails** erhalten haben!

---

## ❌ Fehlerbehandlung

### Error: "535 Authentication failed"

**Ursache:** Falscher Benutzername oder Passwort

**Lösung:**
- Überprüfe `SMTP_USER` in `.env` (muss `admin@vierkorken.ch` sein)
- Überprüfe `SMTP_PASS` in `.env`
- Ist MFA aktiviert? → App-Passwort verwenden!
- SMTP Authentication aktiviert? (siehe oben)

---

### Error: "550 5.7.60 Client does not have permissions to send as this sender"

**Ursache:** Send-As Rechte fehlen!

**Lösung:**
1. Gehe ins Admin Center
2. Shared Mailbox öffnen (info@ oder no-reply@)
3. Send-As Rechte für `admin@vierkorken.ch` hinzufügen
4. **Warte 5-10 Minuten** (Rechte brauchen Zeit!)
5. Teste erneut mit `node test-email-smtp.js`

---

### Error: "ECONNREFUSED" oder "ETIMEDOUT"

**Ursache:** Port blockiert oder falscher Host

**Lösung:**
- Überprüfe Firewall (Port 587 muss erlaubt sein)
- Überprüfe `SMTP_HOST="smtp.office365.com"`
- Überprüfe `SMTP_PORT="587"`
- VPN aktiv? Manche VPNs blockieren SMTP!

---

## 📧 Verwendung im Code

Nach erfolgreichem Test kannst du E-Mails senden:

```typescript
import { sendInfoMail, sendNoReplyMail } from '@/lib/email';

// Normale E-Mail (von info@)
await sendInfoMail({
  to: 'kunde@example.com',
  subject: 'Bestellbestätigung',
  html: '<h1>Danke für deine Bestellung</h1>',
  text: 'Danke für deine Bestellung',
});

// Passwort-Reset E-Mail (von no-reply@)
await sendNoReplyMail({
  to: 'user@example.com',
  subject: 'Passwort zurücksetzen',
  html: '<h1>Passwort zurücksetzen</h1>',
  text: 'Passwort zurücksetzen',
});
```

---

## 🔐 Sicherheit

**Wichtig:**
- `.env` Datei wird **NICHT** zu GitHub gepusht (in `.gitignore`)
- Passwörter niemals in Code hardcoden!
- In Production (Docker/Portainer): ENV-Variablen im YAML setzen

---

## ✅ Checkliste

- [ ] Shared Mailboxes `info@` und `no-reply@` erstellt
- [ ] Send-As Rechte für `admin@vierkorken.ch` konfiguriert
- [ ] SMTP Authentication aktiviert
- [ ] MFA? → App-Passwort erstellt
- [ ] Passwort in `.env` eingetragen (`SMTP_PASS`)
- [ ] Test-Script ausgeführt: `node test-email-smtp.js`
- [ ] 2 Test-E-Mails im Postfach erhalten

Wenn alle ✅ sind → **E-Mail-Versand funktioniert!** 🎉
