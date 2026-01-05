-- ============================================================
-- MariaDB Setup für VLAN-Zugriff
-- Webseite: VLAN 20 (192.168.20.10)
-- MariaDB:  VLAN 30 (192.168.30.10)
-- ============================================================

-- 1. Erstelle Datenbank (falls nicht vorhanden)
CREATE DATABASE IF NOT EXISTS vierkorken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Erstelle Benutzer für VLAN 20 Zugriff
-- WICHTIG: Ersetze 'YOUR_SECURE_PASSWORD' mit einem starken Passwort!

-- Benutzer der von überall im VLAN 20 zugreifen kann (192.168.20.%)
CREATE USER IF NOT EXISTS 'appuser'@'192.168.20.%' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON vierkorken.* TO 'appuser'@'192.168.20.%';

-- Benutzer für die spezifische IP der Webseite
CREATE USER IF NOT EXISTS 'appuser'@'192.168.20.10' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON vierkorken.* TO 'appuser'@'192.168.20.10';

-- Optional: Benutzer für localhost (für direkten Zugriff)
CREATE USER IF NOT EXISTS 'appuser'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON vierkorken.* TO 'appuser'@'localhost';

-- 3. Aktualisiere Berechtigungen
FLUSH PRIVILEGES;

-- 4. Zeige alle Benutzer und ihre Zugriffsrechte
SELECT User, Host FROM mysql.user WHERE User = 'appuser';

-- 5. Überprüfe die Berechtigungen
SHOW GRANTS FOR 'appuser'@'192.168.20.%';
SHOW GRANTS FOR 'appuser'@'192.168.20.10';

-- ============================================================
-- WICHTIG: MariaDB Container muss mit bind-address=0.0.0.0 laufen
--
-- Überprüfen mit:
-- docker exec -it <mariadb-container> cat /etc/mysql/my.cnf
--
-- Sollte enthalten:
-- [mysqld]
-- bind-address = 0.0.0.0
--
-- ODER beim Docker-Start:
-- docker run -d \
--   --name mariadb \
--   -e MYSQL_ROOT_PASSWORD=rootpassword \
--   -e MYSQL_DATABASE=vierkorken \
--   -e MYSQL_USER=appuser \
--   -e MYSQL_PASSWORD=YOUR_SECURE_PASSWORD \
--   -p 3306:3306 \
--   --network=bridge \
--   mariadb:latest \
--   --bind-address=0.0.0.0
-- ============================================================
