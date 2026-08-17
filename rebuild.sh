#!/bin/bash
# 🚀 Vier Korken - Manuelles Rebuild & Update Script für den Docker Server

set -e

echo "--------------------------------------------------"
echo "📦 1. Ziehe neuste Änderungen aus dem GitHub Repo..."
echo "--------------------------------------------------"
git pull origin main

echo ""
echo "--------------------------------------------------"
echo "🏗️ 2. Baue & Starte Docker Container neu..."
echo "--------------------------------------------------"
if [ -f "deployment/docker-compose.FERTIG.yml" ]; then
    docker compose -f deployment/docker-compose.FERTIG.yml up -d --build
elif [ -f "docker-compose.yml" ]; then
    docker compose up -d --build
else
    docker build -t vierkorken-app .
    docker stop app || true
    docker rm app || true
    docker run -d --name app --restart unless-stopped --network web -p 3000:3000 vierkorken-app
fi

echo ""
echo "--------------------------------------------------"
echo "🧹 3. Alte Docker-Bilder aufräumen..."
echo "--------------------------------------------------"
docker image prune -f

echo ""
echo "--------------------------------------------------"
echo "✅ Update erfolgreich! Status der Container:"
echo "--------------------------------------------------"
docker ps
