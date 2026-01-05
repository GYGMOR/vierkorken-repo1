# 🚀 Deployment Konfigurationen

Dieses Verzeichnis enthält alle Deployment-Konfigurationen für VIERKORKEN.

## 📁 Dateien

### Docker Compose Konfigurationen

- **[docker-compose.production.yml](./docker-compose.production.yml)**
  - Production-Setup für standalone Docker Deployment
  - Verwendet externes `web` Netzwerk
  - Konfiguriert für VLAN 20 (192.168.20.10:8080)
  - MariaDB in VLAN 30 (192.168.30.10)
  - **Verwendung:** `docker-compose -f deployment/docker-compose.production.yml up -d`

- **[PORTAINER-STACK-READY.yml](./PORTAINER-STACK-READY.yml)**
  - Optimiert für Portainer Stack Deployment
  - Identisch mit docker-compose.production.yml
  - **Verwendung:** In Portainer kopieren und als neuen Stack erstellen

- **[docker-compose.FERTIG.yml](./docker-compose.FERTIG.yml)**
  - Backup der finalen Konfiguration
  - Für Referenz und Disaster Recovery

## ⚙️ Konfiguration

### Erforderliche ENV-Variablen

Alle Deployment-Dateien verwenden Platzhalter für sensible Daten:

```yaml
# Datenbank
DATABASE_URL: "mysql://vierkorken_app:PASSWORD@192.168.30.10:3306/vierkorken"

# Authentication
NEXTAUTH_SECRET: "YOUR_NEXTAUTH_SECRET"  # Generiere mit: openssl rand -hex 32

# Stripe (optional für Test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_..."
STRIPE_SECRET_KEY: "sk_live_..."

# Microsoft Graph API (E-Mail)
MS_TENANT_ID: "YOUR_MS_TENANT_ID"
MS_CLIENT_ID: "YOUR_MS_CLIENT_ID"
MS_CLIENT_SECRET: "YOUR_MS_CLIENT_SECRET"

# Klara API (optional)
KLARA_API_KEY: "YOUR_KLARA_API_KEY"
KLARA_API_SECRET: "YOUR_KLARA_API_SECRET"
```

### Secrets generieren

```bash
# NEXTAUTH_SECRET / JWT_SECRET generieren
openssl rand -hex 32
```

## 📚 Weitere Informationen

- **E-Mail Setup:** Siehe [docs/EMAIL-SETUP-QUICKSTART.md](../docs/EMAIL-SETUP-QUICKSTART.md)
- **Production Setup:** Siehe [docs/PRODUCTION-SETUP.md](../docs/PRODUCTION-SETUP.md)
- **API Keys:** Siehe [docs/API-KEYS-ANLEITUNG.md](../docs/API-KEYS-ANLEITUNG.md)

## 🔐 Sicherheit

**WICHTIG:**
- ⚠️ Niemals echte Credentials in Git committen!
- ✅ Verwende Platzhalter in YAML-Dateien
- ✅ Trage echte Werte nur in Portainer/Production ein
- ✅ Nutze `.env` für lokale Entwicklung

## 🐳 Deployment Steps

### 1. Portainer Stack (Empfohlen)

1. Gehe zu Portainer → Stacks
2. Klicke "Add Stack"
3. Name: `vierkorken-production`
4. Kopiere Inhalt von `PORTAINER-STACK-READY.yml`
5. Ersetze alle `YOUR_*` Platzhalter mit echten Werten
6. Klicke "Deploy the stack"

### 2. Docker Compose CLI

```bash
# Production starten
docker-compose -f deployment/docker-compose.production.yml up -d

# Logs anzeigen
docker-compose -f deployment/docker-compose.production.yml logs -f

# Stoppen
docker-compose -f deployment/docker-compose.production.yml down
```

## 🔄 Updates

Nach Code-Änderungen:

```bash
# Neues Image bauen
docker build -t ghcr.io/gygmor/vierkorken-repo1:latest .

# Image pushen
docker push ghcr.io/gygmor/vierkorken-repo1:latest

# In Portainer: Stack → Update → Pull and redeploy
```

---

**Tipp:** Verwende immer `PORTAINER-STACK-READY.yml` für Production Deployments in Portainer!
