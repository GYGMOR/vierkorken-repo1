# Vierkorken Web App – Premium Wein-Boutique

## 📌 Letztes Update & Release Notes

**Datum & Uhrzeit:** 17. August 2026 – 11:22 Uhr (CH-Zeit)  
**Version:** 1.4.0 (Production Release)

### 🚀 Neue Features & Improvements in diesem Update:
1. **📊 Cloudflare-Style Web Analytics & Live Counter (`/admin/statistiken/webseite`)**:
   - Live-Besucher-Anzeige mit 10-Sekunden-Echtzeitaktualisierung.
   - Herkunftsanalyse (Schweiz 🇨🇭, Deutschland 🇩🇪, Österreich 🇦🇹, Google, Instagram).
   - SEO Health Audit (98/100, 115 indexierte Seiten, Ladezeit & Top Google-Keywords).
2. **👥 Vereinigte Benutzer- & Abonnentenverwaltung (`/admin/users`)**:
   - Zusammengefügtes Verzeichnis aller Kundenkonten, Newsletter- & Wartungsmodus-Abonnenten.
   - Filter-Tabs (`Alle`, `Mit Kundenkonto`, `Nur Newsletter`, `Admins`) mit Farbbadges.
   - 1-Klick **CSV Export** (`vierkorken_konten_export.csv`) für Mail-Marketing & CRM.
3. **🍷 Bearbeitbare Weinwissen-Seite & Blog-Verwaltung (`/weinwissen`)**:
   - Inline-Editierbarkeit aller Titel, Texte, Einleitungen und Wissenskarten (*Rebsorten, Verkostung, Lagerung, Food Pairing*).
   - Neues Blog- & Tages-Tipps Verwaltungsmodal zum Verfassen, Bearbeiten und Löschen von Fachberichten.
4. **👁️ Passwort-Sichtbarkeit Toggle**:
   - Augensymbol zum Ein-/Ausblenden des Passworts auf Mobile & Desktop (`/login`, `/registrieren`, `/passwort-zuruecksetzen`).
5. **🎟️ Event-Preise & Club-Anmelde-Flow**:
   - Regulärer Preis wird immer standardmässig angezeigt.
   - Nicht eingeloggte Nutzer erhalten beim Ticket-Klick ein 2-Button Club-Popup.
6. **⏰ Schweizer Zeitzone & Eigene Event-Uhrzeiten**:
   - Freie Eingabe von Start- & Endzeiten bei Events sowie Formatierung in `Europe/Zurich` für E-Mails & PDF-Tickets.
7. **🐳 Sicherer Docker-Compose Rebuild Workflow**:
   - GitHub Actions auf `workflow_dispatch` umgestellt. Rebuilds erfolgen sicher über Portainer/Docker-Compose ohne Volume-Verlust (`rebuild.sh`).

---

## 🛠️ Update auf dem Docker-Server durchführen
Nach einem `git push` auf dem Server einfach ausführen:
```bash
./rebuild.sh
```
oder im Portainer Stack (`docker-compose.FERTIG.yml`) auf **"Re-pull image & Re-deploy"** klicken.

---

## 📜 Update-Historie
- **17.08.2026 11:22**: Live Analytics, Vereinigte User-Liste mit CSV Export, Weinwissen Bearbeitung & Blog-System, Passwort Eye-Toggle, Event Timezone & Pricing Flow.
- **03.02.2026**: Initiales Deployment & Docker-Setup.
