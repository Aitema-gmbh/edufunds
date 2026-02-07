# EduFunds - Hetzner Deployment Guide

## 🚀 Schnellstart

### Umgebungen

| Umgebung | Branch | Deployment | Verwendung |
|----------|--------|------------|------------|
| **Staging** | `staging` | Hetzner Staging | Testen & Validieren |
| **Production** | `main` | Hetzner Production | Live-System |

**Hosting:** Hetzner (kein Cloudflare Pages!)

---

## 🔧 Einrichtung

### 1. Repository klonen

```bash
git clone https://github.com/Aitema-gmbh/edufunds.git
cd edufunds
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Statischen Export erstellen

```bash
node export-static.js
```

Erzeugt den `dist/` Ordner mit allen statischen Dateien.

---

## 📋 Deployment-Workflow

### Manuell zu Hetzner deployen

```bash
# 1. Build erstellen
node export-static.js

# 2. Zu Hetzner uploaden (via SSH/SCP/FTP)
# Beispiel mit SCP:
scp -r dist/* root@dein-hetzner-server:/var/www/edufunds/

# Beispiel mit rsync:
rsync -avz --delete dist/ root@dein-hetzner-server:/var/www/edufunds/
```

### Automatisiertes Deployment (GitHub Actions → Hetzner)

#### Secrets einrichten (GitHub Repository):
- `HETZNER_HOST` → Server IP oder Domain
- `HETZNER_USER` → SSH Username
- `HETZNER_SSH_KEY` → Private SSH Key
- `HETZNER_PATH` → Zielpfad auf Server (z.B. `/var/www/edufunds`)

#### Workflows:
- `.github/workflows/deploy.yml` → Production (auf `main` Push)
- `.github/workflows/deploy-staging.yml` → Staging (auf `staging` Push)

### Standard-Workflow (empfohlen)

```bash
# 1. Änderungen auf Staging pushen
git checkout staging
git merge feature-branch
git push origin staging

# 2. Automatisches Deployment zu Hetzner Staging
# → Deployment URL prüfen

# 3. Testen & validieren

# 4. Wenn alles passt: Production deployen
git checkout main
git merge staging
git push origin main

# 5. Automatisches Deployment zu Hetzner Production
```

---

## 🐛 Troubleshooting

### Build fehlschlägt
- Node.js Version 18+ erforderlich
- `export-static.js` braucht keine NPM Dependencies

### Daten nicht sichtbar
- Prüfe `data/foerderprogramme.json` ist vorhanden
- Prüfe ob JSON valide ist: `node -e "JSON.parse(require('fs').readFileSync('./data/foerderprogramme.json'))"`

### Deployment schlägt fehl
- SSH-Zugang zu Hetzner testen: `ssh root@dein-server`
- Zielverzeichnis existiert? `ls -la /var/www/`
- Berechtigungen prüfen: `chown -R www-data:www-data /var/www/edufunds`

---

## 📁 Wichtige Dateien

- `export-static.js` - Generiert statische HTML aus JSON
- `data/foerderprogramme.json` - Die Förderprogramm-Daten
- `dist/` - Output Ordner (wird generiert, nicht einchecken!)
- `.github/workflows/` - GitHub Actions für CI/CD

---

## ⚠️ Wichtige Regeln

1. **Nie direkt auf Production arbeiten** (außer echte Notfälle)
2. **Immer erst auf Staging testen**
3. **Staging und Production sollten identisch sein** (außer den Daten)
4. **dist/ nicht einchecken** - wird bei Build erzeugt

---

*Aktualisiert: 2026-02-07 (Hetzner statt Cloudflare Pages)*
