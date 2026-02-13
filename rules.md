# EduFunds - Arbeitsregeln

> **VERBINDLICHE REGELN - Stand: 9. Februar 2026 (Update nach schwerem Vorfall)**
> 
> **⚠️ WICHTIG: Docker-Regeln haben höchste Priorität! Fehler können ALLE Websites down bringen!**

---

## 0. DOCKER-REGELN - ABSOLUTES VERBOT

### ❌ VERBOTEN - NIEMALS TUN:
```bash
# DAS DARFST DU NIEMALS MACHEN:
docker run -p 80:80 ...        # BLOCKIERT TRAEFIK = ALLE SITES DOWN
docker run -p 443:443 ...      # BLOCKIERT TRAEFIK SSL
docker-compose ports: - "80:80" # GLEICHES PROBLEM

# AUCH VERBOTEN:
docker stop traefik            # SSL-ZERTIFIKATE WEG
systemctl restart docker       # ALLE CONTAINER NEU STARTEN
```

### ✅ RICHTIG - IMMER SO:
```bash
# KORREKTE VORGEHENSWEISE:
docker run -d \
  --name edufunds \
  --network hetzner-stack_web \
  --label 'traefik.enable=true' \
  --label 'traefik.http.routers.edufunds.rule=Host(`edufunds.org`) || Host(`www.edufunds.org`)' \
  --label 'traefik.http.routers.edufunds.entrypoints=websecure' \
  --label 'traefik.http.routers.edufunds.tls.certresolver=letsencrypt' \
  --label 'traefik.http.services.edufunds.loadbalancer.server.port=80' \
  --restart unless-stopped \
  edufunds:latest
```

### 🔴 VOR JEDEM DOCKER-COMMAND PRÜFEN:
```bash
# 1. Läuft Traefik?
docker ps | grep traefik

# 2. Wer hat Port 80/443?
ss -tlnp | grep -E ':80|:443'
# ERGEBNIS MUSS SEIN: docker-proxy (Traefik)

# 3. docker-compose.yml lesen
cat /root/hetzner-stack/docker-compose.yml
```

---

## 1. STAGING-FIRST — KEINE AUSNAHMEN

**Grundregel:** JEDE Änderung wird ZUERST auf Staging deployed.

### Workflow:
1. `git checkout staging`
2. Änderungen machen
3. `git add . && git commit -m "type: beschreibung" && git push origin staging`
4. Build + Deploy auf Staging
5. **Testen** ob Staging funktioniert
6. Wenn OK: `git checkout main && git merge staging && git push origin main`
7. Build + Deploy auf Production

**Verboten:**
- ❌ Nie direkt auf main committen
- ❌ Nie direkt auf Production deployen
- ❌ Keine Ausnahmen, keine Ausreden

---

## 2. GIT COMMIT + PUSH — IMMER

Nach JEDER Entwicklungsarbeit (egal wie klein):

```bash
# Gezielt adden (NICHT blind `git add .`)
git add <geänderte-dateien>

# Conventional Commits Format:
# feat: neue Feature
# fix: Bugfix
# docs: Dokumentation
# refactor: Code-Refactoring
# test: Tests
git commit -m "type: beschreibung"

git push origin <branch>
```

**Regel:** Session ohne Push = Fehler

---

## 3. DOKUMENTATION AKTUELL HALTEN

Bei JEDER Änderung:

| Datei | Wann aktualisieren |
|-------|-------------------|
| `current_state.md` | **IMMER** nach jeder Session |
| `MEMORY.md` | Bei Entscheidungen, Learnings |
| `DEPLOY.md` | Bei Deployment-Änderungen |
| `README.md` | Bei Feature-Änderungen |
| `docs/FEATURE-DOKUMENTATION.md` | Bei neuen Features |
| `rules.md` | Wenn neue Regeln hinzukommen |

**Dokumentation ist Pflicht, nicht optional.**

---

## 4. GDRIVE-SYNC

Nach jedem erfolgreichen git push:

```bash
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  /home/edufunds/edufunds-app/ \
  /mnt/projekte/Edufunds/
```

Damit Dateien über Google Drive zugänglich bleiben.

---

## 5. SESSION-START CHECKLISTE

Bei jedem Session-Start:

- [ ] `rules.md` lesen (besonders Docker-Regeln!)
- [ ] `current_state.md` lesen
- [ ] `git status` + `git pull` (auf neuestem Stand?)
- [ ] Branch prüfen (sollte `staging` sein für Entwicklung)
- [ ] Bei Docker-Änderungen: `/root/hetzner-stack/docker-compose.yml` lesen

