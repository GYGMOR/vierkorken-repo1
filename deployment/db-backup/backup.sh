#!/bin/sh
# ============================================================
# VIERKORKEN – Automatisches SQL Backup Script
# Läuft alle 2 Stunden via Cron
# Rotierendes Schema: 3 Wochen (21 Tage) aufbewahren
# ============================================================

set -e

# Config (aus Umgebungsvariablen)
DB_HOST="${DB_HOST:-192.168.30.10}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-vierkorken}"
DB_USER="${DB_USER:-vierkorken_app}"
DB_PASSWORD="${DB_PASSWORD:-}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-21}"

# Timestamp für Dateiname
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M")
BACKUP_FILE="${BACKUP_DIR}/vierkorken_backup_${TIMESTAMP}.sql.gz"

# Backup-Verzeichnis sicherstellen
mkdir -p "${BACKUP_DIR}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  VIERKORKEN SQL Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏰ Zeit:       $(date '+%d.%m.%Y %H:%M:%S')"
echo "📂 Datei:      ${BACKUP_FILE}"
echo "🔄 Behalten:   ${RETENTION_DAYS} Tage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Dump erstellen + komprimieren
MYSQL_PWD="${DB_PASSWORD}" mysqldump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --user="${DB_USER}" \
  --single-transaction \
  --quick \
  --lock-tables=false \
  --routines \
  --triggers \
  --events \
  "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Dateigrösse anzeigen
SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "✅ Backup erstellt: ${SIZE}"

# ─────────────────────────────────────────────
# ROTATION: Backups älter als 21 Tage löschen
# (3 Wochen behalten, ab Woche 4 wird Woche 1 gelöscht)
# ─────────────────────────────────────────────
echo ""
echo "🧹 Alte Backups bereinigen (>${RETENTION_DAYS} Tage)..."
DELETED=0
find "${BACKUP_DIR}" -name "vierkorken_backup_*.sql.gz" -mtime +${RETENTION_DAYS} | while read OLD_FILE; do
  echo "   🗑️  Lösche: $(basename ${OLD_FILE})"
  rm -f "${OLD_FILE}"
  DELETED=$((DELETED+1))
done

# Übersicht aller vorhandenen Backups
echo ""
echo "📋 Vorhandene Backups:"
COUNT=$(find "${BACKUP_DIR}" -name "vierkorken_backup_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1)
echo "   Anzahl: ${COUNT} Dateien | Gesamt: ${TOTAL_SIZE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backup abgeschlossen!"
echo ""
