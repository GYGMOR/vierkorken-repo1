# ⚡ QUICK FIX - Sofort-Lösung

## 🎯 Das musst du JETZT machen:

### 1. Secret generieren (1 Minute)

**Im Container:**
```bash
docker exec -it vierkorken-web sh -c "node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
```

**ODER auf deinem Server:**
```bash
openssl rand -hex 32
```

**Kopiere die Ausgabe!** (z.B. `a7f3e9c2b8d1f4a6e3b7c9d2f5a8e1b3...`)

---

### 2. Portainer Stack bearbeiten (2 Minuten)

1. **Portainer öffnen** → Dein Stack
2. **"Editor"** klicken
3. **Im `environment:` Abschnitt hinzufügen:**

```yaml
environment:
  DATABASE_URL: "mysql://appuser:DEIN_PASSWORD@192.168.30.10:3306/vierkorken"

  # DIESE ZEILEN HINZUFÜGEN:
  NEXTAUTH_URL: "https://deine-domain.tld"
  NEXTAUTH_SECRET: "DEIN_GENERIERTES_SECRET_HIER_EINFÜGEN"
  MAINTENANCE_MODE: "false"
```

4. **"Update the stack"** klicken
5. ✅ **"Re-pull image"** aktivieren
6. **"Update"** klicken

---

### 3. Fertig! ✅

**Prüfen:**
```bash
docker logs -f vierkorken-web
```

**Sollte zeigen:**
- ✅ `Server running on http://0.0.0.0:3000`
- ✅ Keine Fehler mit "NO_SECRET"
- ✅ Keine Fehler mit "PrismaClient Edge Runtime"

**Login testen:**
→ Gehe auf deine Webseite und teste den Login!

---

## 🔥 Das war's!

**Was wurde gefixt:**
1. ✅ Prisma aus Middleware entfernt (im Code - schon gepusht)
2. ✅ Runtime zu allen API Routes hinzugefügt (im Code - schon gepusht)
3. ⚠️ NEXTAUTH_SECRET muss DU in Portainer setzen (siehe oben)

**Nach dem Update sollte alles funktionieren!** 🎉

---

📚 **Mehr Details?** → Siehe `PRODUCTION-SETUP.md`
🔧 **DB-Probleme?** → Siehe `VLAN-DB-SETUP.md`
