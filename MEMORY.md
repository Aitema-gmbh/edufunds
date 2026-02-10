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

### 2026-02-09: **KRITISCHER VORFALL - Docker Port-Binding**
**Was passiert ist:**
- `docker run -p 80:80` blockierte Port 80
- Traefik konnte nicht starten
- **ALLE Websites down** (edufunds, sailhub, demo, supabase, etc.)
- Kompletter Server-Ausfall für alle Kunden

**Fehlerursache:**
- Unwissenheit über Server-Infrastruktur
- Traefik ist zentraler Reverse Proxy für ALLE Sites
- Port 80/443 gehören EXKLUSIV Traefik
- Keine Prüfung vor dem Deployment

**Konsequenzen:**
- Systemausfall für alle Kunden
- SSL-Zertifikate gefährdet
- Vertrauensverlust

**Lösung:**
- Immer `--network hetzner-stack_web` verwenden
- Immer Traefik-Labels verwenden
- NIE `docker run -p 80:80` 
- Vorher `/root/hetzner-stack/docker-compose.yml` lesen

**Neue strikte Regeln:**
1. Docker-Regeln haben höchste Priorität
2. Port 80/443 sind TABU für direkte Bindings
3. Bei Unsicherheit: FRAGEN, nicht raten
4. Vor Docker-Änderungen: Traefik-Status prüfen

**Dokumentation:**
- Siehe `rules.md` Abschnitt 0: Docker-Regeln

---

## TODOs

### ✅ Abgeschlossen
- [x] 50 Förderprogramme vervollständigen (✅ Done - aktuell 43, Ziel: 100)
- [x] GitHub Repo pushen (✅ Done)
- [x] Hetzner Deployment-Workflow einrichten (✅ Done - GitHub Actions Docker Deploy)
- [x] `staging` Branch erstellen (✅ Done)
- [x] PostgreSQL Backup einrichten (✅ Done - täglich 02:30 Uhr)
- [x] Health Monitoring einrichten (✅ Done - alle 5 Minuten)
- [x] Footer doppelte Links entfernt (✅ Done)
- [x] Schulform-Filter entfernt (✅ Done - nur Grundschulen)
- [x] Glasscard Labels korrigiert (✅ Done - "Bundesmittel", "Landesmittel" etc.)
- [x] Registrierungs- und Checkout-Seiten erstellt (✅ Done)

### 🔄 In Arbeit (Priorität Hoch)
- [ ] **Icons in Glasscards** - Werden nicht angezeigt trotz Code-Änderung
- [ ] **Förderprogramm-Links korrigieren** - Alle 43 Programme brauchen direkte Links zu Ausschreibungen, nicht nur Hauptseiten (z.B. bkm.de/foerderprogramm/xyz statt bkm.de)
- [ ] **"Für alle Schulformen" Texte entfernen** - Aus allen Beschreibungen streichen

### 📋 Offen (Priorität Mittel)
- [ ] 57 zusätzliche Förderprogramme recherchieren (Ziel: 100 Programme)
- [ ] www.edufunds.org DNS anpassen (Cloudflare Proxy deaktivieren)
- [ ] Zahlungssystem (Stripe/PayPal) integrieren
- [ ] GitHub Secrets einrichten für Auto-Deployment
