FROM alpine:3.19

# MySQL Client + Cron installieren
RUN apk add --no-cache \
    mysql-client \
    dcron \
    tzdata \
    bash

# Zeitzone setzen (Schweiz)
ENV TZ=Europe/Zurich
RUN cp /usr/share/zoneinfo/Europe/Zurich /etc/localtime && \
    echo "Europe/Zurich" > /etc/timezone

# Backup-Script kopieren
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Cron-Job einrichten: Alle 2 Stunden
RUN echo "0 */2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1" | crontab -

# Backup-Verzeichnis erstellen
RUN mkdir -p /backups

# Startscript: Cron starten + ersten Backup sofort machen
CMD ["sh", "-c", "echo '🚀 Backup-Service gestartet' && /usr/local/bin/backup.sh && crond -f -l 2"]
