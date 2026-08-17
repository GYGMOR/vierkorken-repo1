# 🚀 Vierkorken – Build & Deploy Anleitung (Kein GitHub!)

## Einmalig: Voraussetzungen auf deinem Docker-Server

### 1. Caddy Docker Proxy installieren (falls noch nicht)
Caddy liest Container-Labels und konfiguriert sich automatisch.
In Portainer → Stacks → "Add Stack" → diesen Stack deployen:

```yaml
version: "3.8"
services:
  caddy:
    image: lucaslorentz/caddy-docker-proxy:latest
    container_name: caddy-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - caddy_data:/data
    networks:
      - web
    environment:
      CADDY_INGRESS_NETWORKS: web

networks:
  web:
    external: true

volumes:
  caddy_data:
```

> **Mit Cloudflare Tunnel:** Du brauchst Caddy nur intern.
> Cloudflare Tunnel → Caddy Port 80 (intern) → App Container

### 2. NAS-Mount einrichten (einmalig auf dem Docker-Host)
```bash
# NFS-Paket installieren (einmalig)
apt-get install nfs-common   # Debian/Ubuntu
# oder
apk add nfs-utils            # Alpine

# NAS mounten (⚠️ IP anpassen!)
mkdir -p /mnt/nas/vierkorken-backups
mount -t nfs NAS-IP:/pfad/zum/share /mnt/nas/vierkorken-backups

# Permanent (in /etc/fstab eintragen):
echo "NAS-IP:/share/vierkorken-backups /mnt/nas/vierkorken-backups nfs defaults 0 0" >> /etc/fstab
```

---

## 🔨 Workflow: App builden & deployen

### Schritt 1: Image lokal bauen (auf deinem PC)
```bash
# Im Projektverzeichnis (wo das Dockerfile liegt)
docker build -t DEINE-SERVER-IP:5000/vierkorken:latest .
```

### Schritt 2: Image zur lokalen Registry pushen
```bash
# Einmalig: Registry als "insecure" erlauben (da kein HTTPS lokal)
# Auf deinem PC in /etc/docker/daemon.json (oder Docker Desktop Settings):
# {
#   "insecure-registries": ["DEINE-SERVER-IP:5000"]
# }

docker push DEINE-SERVER-IP:5000/vierkorken:latest
```

### Schritt 3: Update live schalten
**Automatisch:** Watchtower erkennt das neue Image und startet die App in max. 5 Minuten neu.

**Manuell (sofort):** In Portainer → Stacks → vierkorken → "Update the stack"

---

## ✅ Checkliste: Stack in Portainer deployen

- [ ] `portainer-selfhosted.yml` öffnen
- [ ] Alle `⚠️` Werte anpassen (IP, Passwörter, Domain)
- [ ] NEXTAUTH_SECRET generieren: `openssl rand -hex 32`
- [ ] JWT_SECRET generieren: `openssl rand -hex 32`
- [ ] NAS gemountet auf Docker-Host
- [ ] In Portainer → Stacks → Add Stack
- [ ] YAML einkopieren → Deploy

---

## 🗄️ Backup-Übersicht

```
/mnt/nas/vierkorken-backups/
├── vierkorken_backup_2026-07-30_00-00.sql.gz
├── vierkorken_backup_2026-07-30_02-00.sql.gz
├── vierkorken_backup_2026-07-30_04-00.sql.gz
├── ... (alle 2 Stunden)
└── vierkorken_backup_2026-08-20_22-00.sql.gz
    ↑ Nach 21 Tagen: automatisch gelöscht
```

**Backup wiederherstellen:**
```bash
# Datei entpacken + in DB einspielen
gunzip -c vierkorken_backup_2026-07-30_12-00.sql.gz | mysql -h DB-IP -u vierkorken_app -p vierkorken
```

---

## 🌐 Cloudflare Tunnel Setup

```
Internet → Cloudflare → [verschlüsselter Tunnel] → Dein Server → Caddy → App
```

Im Cloudflare Dashboard (Zero Trust → Tunnels):
- Service: `http://localhost:80` ODER `http://caddy-proxy:80`
- Domain: `vierkorken.ch`

Caddy kümmert sich dann intern um das Routing zu den richtigen Containern via Labels.

---

## 📁 Dateistruktur

```
deployment/
├── portainer-selfhosted.yml    ← DAS ist dein Stack (in Portainer einkopieren)
├── db-backup/
│   ├── Dockerfile              ← Backup-Container Image
│   └── backup.sh               ← Backup-Script
└── BUILD-AND-PUSH.md           ← Diese Anleitung
```
