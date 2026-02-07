# Sub-Agent Training: Lessons Learned

## Datum: 2026-02-05
## Projekt: EduFunds Förderprogramm-Datenbank

---

## ✅ Was funktioniert hat

### 1. Chunk-Strategie (sequentiell)
- **Erfolg:** 5 Chunks mit je 10 Programmen
- **Methode:** Ein Sub-Agent pro Chunk, sequentiell ausführen
- **Ergebnis:** Saubere Datenbank mit 50 Programmen

### 2. Klare Instruktionen
```
VORGEHEN:
1. Lies Datei X
2. Erstelle Y Programme mit Z Eigenschaften
3. Schreibe Ergebnis nach Datei X
4. Prüfe: jq '. | length' muss N ergeben
```

### 3. Validierungsregeln
- Eindeutige IDs (keine Duplikate)
- Korrekte foerdergeberTyp-Werte
- Alle Pflichtfelder vorhanden
- JSON-Syntax-Check nach jedem Chunk

---

## ❌ Was NICHT funktioniert hat

### 1. Parallele Chunk-Verarbeitung
**Problem:** Race Conditions beim Datei-Zugriff
- Chunk 3 und 4 wurden parallel gestartet
- Ergebnis: Datei wurde überschrieben statt erweitert
- Nur 26 statt 40 Programme

**Lösung:** Immer sequentiell arbeiten lassen

### 2. Zu vage Instruktionen
**Falsch:** "Füge einige Programme hinzu"
**Richtig:** "Füge genau 10 Programme mit foerdergeberTyp='land' hinzu"

### 3. Fehlende Pflichtfelder-Validierung
**Problem:** Einige Programme hatten fehlende Felder
**Lösung:** Schema-Validierung vor dem Speichern

---

## 📋 Best Practices für zukünftige Sub-Agent Einsätze

### Vor dem Start:
1. **Backup erstellen:** `cp datei.json datei.backup.json`
2. **Chunk-Größe:** Max. 10-15 Einträge pro Sub-Agent
3. **Klare IDs:** Eindeutige Identifier für jeden Eintrag

### In der Instruktion:
1. **Input/Output:** Eindeutige Dateipfade
2. **Validierungsregeln:** Konkrete Prüfungen (jq-Befehle)
3. **Fehlerbehandlung:** Was bei Konflikten tun?

### Nach dem Sub-Agent:
1. **Ergebnis prüfen:** `jq '. | length'`
2. **Stichproben:** Einige Einträge manuell kontrollieren
3. **Backup löschen:** Nur wenn alles OK

---

## 🔧 Technische Tools

### Nützliche jq-Befehle:
```bash
# Anzahl prüfen
jq '. | length' datei.json

# Duplikate finden
jq 'group_by(.id) | map(select(length > 1))' datei.json

# Filter testen
jq '[.[] | select(.foerdergeberTyp == "land")]' datei.json

# Schema-Validierung
jq 'map({id, name, foerdergeber, schulformen})' datei.json
```

### Python-Alternative (für komplexe Validierung):
```python
import json
with open('datei.json') as f:
    data = json.load(f)
    assert len(data) == 50
    assert all('grundschule' in p['schulformen'] for p in data)
```

---

## 📊 EduFunds: Finale Datenbank-Statistik

| Kategorie | Anzahl | % |
|-----------|--------|---|
| Bund | 10 | 20% |
| Land | 16 | 32% |
| Stiftung | 14 | 28% |
| EU | 5 | 10% |
| Sonstige | 5 | 10% |
| **Gesamt** | **50** | **100%** |

**Qualitätsmerkmale:**
- ✅ Alle Programme fördern Grundschulen
- ✅ Keine Duplikate
- ✅ JSON-Valide
- ✅ Schema-konform

---

## 🎯 Empfehlungen für nächste Projekte

1. **Immer sequentiell arbeiten** bei Datei-Operationen
2. **Validierungsskripte** vorab erstellen
3. **Beispieldatensatz** als Referenz bereitstellen
4. **Rollback-Plan:** Backup-Strategie etablieren

---

*Dokumentation erstellt von: Milo*
*Datum: 2026-02-05*
