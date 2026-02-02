# VLAN Datenbank-Verbindung Setup

## Problem
- **Webseite**: VLAN 20 (192.168.20.10)
- **MariaDB**: VLAN 30 (192.168.30.10)
- Verbindung funktioniert nicht, obwohl Firewall konfiguriert ist

## Checkliste zur Fehlerbehebung

### 1. Netzwerk-Konnektivität testen

```bash
# Von der Webseite (VLAN 20) aus testen:
ping 192.168.30.10

# Telnet Test für Port 3306
telnet 192.168.30.10 3306

# Oder mit netcat
nc -zv 192.168.30.10 3306

# Curl Test
curl telnet://192.168.30.10:3306
```

**Erwartetes Ergebnis**: Verbindung wird hergestellt (auch wenn kryptische Zeichen erscheinen - das ist normal)

---

### 2. MariaDB Container Konfiguration prüfen

```bash
# Zeige laufende Container
docker ps | grep mariadb

# Prüfe bind-address Konfiguration
docker exec -it <mariadb-container-name> grep bind-address /etc/mysql/my.cnf

# Zeige MariaDB Logs
docker logs <mariadb-container-name>

# Prüfe, ob MariaDB auf allen Interfaces lauscht
docker exec -it <mariadb-container-name> netstat -tulpn | grep 3306
```

**WICHTIG**: MariaDB muss mit `bind-address=0.0.0.0` konfiguriert sein!

**Falsches Setup** (nur localhost):
```
bind-address = 127.0.0.1
```

**Korrektes Setup** (alle Interfaces):
```
bind-address = 0.0.0.0
```

---

### 3. MariaDB Benutzer-Berechtigungen

```bash
# Verbinde dich mit MariaDB Container
docker exec -it <mariadb-container-name> mysql -u root -p

# In MariaDB SQL:
USE mysql;

# Zeige alle Benutzer
SELECT User, Host FROM mysql.user;

# Prüfe ob appuser für VLAN 20 existiert
SELECT User, Host FROM mysql.user WHERE User = 'appuser';
```

**Häufiger Fehler**: Benutzer existiert nur für `localhost` oder `%`, aber nicht für `192.168.20.%`

**Lösung**: Führe `mariadb-setup.sql` aus:

```bash
# Kopiere SQL-Datei in Container
docker cp mariadb-setup.sql <mariadb-container-name>:/tmp/

# Führe aus
docker exec -it <mariadb-container-name> mysql -u root -p vierkorken < /tmp/mariadb-setup.sql
```

**ODER manuell**:

```sql
CREATE USER 'appuser'@'192.168.20.%' IDENTIFIED BY 'YOUR_PASSWORD';
GRANT ALL PRIVILEGES ON vierkorken.* TO 'appuser'@'192.168.20.%';
FLUSH PRIVILEGES;
```

---

### 4. Database Connection Test

```bash
# Im Projekt-Verzeichnis
cd C:\vierkorken-Backups-dayli

# Installiere Abhängigkeiten (falls nötig)
npm install

# Passe test-db-connection.js an:
# - host: '192.168.30.10'
# - user: 'appuser'
# - password: 'DEIN_PASSWORT'
# - database: 'vierkorken'

# Führe Test aus
node test-db-connection.js
```

**Erwartete Ausgabe bei Erfolg**:
```
✅ TCP connection successful!
✅ Database authentication successful!
✅ Database query successful!
✅ ALL TESTS PASSED
```

---

### 5. Docker Container neu starten mit korrekter Konfiguration

Falls MariaDB nicht korrekt konfiguriert ist:

```bash
# Stoppe alten Container
docker stop <mariadb-container-name>
docker rm <mariadb-container-name>

# Starte neu mit bind-address=0.0.0.0
docker run -d \
  --name mariadb-vierkorken \
  --network bridge \
  -p 192.168.30.10:3306:3306 \
  -e MYSQL_ROOT_PASSWORD=DEIN_ROOT_PASSWORT \
  -e MYSQL_DATABASE=vierkorken \
  -e MYSQL_USER=appuser \
  -e MYSQL_PASSWORD=DEIN_APP_PASSWORT \
  -v mariadb-data:/var/lib/mysql \
  mariadb:latest \
  --bind-address=0.0.0.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci
```

