# VIERKORKEN Admin Panel - Dokumentation

## Zugriff auf das Admin Panel

**URL**: `http://localhost:3000/admin`

**Voraussetzung**: Du musst als Admin eingeloggt sein.

### Admin-Benutzer erstellen

Führe dieses SQL-Statement in der Datenbank aus:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'deine-email@beispiel.com';
```

Oder erstelle ein neues Skript `make-admin.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'joel.hediger@sonnenberg-baar.ch'; // DEINE EMAIL HIER

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log('✅ User is now admin:', user.email);
  await prisma.$disconnect();
}

main();
```

Ausführen mit: `node make-admin.js`

---

## Admin Panel Struktur

### 1. Dashboard (`/admin`)
- **Statistiken**: Bestellungen, Umsatz, Benutzer, Tickets
- **Letzte Bestellungen**: Die 5 neuesten Bestellungen
- **Kommende Events**: Nächste geplante Events

### 2. Bestellungen (`/admin/orders`)
- **Alle Bestellungen** anzeigen und verwalten
- **Filter**: Ausstehend, Bestätigt, Versendet, Zugestellt
- **Aktionen**:
  - Details ansehen
  - Status ändern (Bestätigt → Versendet → Zugestellt)
  - Rechnung herunterladen

### 3. Weine (`/admin/wines`)
- **Weine erstellen, bearbeiten, löschen**
- **Varianten verwalten** (Jahrgang, Flaschengröße)
- **Preise anpassen**
- **Lagerbestand aktualisieren**
- **Bilder hochladen**

### 4. Events (`/admin/events`)
- **Events erstellen** mit allen Details
- **Kapazität verwalten**
- **Status ändern** (Draft, Published, Sold Out, Cancelled)
- **Teilnehmerliste** anzeigen

### 5. Tickets (`/admin/tickets`)
- **Alle Event-Tickets** anzeigen
- **Check-in Status** verwalten
- **Tickets manuell erstellen/stornieren**
- **QR-Codes** scannen und validieren

### 6. Benutzer (`/admin/users`)
- **Alle Benutzer** anzeigen
- **Loyalty Level** anpassen
- **Punkte manuell hinzufügen/abziehen**
- **Benutzer sperren/entsperren**

### 7. Einstellungen (`/admin/settings`)
- **Website-Einstellungen**
- **E-Mail-Vorlagen**
- **Versandkosten**
- **Mehrwertsteuer**

---

## API-Endpunkte für das Admin Panel

### Admin Stats
```
GET /api/admin/stats
```

### Bestellungen
```
GET /api/admin/orders?filter=all|pending|confirmed|shipped
GET /api/admin/orders/[id]
PATCH /api/admin/orders/[id]  // Status ändern
```

### Weine
```
GET /api/admin/wines
POST /api/admin/wines  // Neuen Wein erstellen
PATCH /api/admin/wines/[id]  // Wein bearbeiten
DELETE /api/admin/wines/[id]  // Wein löschen
```

### Events
```
GET /api/admin/events
POST /api/admin/events  // Neues Event erstellen
PATCH /api/admin/events/[id]  // Event bearbeiten
DELETE /api/admin/events/[id]  // Event löschen
```

### Benutzer
```
GET /api/admin/users
PATCH /api/admin/users/[id]  // Benutzer bearbeiten
```

---

## Häufige Admin-Aufgaben

### Bestellung bearbeiten

1. Gehe zu `/admin/orders`
2. Finde die Bestellung
3. Klicke auf "Details"
4. Ändere den Status:
   - **PENDING** → Zahlung ausstehend
   - **CONFIRMED** → Bezahlt und bestätigt
   - **SHIPPED** → Versandt (Tracking-Nummer eingeben)
   - **DELIVERED** → Zugestellt

### Neues Event erstellen

1. Gehe zu `/admin/events`
2. Klicke "Neues Event"
3. Fülle alle Felder aus:
   - Titel, Untertitel, Beschreibung
   - Datum & Uhrzeit
   - Veranstaltungsort
   - Kapazität
   - Preise (Normal & Member)
4. Lade ein Bild hoch
5. Status: `PUBLISHED`

### Wein hinzufügen

1. Gehe zu `/admin/wines`
2. Klicke "Neuer Wein"
3. Fülle alle Felder aus:
   - Name, Weingut, Region
   - Rebsorte, Typ (Rot/Weiß/Rosé)
   - Beschreibung
4. Erstelle Varianten:
   - Jahrgang
   - Flaschengröße (0.75l, 1.5l, etc.)
   - Preis
   - Lagerbestand
5. Lade Bilder hoch
6. Speichern

### Ticket check-in

1. Gehe zu `/admin/tickets`
2. Scanne QR-Code oder gib Ticket-Nummer ein
3. Klicke "Check-in"
4. Status ändert sich zu "CHECKED_IN"

---

## Sicherheit

### Admin-Zugriff beschränken

Alle Admin-Routes prüfen automatisch:
```typescript
// Prüft ob Benutzer eingeloggt ist
if (!session?.user?.email) {
  return redirect('/auth/signin');
}

