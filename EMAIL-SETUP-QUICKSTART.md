# 📧 E-Mail Setup - Schnellstart

## 🚀 Was du jetzt machen musst:

### 1. Azure App Registration erstellen (10 Minuten)

Folge dieser Anleitung: **`AZURE-APP-REGISTRATION.md`**

**Kurz zusammengefasst:**
1. Gehe zu https://portal.azure.com
2. Erstelle eine neue **App Registration**
3. Kopiere diese 3 Werte:
   - `MS_TENANT_ID`
   - `MS_CLIENT_ID`
   - `MS_CLIENT_SECRET`
4. Füge **Mail.Send** Permission hinzu
5. **Grant Admin Consent** klicken! ← WICHTIG!

---

### 2. IDs in .env eintragen

Öffne die `.env` Datei und trage die 3 Werte ein:

```bash
MS_TENANT_ID="deine-tenant-id-hier"
MS_CLIENT_ID="deine-client-id-hier"
MS_CLIENT_SECRET="dein-client-secret-hier"
```

---

### 3. Test durchführen

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

Du solltest **2 Test-E-Mails** in deinem Postfach erhalten!

---

### 4. Port 3000 freigeben (falls nötig)

```bash
npx kill-port 3000
```

---

### 5. Dev-Server starten

```bash
npm run dev
```

Dann gehe auf http://localhost:3000 und teste den Checkout!

---

## ❌ Troubleshooting

### Test schlägt fehl?

1. **Siehe AZURE-APP-REGISTRATION.md** für detaillierte Fehlerbehandlung
2. Häufigste Probleme:
   - ❌ Admin Consent nicht geklickt
   - ❌ Falsche IDs in .env
   - ❌ Mailboxen existieren nicht

### Fragen?

Führe das Test-Script aus und zeig mir die Ausgabe:
```bash
node test-email-graph.js
```

---

## 📚 Dateien-Übersicht

- **`AZURE-APP-REGISTRATION.md`** - Komplette Schritt-für-Schritt Anleitung
- **`test-email-graph.js`** - Test-Script für Graph API
- **`src/lib/email-graph.ts`** - Neue E-Mail-Bibliothek mit Graph API
- **`.env`** - Deine ENV-Variablen (HIER die IDs eintragen!)

---

## ✅ Vorteile von Graph API vs. SMTP

- ✅ Keine App-Passwörter nötig
- ✅ Funktioniert mit Security Defaults
- ✅ Moderne OAuth2 Authentifizierung
- ✅ Bessere Fehlerbehandlung
- ✅ Keine Port-Blockaden

---

**Los geht's!** Folge den Schritten in `AZURE-APP-REGISTRATION.md` 🚀
