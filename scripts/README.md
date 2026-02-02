# 🛠️ Scripts

Dieses Verzeichnis enthält Hilfsskripte für Setup und Wartung.

## 📁 Dateien

### Datenbank Setup

- **[mariadb-setup.sql](./mariadb-setup.sql)**
  - SQL-Skript für MariaDB Initialisierung
  - Erstellt Datenbank, User und Berechtigungen
  - Konfiguriert für VLAN 30 (192.168.30.10)

  **Verwendung:**
  ```bash
  mysql -h 192.168.30.10 -u root -p < scripts/mariadb-setup.sql
  ```

## 📚 Weitere Scripts

Zukünftige Scripts werden hier abgelegt:
- Backup-Scripts
- Migration-Scripts
- Maintenance-Scripts
- Monitoring-Scripts

---

**Tipp:** Alle Scripts sind dokumentiert und können direkt ausgeführt werden.
