# MEMORY.md - Langzeitgedächtnis

> **⚠️ WICHTIG: Lies `rules.md` bei jedem Session-Start!**
> 
> **Aktueller Stand: `current_state.md`**

---

## Arbeitsregeln (Verbindlich)

**→ Siehe `rules.md` für alle verbindlichen Arbeitsregeln**

**Kurzfassung:**
- Staging-first (immer)
- Git commit + push (immer)
- Dokumentation aktualisieren (immer)
- GDrive-Sync nach jedem Push

---

## Deployment-Workflow (WICHTIG)

### Ab 2026-02-06: Staging → Production

**Regel:** Nie wieder direkt auf Production arbeiten!

**Hosting:** Hetzner (NICHT Cloudflare Pages!)
- Production: Hetzner Server
- Staging: Hetzner Staging-Umgebung (oder Subdomain)

**Workflow:**
1. Änderungen auf `staging` Branch pushen
2. Deployment zu Staging testen
3. Testen & validieren
4. Merge zu `main` → Production Deployment

---

## Projekt: EduFunds

**Beschreibung:** Plattform für Förderprogramme und KI-Antragsassistent

**Tech Stack:**
- Next.js + React + TypeScript
- Tailwind CSS
- Hetzner (Hosting - kein Cloudflare!)
- Statischer Export → Hetzner Webserver

**Wichtige Dateien:**
- `data/foerderprogramme.json` - Alle Förderprogramme
- `lib/foerderSchema.ts` - TypeScript Schema
- `export-static.js` - Build-Skript (erzeugt `dist/`)
- `DEPLOY.md` - Deployment-Doku

---

## Entscheidungen & Learnings

### 2026-02-05: Sub-Agent Training
- Parallele Dateioperationen → Race Conditions
- Lösung: Sequentielle Ausführung oder finale Zusammenführung

### 2026-02-06: Staging-Setup
- Production-only Arbeit ist riskant
- Staging-Umgebung für alle zukünftigen Änderungen

### 2026-02-07: Hetzner Deployment
- Hosting ist Hetzner, nicht Cloudflare Pages
- Statischer Export nach `dist/`, dann Upload zu Hetzner
- GitHub Actions für CI/CD (Deployment zu Hetzner)

---

## TODOs

- [x] 50 Förderprogramme vervollständigen (✅ Done)
- [ ] GitHub Repo pushen (sauberes Reset)
- [ ] Hetzner Deployment-Workflow einrichten
- [ ] `staging` Branch erstellen