// Prüft ob Benutzer Admin-Rolle hat
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
});

if (user.role !== 'ADMIN') {
  return { error: 'Keine Berechtigung' };
}
```

### Empfehlungen
- **Niemals Admin-Credentials teilen**
- **Zwei-Faktor-Authentifizierung** für Admin-Accounts aktivieren
- **Regelmäßig Logs prüfen**
- **Zugriff auf `/admin/*` nur über VPN** (in Produktion)

---

## Erweitern des Admin Panels

### Neue Admin-Seite hinzufügen

1. **Erstelle die Seite**: `src/app/admin/meine-seite/page.tsx`

```tsx
'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function MeineAdminSeite() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-light text-graphite-dark">
          Meine Seite
        </h1>
        <Card>
          <CardContent>
            {/* Dein Content */}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
```

2. **Füge Navigation hinzu**: `src/components/admin/AdminLayout.tsx`

```tsx
const navigation = [
  // ... existing items
  {
    name: 'Meine Seite',
    href: '/admin/meine-seite',
    icon: <YourIcon />
  },
];
```

3. **Erstelle API-Endpunkt** (optional): `src/app/api/admin/meine-daten/route.ts`

---

## Fehlerbehebung

### "Keine Berechtigung"
- Stelle sicher, dass dein Benutzer `role = 'ADMIN'` hat
- Führe das SQL-Statement aus oder nutze `make-admin.js`

### Statistiken werden nicht geladen
- Prüfe ob `/api/admin/stats` funktioniert
- Öffne Browser DevTools (F12) → Network Tab
- Prüfe auf Fehler in der Konsole

### Bilder werden nicht hochgeladen
- Stelle sicher, dass `public/uploads` existiert
- Prüfe Schreibrechte für den Ordner

---

## Nächste Schritte (Optional)

### Weitere Features, die du hinzufügen kannst:

1. **Bulk-Aktionen**: Mehrere Bestellungen gleichzeitig bearbeiten
2. **Export-Funktionen**: CSV/Excel Export von Bestellungen
3. **E-Mail-Benachrichtigungen**: Automatische E-Mails bei Statusänderungen
4. **Berichte**: Monatliche/Jährliche Umsatzberichte
5. **Rabatt-Codes**: Gutscheine erstellen und verwalten
6. **Newsletter**: Newsletter an Kunden versenden
7. **Inventar-Management**: Automatische Bestandswarnungen
8. **Analytics**: Detaillierte Verkaufsstatistiken

---

## Support

Bei Fragen oder Problemen:
1. Prüfe diese Dokumentation
2. Schaue in die Logs: Browser DevTools (F12)
3. Prüfe Server-Logs im Terminal

**Viel Erfolg mit deinem Admin Panel! 🎉**
