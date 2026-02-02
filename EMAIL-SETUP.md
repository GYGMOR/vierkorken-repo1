# E-Mail System Setup & Troubleshooting

## Problem: E-Mails kommen nicht an

Wenn E-Mails (Passwort-Reset, Bestellbestätigungen, etc.) nicht ankommen, liegt es meist an fehlenden Azure-Berechtigungen.

## ✅ Schritt-für-Schritt Lösung

### 1. Azure App Berechtigungen überprüfen

Gehe zu: https://portal.azure.com

1. **App Registrations** öffnen
2. Deine App suchen (Client ID: `f42c04d4-6320-4c4c-8deb-e1611c0a94ec`)
3. **API permissions** öffnen
4. Überprüfe ob folgende Berechtigungen vorhanden sind:

#### Benötigte Berechtigungen (Application Permissions):

```
✅ Mail.Send                  (Microsoft Graph)
✅ User.Read.All              (Microsoft Graph)
```

**ODER** (wenn Shared Mailbox verwendet wird):

```
✅ Mail.Send.Shared           (Microsoft Graph)
✅ User.Read.All              (Microsoft Graph)
```

#### So fügst du Berechtigungen hinzu:

1. Klicke auf **"Add a permission"**
2. Wähle **"Microsoft Graph"**
3. Wähle **"Application permissions"** (NICHT Delegated!)
4. Suche nach **"Mail.Send"** und aktiviere es
5. Suche nach **"User.Read.All"** und aktiviere es
6. Klicke auf **"Add permissions"**
7. **WICHTIG:** Klicke auf **"Grant admin consent for [Tenant]"**
8. Warte 2-5 Minuten bis die Änderungen aktiv sind

### 2. Mailbox-Berechtigungen überprüfen

Die App braucht Zugriff auf die Mailbox `info@vierkorken.ch`:

#### Option A: Shared Mailbox (Empfohlen)

1. Gehe zu **Microsoft 365 Admin Center**
2. **Teams & groups** → **Shared mailboxes**
3. Öffne `info@vierkorken.ch`
4. Füge die App hinzu (falls möglich)

#### Option B: User Mailbox

Stelle sicher, dass `info@vierkorken.ch` eine normale User-Mailbox ist (kein Alias).

### 3. E-Mail-System testen

Rufe auf: **https://test.vierkorken.ch/api/test-email**

Das gibt dir detaillierte Informationen:

```json
{
  "timestamp": "2025-01-05T...",
  "environment": {
    "MS_TENANT_ID": "✅ Set",
    "MS_CLIENT_ID": "✅ Set",
    "MS_CLIENT_SECRET": "✅ Set",
    "MAIL_FROM_INFO": "info@vierkorken.ch"
  },
  "tests": [
    {
      "name": "Credentials Check",
      "status": "✅ PASS"
    },
    {
      "name": "Token Acquisition",
      "status": "✅ PASS"
    },
    {
      "name": "Mailbox Access",
      "status": "✅ PASS",
      "mailbox": {
        "displayName": "Info",
        "mail": "info@vierkorken.ch"
      }
    },
    {
      "name": "Send Test Email",
      "status": "✅ PASS",
      "recipient": "regideh221@gmail.com"
    }
  ],
  "overallStatus": "✅ ALL TESTS PASSED"
}
```

### 4. Häufige Fehler

#### ❌ "Insufficient privileges to complete the operation"

**Lösung:** Die App hat nicht die `Mail.Send` Berechtigung oder Admin Consent fehlt.

1. Gehe zu Azure Portal → App Registrations
2. Füge `Mail.Send` Berechtigung hinzu
3. Klicke auf "Grant admin consent"

#### ❌ "Access denied"

**Lösung:** Die App hat keinen Zugriff auf die Mailbox.

1. Überprüfe ob `info@vierkorken.ch` existiert
2. Stelle sicher, dass es eine echte Mailbox ist (kein Alias)
3. Versuche `Mail.Send.Shared` Berechtigung statt `Mail.Send`

#### ❌ "Mailbox not found"

**Lösung:** Die E-Mail-Adresse existiert nicht.

1. Überprüfe in Microsoft 365 Admin Center ob `info@vierkorken.ch` existiert
2. Warte 5-10 Minuten nach Erstellung der Mailbox

#### ❌ "Request timed out"

**Lösung:** Microsoft Graph API ist langsam oder nicht erreichbar.

1. Überprüfe `EMAIL_TIMEOUT` in docker-compose.yml (sollte mindestens 8000 sein)
2. Teste nochmal in 5 Minuten

## 🔍 Debug-Befehle

### Test-E-Mail senden (an eigene E-Mail)

```bash
curl https://test.vierkorken.ch/api/test-email?email=deine@email.com
```

### Docker Logs ansehen

```bash
docker-compose logs -f app
```

Achte auf diese Zeilen:
```
📧 Sending info-mail to: ...
✅ Info-Mail sent to: ... (1234ms)
```

## 📧 Welche E-Mails werden von wo gesendet?

| E-Mail-Typ | Von | An |
|------------|-----|-----|
| Passwort-Reset | `info@vierkorken.ch` | User |
| Bestellbestätigung | `info@vierkorken.ch` | User |
| Bestellung (Admin) | `info@vierkorken.ch` | `admin@vierkorken.ch` |
| Newsletter | `info@vierkorken.ch` | User |
| Kontaktformular | `info@vierkorken.ch` | `admin@vierkorken.ch` |

## ✅ Checkliste

- [ ] Azure App hat `Mail.Send` oder `Mail.Send.Shared` Berechtigung
- [ ] Azure App hat `User.Read.All` Berechtigung
- [ ] Admin Consent wurde erteilt
- [ ] `info@vierkorken.ch` Mailbox existiert
- [ ] Test-Endpunkt zeigt alle Tests grün: `https://test.vierkorken.ch/api/test-email`
- [ ] Test-E-Mail kam an (auch Spam-Ordner geprüft!)
- [ ] `EMAIL_TIMEOUT: "8000"` in docker-compose.yml gesetzt

## 🆘 Immer noch nicht funktioniert?

1. Schicke mir den Output von: `https://test.vierkorken.ch/api/test-email`
2. Schicke mir die Docker Logs: `docker-compose logs app | tail -100`
3. Screenshots vom Azure Portal (API permissions)
