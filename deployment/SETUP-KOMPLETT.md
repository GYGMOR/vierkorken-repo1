# VIERKORKEN – Kompletter Stack Setup

## Was lauft in diesem Stack?

| Service | Port | Beschreibung |
|---------|------|-------------|
| App (Next.js) | :3000 | Vierkorken Website |
| Gitea (Git + Registry) | :3001 | Self-Hosted Git + Docker Images |
| Gitea SSH | :222 | Git via SSH pushen |
| MariaDB | intern | Datenbank (kein externer Zugriff) |
| Watchtower | - | Auto-Update der App |
| DB-Backup | - | SQL-Dumps alle 2h |

## Schritt 1: Server-IP eintragen

Auf dem Server (Linux), im ~/vierkorken/ Verzeichnis:

  sed -i 's/REPLACE_ME_SERVER_IP/192.168.1.100/g' docker-compose.KOMPLETT.yml
  mkdir -p ~/vierkorken/backups

## Schritt 2: Stripe & Azure Keys eintragen

REPLACE_ME_STRIPE_PUBLISHABLE_KEY  -> pk_live_...  (Stripe Dashboard)
REPLACE_ME_STRIPE_SECRET_KEY       -> sk_live_...
REPLACE_ME_STRIPE_WEBHOOK_SECRET   -> whsec_...
REPLACE_ME_AZURE_TENANT_ID         -> Azure Portal
REPLACE_ME_AZURE_CLIENT_ID
REPLACE_ME_AZURE_CLIENT_SECRET

## Schritt 3: Stack starten

  cd ~/vierkorken
  docker compose -f docker-compose.KOMPLETT.yml up -d

## Schritt 4: Gitea einrichten (NUR EINMAL!)

1. Browser: http://SERVER-IP:3001
2. Datenbank: SQLite lassen
3. App URL: http://SERVER-IP:3001  SSH Port: 222
4. Admin-Account anlegen (z.B. joel)
5. Installieren klicken -> fertig!

## Schritt 5: App-Image in Gitea pushen (auf lokalem PC)

  docker login SERVER-IP:3001 -u joel
  docker build -t SERVER-IP:3001/joel/app:latest .
  docker push SERVER-IP:3001/joel/app:latest

## Schritt 6: App auf Gitea-Image umstellen

In docker-compose.KOMPLETT.yml die image: Zeile anpassen:
  image: SERVER-IP:3001/joel/app:latest

Dann: docker compose -f docker-compose.KOMPLETT.yml up -d app

## Workflow: Code deployen

  docker build -t SERVER-IP:3001/joel/app:latest .
  docker push SERVER-IP:3001/joel/app:latest
  # Watchtower erkennt automatisch und startet neu!

## Code nach Gitea pushen (Git)

  git remote add gitea http://SERVER-IP:3001/joel/vierkorken.git
  git push gitea main

## Alle Passwoerter

MariaDB Root:     RootPass2024!Vierkorken
MariaDB App:      vierkorken_app / FGDN8YEH1IiRei8
NextAuth Secret:  a6c9e17ed75401e1...
Gitea Admin:      Von dir beim Setup gewaehlt

## Troubleshooting

  docker compose -f docker-compose.KOMPLETT.yml logs -f
  docker compose -f docker-compose.KOMPLETT.yml ps
  docker logs vierkorken-gitea -f
  docker logs vierkorken-app -f