---

### 6. Firewall Konfiguration (OPNsense/pfSense)

**Regel hinzufügen**:
- **Quelle**: VLAN 20 (192.168.20.0/24) oder spezifisch 192.168.20.10
- **Ziel**: VLAN 30 (192.168.30.10)
- **Port**: 3306 (TCP)
- **Aktion**: ALLOW

**Teste Firewall-Regel**:
```bash
# Von VLAN 20 aus (Webseiten-Container)
nc -zv 192.168.30.10 3306
```

---

### 7. DATABASE_URL in .env konfigurieren

Nach erfolgreichem Test, aktualisiere die `.env` Datei:

```env
DATABASE_URL="mysql://appuser:DEIN_PASSWORT@192.168.30.10:3306/vierkorken"
```

**WICHTIG**:
- Wenn das Passwort Sonderzeichen enthält, muss es URL-encoded werden:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

**Beispiel**:
```env
# Passwort: Pass@word#123
DATABASE_URL="mysql://appuser:Pass%40word%23123@192.168.30.10:3306/vierkorken"
```

---

### 8. Prisma Migration

Nach erfolgreicher Verbindung:

```bash
# Generiere Prisma Client
npx prisma generate

# Push Schema zur Datenbank
npx prisma db push

# Oder führe Migrationen aus
npx prisma migrate deploy
```

---

## Häufige Fehler & Lösungen

### Fehler: `ETIMEDOUT` oder `ECONNREFUSED`
**Ursache**: Netzwerkverbindung fehlgeschlagen
**Lösung**:
1. Prüfe Firewall-Regeln
2. Teste mit `telnet 192.168.30.10 3306`
3. Prüfe, ob MariaDB läuft: `docker ps`

### Fehler: `ER_ACCESS_DENIED_ERROR`
**Ursache**: Falsche Zugangsdaten oder keine Berechtigung
**Lösung**:
1. Prüfe Benutzername/Passwort
2. Erstelle Benutzer für VLAN 20: Siehe Schritt 3

### Fehler: `ER_BAD_DB_ERROR`
**Ursache**: Datenbank existiert nicht
**Lösung**: `CREATE DATABASE vierkorken;`

### Fehler: `Can't connect to MySQL server`
**Ursache**: MariaDB lauscht nur auf 127.0.0.1
**Lösung**:
1. Setze `bind-address=0.0.0.0`
2. Starte MariaDB Container neu

---

## Docker-Compose Beispiel (Optional)

Falls du docker-compose verwendest:

```yaml
version: '3.8'

services:
  mariadb:
    image: mariadb:latest
    container_name: mariadb-vierkorken
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: vierkorken
      MYSQL_USER: appuser
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mariadb-data:/var/lib/mysql
    ports:
      - "192.168.30.10:3306:3306"
    command:
      - --bind-address=0.0.0.0
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    networks:
      - vlan30

volumes:
  mariadb-data:

networks:
  vlan30:
    driver: bridge
```

---

## Quick Test Cheat Sheet

```bash
# 1. Network Test
ping 192.168.30.10
nc -zv 192.168.30.10 3306

# 2. MariaDB Running?
docker ps | grep mariadb

# 3. Bind Address Check
docker exec -it <container> grep bind-address /etc/mysql/my.cnf

# 4. User Check
docker exec -it <container> mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='appuser';"

# 5. Connection Test
node test-db-connection.js

# 6. Prisma Test
npx prisma db push --preview-feature
```

---

## Support

Bei weiteren Problemen, überprüfe:
1. Docker Netzwerk-Modus
2. Host-Firewall (iptables)
3. MariaDB Logs: `docker logs <container>`
4. Container Netzwerk: `docker inspect <container> | grep IPAddress`
