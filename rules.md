# EduFunds - Arbeitsregeln

> **Verbindliche Regeln für alle Arbeitssessions**
> 
> Stand: 9. Februar 2026
> Letzte Aktualisierung: 9. Februar 2026

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

- [ ] `rules.md` lesen
- [ ] `current_state.md` lesen
- [ ] `git status` + `git pull` (auf neuestem Stand?)
- [ ] Branch prüfen (sollte `staging` sein für Entwicklung)
- [ ] `MEMORY.md` prüfen (falls im Main Session)

---

## 6. CONVENTIONAL COMMITS

**Format:** `<type>: <beschreibung>`

| Type | Verwendung |
|------|-----------|
| `feat:` | Neue Features |
| `fix:` | Bugfixes |
| `docs:` | Dokumentation |
| `refactor:` | Code-Refactoring |
| `test:` | Tests hinzufügen/ändern |
| `chore:` | Wartung, Dependencies |

**Beispiele:**
- `feat: Add PDF export functionality`
- `fix: Repair broken footer links`
- `docs: Update deployment guide`

---

## 7. BRANCH-STRATEGIE

| Branch | Zweck |
|--------|-------|
| `main` | Production (nur getestete Staging-Änderungen) |
| `staging` | Entwicklung, Tests |

**Keine Feature-Branches** ohne Absprache.

---

## 8. DEPLOYMENT-REGELN

1. **Staging:** Automatisch oder manuell nach push auf `staging`
2. **Production:** Nur nach erfolgreichem Staging-Test
3. **Nie direkt:** Keine Ausnahmen von Staging → Production

---

*Diese Regeln sind verbindlich. Bei Unklarheiten fragen — aber Regeln nicht ignorieren.*

*Erstellt am: 9. Februar 2026*
*Ersteller: Kolja Schumann*
*Akzeptiert von: Milo (AI Assistant)*