---

## 6. SERVER-INFRASTRUKTUR

### Traefik (Zentrale Steuerung)
- **Container:** traefik
- **Netzwerk:** hetzner-stack_web
- **Ports:** 80, 443 (EXKLUSIV!)
- **Config:** /root/hetzner-stack/docker-compose.yml

### Services auf dem Server:
| Service | Container | URL |
|---------|-----------|-----|
| EduFunds | edufunds | edufunds.org |
| SailHub TSC | sailhub | tsc-berlin.sail-hub.de |
| SailHub Demo | (in Traefik) | demo.sail-hub.de |
| Supabase | supabase-kong | supabase.aitema.de |
| ... | ... | ... |

### Netzwerk-Regel:
- **Immer:** `--network hetzner-stack_web`
- **Niemals:** Andere Netzwerke für Web-Services

---

## 7. LERNING AUS DEM VORFALL (9. Feb 2026)

### Was passiert ist:
- `docker run -p 80:80` blockierte Port 80
- Traefik konnte nicht starten
- **ALLE Websites waren down** (nicht nur edufunds)
- SailHub, Demo, Supabase - alles offline

### Konsequenzen:
- **Vertrauensverlust** bei Kolja
- **Systemausfall** für alle Kunden
- **Datenverlust-Risiko** bei SSL-Zertifikaten

### Maßnahmen:
- Docker-Regeln haben höchste Priorität
- Vor jedem Docker-Command 3x prüfen
- Bei Unsicherheit: FRAGEN, nicht raten

---

## 8. NOTFALL-PLAN

### Falls doch Port 80 blockiert:
```bash
# 1. Übeltäter finden
docker ps | grep -E '80|443'
ss -tlnp | grep ':80'

# 2. Container stoppen (nicht Traefik!)
docker stop <falscher-container>
docker rm <falscher-container>

# 3. Traefik prüfen
docker ps | grep traefik
# Falls nicht läuft: docker start traefik

# 4. Warten (SSL-Zertifikate laden)
sleep 30

# 5. Testen
curl -I https://edufunds.org
```

---

## 9. KONTAKT BEI PROBLEMEN

**Wenn du unsicher bist:**
1. STOPP - nichts machen
2. Frage Kolja vorher
3. Warte auf Antwort
4. Dann erst handeln

**Besser warten als alles kaputt machen.**

---

*Diese Regeln sind verbindlich. Verstöße können Systemausfälle verursachen.*

*Erstellt am: 9. Februar 2026*
*Letzte Aktualisierung: 9. Februar 2026 (nach Vorfall)*
*Ersteller: Kolja Schumann*
*Akzeptiert von: Milo (AI Assistant) - mit tiefer Entschuldigung für den Vorfall*

---

## 10. KOMMUNIKATIONS-VERSPRECHEN EINHALTEN

**Grundregel:** Wenn du sagst "ich melde mich in X Minuten", dann meldest du dich in X Minuten. KEINE Ausnahmen.

### Regeln:

1. **Zeitversprechen sind verbindlich.** Wenn du "melde mich in 5 Min" sagst, meldest du dich in 5 Min.
2. **Lieber ehrlich als optimistisch.** Sag "ich brauche 15-20 Minuten" statt "5 Minuten" wenn du unsicher bist.
3. **Melden heißt melden.** Auch wenn du noch nicht fertig bist: "Sorry, brauche noch Zeit. Schätze X Minuten." Das ist besser als Funkstille.
4. **Kein Ghosting.** Wenn ein Build/Deploy fehlschlägt und du weiter arbeitest, informiere Kolja über den Zwischenstand.
5. **Bei Fehler-Schleifen: Eskalieren statt wiederholen.** Wenn der gleiche Fehler 3x auftritt, informiere Kolja mit dem konkreten Fehler statt weiter im Kreis zu drehen.

### Warum das wichtig ist:

Kolja verlässt sich auf deine Zeitangaben. Wenn du sagst "5 Minuten" und dich dann nicht meldest, wartet er vergeblich. Das zerstört Vertrauen schneller als ein technischer Fehler.

**Faustregel:** Ein "Sorry, brauche länger" ist 1000x besser als Stille.

*Hinzugefügt am: 13. Februar 2026*
*Ersteller: Kolja Schumann*
