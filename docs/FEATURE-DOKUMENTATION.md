# EduFunds - Vollständige Feature-Dokumentation

**Stand:** 7. Februar 2026  
**Version:** 1.1.0 (mit allen Verbesserungen)

---

## 📋 Inhaltsverzeichnis

1. [Neue Features Übersicht](#neue-features-übersicht)
2. [1. Error Handling & Robustheit](#1-error-handling--robustheit)
3. [2. Formular-Validierung](#2-formular-validierung)
4. [3. Loading States & Skeletons](#3-loading-states--skeletons)
5. [4. SEO & 404 Seite](#4-seo--404-seite)
6. [5. Backup & Caching System](#5-backup--caching-system)
7. [6. Search & Filter](#6-search--filter)
8. [7. Unit Tests](#7-unit-tests)
9. [8. Accessibility (Barrierefreiheit)](#8-accessibility-barrierefreiheit)
10. [Technische Architektur](#technische-architektur)
11. [Deployment Guide](#deployment-guide)

---

## Neue Features Übersicht

### 🛡️ Robustheit
- ✅ Error Boundaries für Absturzsicherheit
- ✅ Umfassende Fehlerbehandlung
- ✅ Automatische Backups

### 🎯 User Experience
- ✅ Echtzeit-Formularvalidierung
- ✅ Loading Skeletons
- ✅ Fortschrittsindikatoren

### 🔍 Funktionalität
- ✅ Volltextsuche über 50+ Programme
- ✅ Multi-Filter (Fördergeber, Kategorien, Beträge)
- ✅ Smart-Caching für schnelle Ladezeiten

### 🌐 Qualität
- ✅ SEO-optimiert (Meta-Tags, Open Graph)
- ✅ Barrierefrei (ARIA, Keyboard, Screen Reader)
- ✅ Professionelle 404-Seite
- ✅ Unit Tests für kritische Funktionen

---

## 1. Error Handling & Robustheit

### 1.1 Error Boundaries

**Datei:** `components/ErrorBoundary.tsx`

Fängt JavaScript-Fehler in der Komponenten-Hierarchie ab:

```typescript
<ErrorBoundary>
  <KIAntragAssistent />
</ErrorBoundary>
```

**Features:**
- Fängt Runtime-Errors ab
- Zeigt benutzerfreundliche Fehlermeldung
- "Erneut versuchen" Button
- Fehler-Logging für Debugging

### 1.2 Try-Catch Blocks

**Implementiert in:**
- `lib/ki-antrag-generator.ts` - Antragsgenerierung
- `app/api/foerderprogramme/route.ts` - API-Routen
- `components/KIAntragAssistent.tsx` - Datenladen

**Beispiel:**
```typescript
try {
  const antrag = await generateAntrag(programm, projektDaten);
} catch (error) {
  console.error('Antragsgenerierung fehlgeschlagen:', error);
  setError('Fehler bei der Generierung. Bitte versuchen Sie es erneut.');
}
```

### 1.3 Fallback-UI

**Datei:** `app/error.tsx`

- Professionelles Fehler-Layout
- Automatischer Retry-Mechanismus
- Kontakt-Informationen
- Link zur Startseite

---

## 2. Formular-Validierung

### 2.1 Echtzeit-Validierung

**Datei:** `components/KIAntragAssistent.tsx`

Validierung während der Eingabe mit visuellem Feedback:

| Feld | Regel | Feedback |
|------|-------|----------|
| Schulname | mind. 3 Zeichen | ✅ / ❌ + Hinweis |
| Projekttitel | mind. 5 Zeichen | ✅ / ❌ + Hinweis |
| Kurzbeschreibung | 50-500 Zeichen | Zeichenzähler |
| Ziele | mind. 20 Zeichen | ✅ / ❌ |
| Hauptaktivitäten | mind. 20 Zeichen | ✅ / ❌ |
| Zeitraum | gültiges Format | Datumsvalidierung |
| Förderbetrag | innerhalb Grenzen | € + Hinweis |

### 2.2 Zeichenzähler

```
Kurzbeschreibung: [Textfeld]
                 145/500 Zeichen ✓
```

### 2.3 Visuelles Feedback

- **Grün:** Feld ist valide (grünes Häkchen)
- **Rot:** Feld ist invalid (rote Umrandung + Fehlertext)
- **Grau:** Neutral (noch nicht validiert)

### 2.4 Pflichtfeld-Validierung

- "Generieren" Button erst aktiv wenn alle Pflichtfelder valide
- Stern (*) markiert Pflichtfelder
- ARIA-Attribute für Screen Reader

---

## 3. Loading States & Skeletons

### 3.1 Skeleton Komponenten

**Datei:** `components/ui/skeleton.tsx`

**Varianten:**
- `ProgrammCardSkeleton` - Für Förderprogramm-Karten
- `FormSkeleton` - Für Antragsformular
- `DetailSkeleton` - Für Detailseiten

**Verwendung:**
```tsx
{isLoading ? (
  <ProgrammCardSkeleton />
) : (
  <ProgrammCard data={programm} />
)}
```

### 3.2 Loading Spinner

**Datei:** `components/ui/loading-spinner.tsx`

- Animierter Spinner mit Brand-Farben
- Verschiedene Größen (sm, md, lg)
- Dark-Theme optimiert

### 3.3 Progress Indicators

**Verwendung:**
- Beim Antrag generieren: "Schritt 1 von 4..."
- Beim Laden: "12 von 50 Programmen geladen"
- Fortschrittsbalken für Multi-Step-Prozesse

---

## 4. SEO & 404 Seite

### 4.1 Meta-Tags

**Datei:** `app/layout.tsx`

```html
<title>EduFunds - Fördermittel für Schulen</title>
<meta name="description" content="Über 50 Förderprogramme für Schulen...">
<meta name="keywords" content="Förderprogramme, Schulen, Bildung, KI-Antragsassistent">
<meta property="og:title" content="EduFunds">
<meta property="og:description" content="Fördermittel für Schulen...">
<meta property="og:image" content="/og-image.png">
<meta name="twitter:card" content="summary_large_image">
```

### 4.2 Seiten-spezifische SEO

| Seite | Title | Description |
|-------|-------|-------------|
| Startseite | EduFunds - Fördermittel für Schulen | Über 50 Förderprogramme... |
| Förderfinder | Förderfinder | Alle Programme durchsuchen... |
| Impressum | Impressum | Rechtliche Informationen... |
| Datenschutz | Datenschutz | DSGVO-konforme Erklärung... |

### 4.3 404 Seite

**Datei:** `app/not-found.tsx`

**Features:**
- Große "404" Animation
- Such-Icon mit Glow-Effekt
- Buttons: Startseite, Förderfinder, Zurück
- Schnelllinks zu allen Seiten
- noindex für Suchmaschinen

### 4.4 Favicon & Manifest

**Dateien:**
- `public/favicon.svg` - SVG-Favicon (Doktorhut + Euro)
- `public/site.webmanifest` - PWA-Manifest
- Theme-Color: Midnight Blue
- Shortcuts zu Hauptseiten

---

## 5. Backup & Caching System

### 5.1 Automatische Backups

**Skript:** `scripts/backup-data.js`

**Features:**
- Erstellt zeitgestempelte Backups
- Max. 10 Backups (alte werden gelöscht)
- Automatisch bei Änderungen (`--auto` Flag)

**Verwendung:**
```bash
node scripts/backup-data.js           # Manuelles Backup
node scripts/backup-data.js --auto    # Nur bei Änderungen
node scripts/backup-data.js --list    # Alle Backups anzeigen
```

### 5.2 Restore-Funktion

**Skript:** `scripts/restore-data.js`

**Features:**
- Listet alle Backups auf
- Interaktive Auswahl
- Automatisches Sicherheits-Backup vor Restore
- Validierung der Backup-Dateien

**Verwendung:**
```bash
node scripts/restore-data.js                    # Interaktiv
node scripts/restore-data.js backup-datei.json  # Direkt
```

### 5.3 Smart Caching

**Datei:** `lib/cache.ts`

**API:**
```typescript
getCachedData(key)           // Daten aus Cache laden
setCachedData(key, data, ttl) // Daten cachen (TTL in Stunden)
clearCache()                 // Gesamten Cache löschen
isCacheValid(key)            // Prüfen ob Cache noch gültig
fetchWithCache(url)          // Daten holen mit Cache-Strategie
```

**Features:**
- localStorage-basiert
- Cache-Versionierung (bei Datenstruktur-Änderungen)
- Automatische Invalidierung nach TTL (Standard: 24h)
- Offline-Fallback

**Verwendung:**
```typescript
const programme = await fetchWithCache('foerderprogramme');
```

---

## 6. Search & Filter

### 6.1 Volltextsuche

**Datei:** `components/SearchFilter.tsx`

**Durchsucht:**
- Programmname
- Fördergeber
- Beschreibung
- Kategorien

**Features:**
- Echtzeit-Suche (während Tippen)
- Highlighting der Treffer
- "X von Y Programmen gefunden"

### 6.2 Filter-Optionen

| Filter | Optionen |
|--------|----------|
| Fördergeber-Typ | Bund, Land, Stiftung, EU, Sonstige |
| Kategorien | Multi-Select (Digitalisierung, MINT, Kultur...) |
| Bundesland | Alle 16 Bundesländer |
| Schulform | Grundschule, Gymnasium, etc. |
| Fördersumme | Range Slider (Min - Max) |
| Bewerbungsfrist | Laufend, Abgelaufen, Zukünftig |
| KI-geeignet | Checkbox |

### 6.3 Sortierung

- Name (A-Z, Z-A)
- Fördersumme (aufsteigend/absteigend)
- Bewerbungsfrist (bald endend zuerst)

### 6.4 UI/UX

- Suchfeld prominent oben
- Filter-Sidebar (einklappbar auf Mobile)
- Aktive Filter als Chips anzeigen
- "Filter zurücksetzen" Button
- Responsive Design

---

## 7. Unit Tests

### 7.1 Test-Setup

**Dateien:**
- `jest.config.js` - Jest-Konfiguration
- `test/setup.ts` - Test-Setup
- `package.json` - Test-Skripte

**Dependencies:**
- Jest
- React Testing Library
- @testing-library/jest-dom
- ts-jest

### 7.2 Tests geschrieben

| Komponente/Funktion | Test-Abdeckung |
|---------------------|----------------|
| `lib/foerderSchema.ts` | Validierung, Typ-Checks |
| `lib/ki-antrag-generator.ts` | Alle Fördergeber-Typen |
| `lib/cache.ts` | Cache-Operationen |
| `components/Header.tsx` | Rendering, Links |
| `components/Footer.tsx` | Rendering, Links |

### 7.3 Test-Daten

**Datei:** `mocks/test-programme.json`

Beispiel-Programme für Tests:
- Gültiges Bundesprogramm
- Ungültiges Programm (für Error-Tests)
- Landesprogramm
- Stiftungsprogramm

### 7.4 Tests ausführen

```bash
npm test              # Alle Tests
npm test -- --watch # Im Watch-Modus
npm test -- --coverage # Mit Coverage-Report
```

---

## 8. Accessibility (Barrierefreiheit)

### 8.1 ARIA-Labels

**Implementiert in allen Komponenten:**

```tsx
<button aria-label="Förderprogramm details anzeigen">
  <InfoIcon />
</button>

<input 
  aria-describedby="schulname-error"
  aria-invalid={!isValid}
/>
<span id="schulname-error" role="alert">
  {errorMessage}
</span>
```

### 8.2 Keyboard-Navigation

- ✅ Alle interaktiven Elemente mit Tab erreichbar
- ✅ Sichtbare Fokus-Indikatoren (outline)
- ✅ Escape schließt Modals/Dropdowns
- ✅ Enter aktiviert Buttons/Links
- ✅ Pfeiltasten für Dropdowns

### 8.3 Screen Reader Support

**ARIA-Live Regionen:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

**Rollen:**
- `role="alert"` für Fehlermeldungen
- `role="status"` für Erfolgsmeldungen
- `role="navigation"` für Menüs
- `role="main"` für Hauptinhalt

### 8.4 Visuelle Barrierefreiheit

- ✅ Farbkontrast: Mindestens AA (4.5:1)
- ✅ Text skalierbar bis 200%
- ✅ Information nicht nur durch Farbe
- ✅ Fokus-States deutlich sichtbar

### 8.5 Accessibility-Dokumentation

**Datei:** `ACCESSIBILITY.md`

Inhalt:
- Übersicht aller A11y-Features
- Getestet mit NVDA/VoiceOver
- Bekannte Einschränkungen
- WCAG 2.1 AA Konformität

---

## Technische Architektur

### Projektstruktur

```
EduFunds/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Seiten
│   ├── api/               # API-Routen
│   ├── layout.tsx         # Root-Layout
│   ├── page.tsx           # Startseite
│   ├── not-found.tsx      # 404-Seite
│   └── error.tsx          # Error Boundary
├── components/            # React-Komponenten
│   ├── ui/               # UI-Bibliothek
│   ├── ErrorBoundary.tsx
│   ├── KIAntragAssistent.tsx
│   ├── SearchFilter.tsx
│   └── ...
├── lib/                   # Utilities
│   ├── ki-antrag-generator.ts
│   ├── cache.ts
│   └── utils.ts
├── data/                  # Daten
│   ├── foerderprogramme.json
│   └── backups/          # Automatische Backups
├── scripts/              # Hilfsskripte
│   ├── backup-data.js
│   └── restore-data.js
├── test/                 # Tests
│   ├── setup.ts
│   └── *.test.tsx
└── docs/                 # Dokumentation
```

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **UI-Komponenten:** Custom + shadcn/ui
- **Icons:** Lucide React
- **Tests:** Jest + React Testing Library
- **Build:** Statischer Export

---

## Deployment Guide

### 1. Voraussetzungen

- Node.js 18+
- npm oder yarn
- Git

### 2. Installation

```bash
git clone https://github.com/Aitema-gmbh/edufunds.git
cd edufunds
npm install
```

### 3. Entwicklung

```bash
npm run dev
# http://localhost:3101
```

### 4. Build

```bash
npm run build
# oder für statischen Export:
node export-static.js
```

### 5. Tests

```bash
npm test
```

### 6. Deployment (Hetzner)

```bash
# Build
node export-static.js

# Upload (SCP)
scp -r dist/* root@dein-server:/var/www/edufunds/
```

---

## Zusammenfassung

EduFunds ist jetzt eine **robuste, benutzerfreundliche und barrierefreie** Plattform mit:

- 🛡️ Umfassendem Error Handling
- ✅ Echtzeit-Formularvalidierung
- ⚡ Smart-Caching für Performance
- 🔍 Leistungsstarker Suche & Filterung
- 🧪 Automatisierten Tests
- ♿ Vollständiger Barrierefreiheit
- 🌐 SEO-Optimierung
- 💾 Automatischen Backups

**Alle Features sind produktionsreit und getestet.**

---

*Dokumentation erstellt am 7. Februar 2026*
