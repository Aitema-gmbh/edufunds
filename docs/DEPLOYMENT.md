# EduFunds Deployment Guide

## Übersicht

Diese Anleitung beschreibt das Deployment der EduFunds-Anwendung in verschiedenen Umgebungen:
- **Development**: Lokale Entwicklung mit Docker
- **Production**: Production-Deployment mit Traefik

## Voraussetzungen

### System-Requirements
- Docker 24.0+
- Docker Compose 2.20+
- Git
- 2GB RAM (mindestens)
- 10GB freier Speicherplatz

### Accounts & API Keys
- [Resend Account](https://resend.com) für E-Mail-Versand
- Domain (für Production)
- Server mit öffentlicher IP (für Production)

## Quick Start

### 1. Repository klonen

```bash
git clone https://github.com/edufunds/edufunds-app.git
cd edufunds-app
git checkout staging
```

### 2. Environment konfigurieren

```bash
# Template kopieren
cp .env.example .env.local

# Editor öffnen und Werte eintragen
nano .env.local
```

**Wichtige Werte:**
- `DATABASE_URL` - PostgreSQL Connection String
- `RESEND_API_KEY` - Von resend.com
- `ADMIN_EMAIL` - Für Benachrichtigungen

## Development Deployment

### Starten der Entwicklungsumgebung

```bash
# Datenbank und App starten
docker-compose up -d

# Logs anzehen
docker-compose logs -f nextjs

# Oder nur Datenbank (App lokal mit npm run dev)
docker-compose up -d postgres
```

### Zugriff
- **App**: http://localhost:3101
- **Datenbank**: localhost:5432
- **pgAdmin** (optional): http://localhost:5050

### Datenbank initialisieren

```bash
# Automatisch (beim ersten Postgres-Start)
# SQL-Skript wird ausgeführt: scripts/init-db.sql

# Oder manuell mit npm
npm install
npm run setup:db
```

### Entwicklungs-Workflow

```bash
# 1. Container starten
docker-compose up -d

# 2. Lokal entwickeln (optional für bessere Performance)
npm install
npm run dev

# 3. Änderungen committen
git add .
git commit -m "feat: neue Funktion"
git push origin staging

# 4. Container stoppen
docker-compose down
```

## Production Deployment

### 1. Server vorbereiten

```bash
# Docker und Docker Compose installieren
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Traefik Network erstellen
docker network create traefik-network
```

### 2. Traefik konfigurieren (einmalig)

Erstelle `traefik.yml`:

```yaml
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  insecure: true  # In Production: false + Basic Auth

providers:
  docker:
    exposedByDefault: false
    network: traefik-network

entryPoints:
  web:
    address: :80
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true
  
  websecure:
    address: :443

certificatesResolvers:
  letsencrypt:
    acme:
      email: office@aitema.de
      storage: /letsencrypt/acme.json
      tlsChallenge: {}

log:
  level: INFO

accessLog: {}
```

```bash
# Traefik starten
docker run -d \
  --name traefik \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v ./letsencrypt:/letsencrypt \
  -v ./traefik.yml:/traefik.yml:ro \
  --network traefik-network \
  traefik:v2.11
```

### 3. Production Environment

```bash
# .env.production erstellen
cp .env.example .env.production
nano .env.production
```

**Production-Werte:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://edufunds:STRONG_PASSWORD@postgres:5432/edufunds
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DOMAIN=edufunds.org
POSTGRES_PASSWORD=STRONG_PASSWORD
```

### 4. Application deployen

```bash
# Pull & Build
git pull origin staging
docker-compose -f docker-compose.prod.yml build

# Starten
docker-compose -f docker-compose.prod.yml up -d

# Status prüfen
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Backup-Service aktivieren

```bash
docker-compose -f docker-compose.prod.yml --profile backup up -d
```

## Deployment-Strategien

### Blue/Green Deployment

```bash
# Blue (aktiv): Port 3000
# Green (neu): Port 3001

# 1. Green deployen
docker-compose -f docker-compose.prod.yml -p edufunds-green up -d

# 2. Health Check
wget -q --spider http://localhost:3001/api/health

# 3. Traefik auf Green umleiten
# Labels in docker-compose anpassen

# 4. Blue stoppen
docker-compose -f docker-compose.prod.yml -p edufunds-blue down
```

### Rolling Update

```bash
# Zero-Downtime Update
docker-compose -f docker-compose.prod.yml up -d --build --no-deps nextjs
```

## Troubleshooting

### Container startet nicht

```bash
# Logs prüfen
docker-compose logs nextjs

# Häufige Probleme:
# - Port belegt: anderen Port in .env wählen
# - Datenbank nicht erreichbar: docker-compose up -d postgres
```

### Datenbank-Verbindung fehlgeschlagen

```bash
# Datenbank-Status
docker-compose exec postgres pg_isready -U edufunds

# Logs
docker-compose logs postgres

# Verbindung testen
docker-compose exec nextjs wget -q --spider postgres:5432
```

### SSL-Zertifikat Probleme

```bash
# Let's Encrypt Rate Limits prüfen
# acme.json löschen und neu generieren
rm letsencrypt/acme.json
docker-compose -f docker-compose.prod.yml restart
```

## Wartung

### Updates

```bash
# App aktualisieren
git pull origin staging
docker-compose -f docker-compose.prod.yml up -d --build

# Docker Images aktualisieren
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Backups

```bash
# Manuelles Backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U edufunds edufunds | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup wiederherstellen
gunzip < backup_20250101.sql.gz | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U edufunds -d edufunds
```

### Monitoring

```bash
# Container-Status
docker-compose -f docker-compose.prod.yml ps

# Ressourcen-Nutzung
docker stats

# Logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

## Rollback

```bash
# Letztes funktionierendes Image verwenden
docker-compose -f docker-compose.prod.yml down
git checkout <vorheriger-commit>
docker-compose -f docker-compose.prod.yml up -d --build

# Oder vorheriges Image
docker images edufunds
# docker tag edufunds:<old> edufunds:latest
```

## Security Checklist

- [ ] `.env.production` nicht im Git
- [ ] Starke Passwörter für Datenbank
- [ ] Firewall: Nur Ports 80, 443 öffnen
- [ ] Automatische Security Updates
- [ ] Backups verschlüsselt speichern
- [ ] Logs aufbewahren
- [ ] DSGVO-konforme Datenspeicherung

## Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs`
2. Health Check: `curl http://localhost/api/health`
3. Container Status: `docker-compose ps`
4. Dokumentation prüfen: `docs/ARCHITECTURE.md`

---

**Letzte Aktualisierung:** Februar 2025  
**Version:** 1.0.0
