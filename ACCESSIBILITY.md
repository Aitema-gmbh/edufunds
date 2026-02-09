# EduFunds Accessibility (Barrierefreiheit)

Dieses Dokument beschreibt die Barrierefreiheits-Features von EduFunds und wie sie implementiert wurden.

## Übersicht

EduFunds wurde mit dem Ziel entwickelt, für alle Nutzer zugänglich zu sein, einschließlich Menschen mit Behinderungen. Wir folgen den WCAG 2.1 AA-Richtlinien und stellen sicher, dass die Anwendung mit Screen Readern und anderen Hilfstechnologien kompatibel ist.

## Implementierte Features

### 1. Tastaturnavigation

- **Alle interaktiven Elemente** sind mit der Tab-Taste erreichbar
- **Sichtbare Fokus-Indikatoren** mit orangem Ring (#c9a227) für alle fokussierbaren Elemente
- **Skip-Link** am Seitenanfang ermöglicht das Überspringen der Navigation zum Hauptinhalt
- **Escape-Taste** schließt Mobile-Menüs und Dialoge
- **Enter/Space** aktiviert Buttons und Links

### 2. ARIA-Labels und Semantik

#### Landmarks (Orientierungspunkte)
- `<header role="banner">` - Seitenkopf
- `<nav role="navigation" aria-label="...">` - Navigation
- `<main id="main-content">` - Hauptinhalt
- `<footer>` - Seitenfuß
- `<section>` - Inhaltsbereiche mit Überschriften

#### Formulare
- Alle Eingabefelder haben zugeordnete `<label>`-Elemente
- Pflichtfelder werden mit `required` und visuellem Sternchen markiert
- Fehlermeldungen mit `role="alert"` und `aria-describedby` verknüpft
- Eingabehinweise mit `aria-describedby` verknüpft

#### Interaktive Elemente
- Buttons mit `aria-label` für Icon-Buttons
- Mobile Menü mit `aria-expanded`, `aria-controls`
- Dialoge mit `aria-modal="true"`, `aria-labelledby`, `aria-describedby`
- Social Media Links mit `aria-label` für neue Tabs

### 3. Screen Reader Support

#### Live-Regionen
- `aria-live="polite"` für wichtige Updates (Erfolgsmeldungen)
- `aria-live="assertive"` für Fehlermeldungen
- `role="alert"` für Formularfehler
- `role="status"` für Erfolgsmeldungen

#### Dynamische Inhalte
- KI-Antraggenerierung: Fortschritt wird vorgelesen
- Erfolgs-/Fehlermeldungen werden automatisch announced
- Kopieren in Zwischenablage: Bestätigung wird vorgelesen

#### Struktur
- Logische Überschriftenhierarchie (h1 → h2 → h3)
- Listen für Navigationspunkte (`<ul>`, `<ol>`)
- Tabellen mit korrekten Header-Zellen (wo verwendet)

### 4. Visuelle Barrierefreiheit

#### Kontraste
- Alle Texte erfüllen mindestens WCAG AA Kontrastverhältnisse
- Primärer Text: #f8f5f0 auf #0a1628 (Kontrast ~15:1)
- Sekundärer Text: #94a3b8 auf #0f172a (Kontrast ~7:1)
- Fokus-Indikatoren: #c9a227 (Gold) mit ausreichendem Kontrast

#### Textgrößen
- Relative Einheiten (rem) für alle Texte
- Benutzer können Text im Browser zoombar skalieren (bis 200%)
- Keine festen Pixel-Größen für wichtige Inhalte

#### Farbunabhängigkeit
- Fehler werden nicht nur durch Farbe (rot), sondern auch durch:
  - Icon (X)
  - Textbeschreibung
  - Rahmen-Stil
- Erfolg wird nicht nur durch Farbe (grün), sondern auch durch:
  - Icon (Check)
  - Textbeschreibung

#### Fokus-States
```css
*:focus-visible {
  outline: 2px solid var(--gold-500);
  outline-offset: 2px;
}
```

### 5. Bewegung und Animation

#### Reduzierte Bewegung
```css
@media (prefers-reduced-motion: reduce) {
  /* Alle Animationen deaktiviert */
  /* Sofortige Zustandsänderungen statt Animationen */
}
```

- Respektierung von `prefers-reduced-motion`
- Keine automatisch abspielenden Videos oder Animationen
- Keine blinkenden oder flackernden Elemente

### 6. Responsive Design

- Layout funktioniert bei 320px Breite (ohne horizontal scroll)
- Touch-Targets mindestens 44x44px
- Touch-Targets mindestens 44x44px
- Mobile Navigation mit Tastatur bedienbar

### 7. Formular-Barrierefreiheit

#### Beispiel: Accessible Form Field
```tsx
<div className="space-y-2">
  <Label htmlFor="schulname" required>
    Schulname
  </Label>
  <Input
    id="schulname"
    required
    aria-describedby="schulname-hint"
  />
  <p id="schulname-hint" className="text-xs text-slate-500">
    Mindestens 3 Zeichen erforderlich
  </p>
</div>
```

#### Validierung
- Echtzeit-Validierung mit sofortigem Feedback
- Fehlermeldungen direkt am Feld
- Zusammenfassung von Fehlern vor Formular-Absendung

## Getestet mit

### Screen Readern
- **NVDA** (Windows) - Getestet mit Firefox und Chrome
- **JAWS** (Windows) - Getestet mit Chrome
- **VoiceOver** (macOS/iOS) - Getestet mit Safari
- **TalkBack** (Android) - Getestet mit Chrome

### Tastatur-Navigation
- Vollständige Bedienung ohne Maus möglich
- Logische Tab-Reihenfolge
- Fokus-Management bei Dialogen und Menüs

### Tools
- axe DevTools
- Lighthouse Accessibility Audit
- WAVE Web Accessibility Evaluator
- Color Contrast Analyser

## Bekannte Einschränkungen

1. **PDF-Downloads**: Generierte PDFs haben keine vollständige Tag-Struktur für Screen Reader (PDF/UA). Die Text-Version ist als barrierefreie Alternative verfügbar.

2. **KI-generierter Inhalt**: Der Inhalt der generierten Anträge kann nicht vorhergesagt werden. Nutzer sollten den Text vor dem Absenden überprüfen.

3. **Karten-Ansichten**: In komplexen Kartenlayouts können Screen Reader-Nutzer von der Listenansicht profitieren, die als Alternative angeboten wird.

4. **Drittanbieter-Widgets**: Einige eingebettete Inhalte (z.B. Karten, externe Formulare) können unterschiedliche Barrierefreiheits-Standards haben.

## Feedback und Support

Bei Problemen mit der Barrierefreiheit kontaktieren Sie uns:

- E-Mail: accessibility@edu-funds.org
- Telefon: +49 (0)30 XXX XXX XXX (Montag-Freitag, 9-17 Uhr)
- Kontaktformular: [Link zum Formular]

## Technische Details

### Komponenten
- `SkipLink` - Überspringen der Navigation
- `LiveRegion` - Screen Reader Announcements
- `FormField` - Barrierefreie Formularfelder
- `InputField` / `TextareaField` - Mit Label-Integration

### Hooks
- `useAnnouncer()` - Programmatische Screen Reader Ansagen

### CSS-Klassen
- `.sr-only` - Screen Reader only content
- `.skip-link` - Skip Navigation Link
- Focus-Styles in `globals.css`

## Weiterentwicklung

Unsere Roadmap für Barrierefreiheit:

- [ ] Vollständige PDF/UA-Konformität für Downloads
- [ ] Erweiterte Tastatur-Shortcuts für Power-User
- [ ] Mehrsprachige Screen Reader-Unterstützung
- [ ] Erhöhter Kontrast-Modus
- [ ] Individuelle Einstellungen für Benutzerpräferenzen

---

*Letzte Aktualisierung: Februar 2025*
*Version: 1.0*
*Verantwortlich: AITEMA GmbH*
