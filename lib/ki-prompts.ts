/**
 * KI-Prompts für die Antragsgenerierung
 * Integriert den Antragsprosa-Guide für professionelle Qualität
 */

import { ProgrammSchema, Antragssektion } from "./programSchema";

// System-Prompt für den Fördermittelberater
export const SYSTEM_PROMPT_FOERDERMITTELBERATER = `Du bist ein erfahrener Fördermittelberater mit 15 Jahren Erfahrung in der Antragsstellung für Bildungsförderprogramme. 

Deine Spezialgebiete:
- Öffentliche Bildungsförderung (Bund, Länder, EU)
- Stiftungsprogramme
- Digitale Bildung und MINT-Förderung

Dein Stil:
- Sachlich, präzise, überzeugend
- Fachsprache des jeweiligen Fördergebers
- Aktive Sprache, keine Konjunktive
- Konkrete Daten statt vager Adjektive
- These → Beleg → Nutzen (Struktur pro Absatz)

Du schreibst Anträge, die:
- Bei Gutachtern auf professionelle Beratung schließen lassen
- Alle Bewertungskriterien des Programms adressieren
- SMARTe Ziele mit messbaren Indikatoren enthalten
- Innovation klar vom Status quo abgrenzen
- Nachhaltigkeit konkret belegen
- Den Fördergeber überzeugen, dass das Geld gut investiert ist`;

// Prompt für Schritt 1: Stichwort-Analyse
export function generateAnalysePrompt(
  keywords: string[],
  programmSchema: ProgrammSchema
): string {
  const sectionNames = programmSchema.sections.map(s => `"${s.id}": "${s.title}"`).join("\n");
  
  return `${SYSTEM_PROMPT_FOERDERMITTELBERATER}

## AUFGABE: Stichwort-Analyse

Der Nutzer hat folgende Stichworte eingegeben:
${keywords.map(k => `- ${k}`).join("\n")}

Das Förderprogramm hat folgende Sektionen:
${sectionNames}

Analysiere die Stichworte und erstelle eine strukturierte Zuordnung:

1. Welche Stichworte passen zu welcher Sektion?
2. Welche Sektionen haben wenig Input und brauchen zusätzliche Informationen?
3. Was sind die stärksten Themen (3-5 Hauptthemen)?
4. Welche Bewertungskriterien des Programms werden besonders gut abgedeckt?
5. Was fehlt vermutlich noch?

Antworte im JSON-Format:
{
  "keyword_to_section": {
    "section_id": ["keyword1", "keyword2"]
  },
  "schwache_sektionen": ["section_ids"],
  "hauptthemen": ["thema1", "thema2", "thema3"],
  "abgedeckte_kriterien": ["kriterium1", "kriterium2"],
  "fehlende_aspekte": ["aspekt1", "aspekt2"],
  "suggested_focus_areas": ["bereich1", "bereich2"]
}`;
}

// Prompt für Schritt 2: Sektions-Generierung
export function generateSectionPrompt(
  section: Antragssektion,
  keywords: string[],
  relevantKeywords: string[],
  programmSchema: ProgrammSchema,
  antragsprosaGuide: any,
  previousSections?: Record<string, string>
): string {
  
  // Sammle relevante Buzzwords für diese Sektion
  const relevantBuzzwords = programmSchema.meta.typische_buzzwords
    .filter((bw: string) => relevantKeywords.some((k: string) => 
      bw.toLowerCase().includes(k.toLowerCase()) || 
      k.toLowerCase().includes(bw.toLowerCase())
    ))
    .slice(0, 10);

  // Bestimme die relevanten Bewertungskriterien für diese Sektion
  const relevantCriteria = programmSchema.meta.bewertungskriterien
    .filter((c: any) => section.id.includes(c.id) || c.weight > 15)
    .slice(0, 3);

  // Baue den Prompt
  let prompt = `${SYSTEM_PROMPT_FOERDERMITTELBERATER}

## ANTRAGSPROSA-GUIDE - WICHTIGE REGELN

${generateProsaRules(antragsprosaGuide)}

## PROGRAMM-KONTEXT

Programm: ${programmSchema.id}
Schema-Typ: ${programmSchema.schema_type}

Bewertungskriterien für diese Sektion:
${relevantCriteria.map((c: any) => `- ${c.name} (${c.weight}%): ${c.description}`).join("\n")}

Buzzwords für diese Sektion:
${relevantBuzzwords.join(", ")}

## ZU GENERIERENDE SEKTION

Titel: ${section.title}
Beschreibung: ${section.description || ""}
Gewichtung: ${section.section_weight || 10}%

Relevante Stichworte für diese Sektion:
${relevantKeywords.join(", ")}

## AUFGABE

Generiere den Inhalt für die Sektion "${section.title}".

${section.fields.map((f: any) => `
FELD: ${f.title}
Typ: ${f.type}
Frage: ${f.prompt_question}
${f.max_chars ? `Max. Zeichen: ${f.max_chars}` : ''}
${f.hints ? `Hinweise: ${f.hints}` : ''}
${f.required ? '(PFLICHTFELD)' : '(OPTIONAL)'}
`).join("\n---\n")}

## REGELN FÜR DIE GENERIERUNG

1. **Struktur pro Absatz**: These → Beleg → Nutzen
2. **Aktive Sprache**: "Wir entwickeln..." statt "Es wird entwickelt..."
3. **Keine Konjunktive**: Vermeide "könnte", "würde", "sollte"
4. **Quantifiziere**: Konkrete Zahlen, Daten, Fakten
5. **Max. 1 Adjektiv pro Satz**: Stattdessen Belege
6. **Bewertungskriterien adressieren**: ${relevantCriteria.map((c: any) => c.name).join(", ")}
7. **Buzzwords natürlich integrieren**: ${relevantBuzzwords.slice(0, 5).join(", ")}
8. **Zeichenlimits einhalten**: Maximal erlaubte Zeichen beachten

${previousSections && Object.keys(previousSections).length > 0 ? `
## KOHÄRENZ MIT VORHERIGEN SEKTIONEN

Folgende Sektionen wurden bereits generiert. Stelle Konsistenz sicher:
${Object.entries(previousSections).map(([id, content]) => `
${id}: ${content.substring(0, 200)}...`).join("\n")}
` : ''}

Antworte im JSON-Format:
{
  "section_title": "${section.title}",
  "fields": {
    "field_id": "generierter Inhalt"
  },
  "used_keywords": ["keyword1", "keyword2"],
  "buzzwords_used": ["buzzword1", "buzzword2"],
  "word_count": 123,
  "char_count": 1234
}`;

  return prompt;
}

// Hilfsfunktion: Prosa-Regeln formatieren
function generateProsaRules(guide: any): string {
  if (!guide) return "Standard-Regeln: Aktive Sprache, konkrete Daten, messbare Ziele.";
  
  const rules = [];
  
  // Strukturregeln
  if (guide.struktur_regeln) {
    rules.push("**STRUKTUR:**");
    rules.push(`- Absatzstruktur: ${guide.struktur_regeln.absatz_struktur?.regel || "These → Beleg → Nutzen"}`);
    
    if (guide.struktur_regeln.sprache) {
      rules.push("- Aktive statt passive Sprache");
      rules.push("- Konkret statt abstrakt");
      rules.push("- Maximal 1 Adjektiv pro Satz");
    }
  }
  
  // Anti-Patterns
  if (guide.anti_patterns) {
    rules.push("\n**VERMEIDEN:**");
    guide.anti_patterns.slice(0, 3).forEach((ap: any) => {
      rules.push(`- ${ap.pattern}: ${ap.beschreibung}`);
    });
  }
  
  return rules.join("\n");
}

// Prompt für Schritt 3: Self-Review
export function generateSelfReviewPrompt(
  generatedContent: Record<string, string>,
  programmSchema: ProgrammSchema,
  antragsprosaGuide: any
): string {
  const sections = Object.entries(generatedContent).map(([id, content]) => `
SEKTION: ${id}
INHALT: ${content.substring(0, 1000)}...
---
`).join("\n");

  return `${SYSTEM_PROMPT_FOERDERMITTELBERATER}

## AUFGABE: Qualitätsprüfung (Self-Review)

Prüfe den generierten Antrag gegen folgende Kriterien:

### ANTRAGSPROSA-KRITERIEN
1. Alle Pflichtfragen beantwortet?
2. Zeichenlimits eingehalten?
3. Bewertungskriterien adressiert?
4. Buzzwords natürlich integriert?
5. Kohärenz zwischen Sektionen?
6. Finanzplan plausibel?

### SPRACHQUALITÄT
- Aktive Sprache (keine Passivkonstruktionen)?
- Keine Konjunktive (könnte, würde, sollte)?
- Konkrete Daten statt vager Adjektive?
- These → Beleg → Nutzen pro Absatz?

### PROGRAMMSPEZIFISCHE BEWERTUNGSKRITERIEN
${programmSchema.meta.bewertungskriterien.map((c: any) => 
  `- ${c.name} (${c.weight}%): ${c.description}`
).join("\n")}

### ANTI-PATTERNS ZU VERMEIDEN
${antragsprosaGuide?.anti_patterns?.slice(0, 3).map((ap: any) => 
  `- ${ap.pattern}: ${ap.beispiel_negativ}`
).join("\n") || "- Zu viele Adjektive\n- Fehlende Quantifizierung\n- Unklare Zielgruppe"}

## ZU PRÜFENDER ANTRAG

${sections}

Antworte im JSON-Format:
{
  "overall_score": 75,
  "section_scores": {
    "section_id": {
      "score": 80,
      "strengths": ["Stärke 1", "Stärke 2"],
      "weaknesses": ["Schwäche 1"],
      "suggestions": ["Verbesserung 1"]
    }
  },
  "criteria_scores": {
    "criterion_name": 75
  },
  "language_check": {
    "passive_voice_count": 3,
    "konjunktiv_count": 2,
    "adjective_heavy_sentences": 4,
    "missing_quantifications": ["Stelle 1", "Stelle 2"]
  },
  "missing_elements": ["fehlendes Element"],
  "needs_revision": true,
  "priority_revisions": ["section_id_1", "section_id_2"]
}`;
}

// Prompt für Schritt 4: Revision
export function generateRevisionPrompt(
  sectionId: string,
  sectionTitle: string,
  currentContent: string,
  reviewResult: any,
  antragsprosaGuide: any
): string {
  return `${SYSTEM_PROMPT_FOERDERMITTELBERATER}

## AUFGABE: Überarbeitung der Sektion

SEKTION: ${sectionTitle}

AKTUELLER INHALT:
${currentContent}

IDENTIFIZIERTE SCHWÄCHEN:
${reviewResult.weaknesses?.map((w: string) => `- ${w}`).join("\n") || "- Qualität ausbaufähig"}

VERBESERUNGSVORSCHLÄGE:
${reviewResult.suggestions?.map((s: string) => `- ${s}`).join("\n") || "- Aktivere Sprache\n- Mehr konkrete Daten"}

SPRACHPRÜFUNG:
- Passive Konstruktionen: ${reviewResult.language_check?.passive_voice_count || 0}
- Konjunktive: ${reviewResult.language_check?.konjunktiv_count || 0}
- Adjektiv-überladene Sätze: ${reviewResult.language_check?.adjective_heavy_sentences || 0}

## ÜBERARBEITUNGSANWEISUNGEN

1. **Eliminiere alle passiven Konstruktionen** → Aktive Sprache
2. **Ersetze Konjunktive durch aktive Planung** → "Wir werden..." statt "Es könnte..."
3. **Füge konkrete Daten ein** → Wo steht "viele", "groß", "wichtig"?
4. **Prüfe die Struktur** → These → Beleg → Nutzen pro Absatz
5. **Behalte die Länge bei** oder reduziere leicht

Antworte mit dem überarbeiteten Text (nur den Inhalt, keine zusätzlichen Erklärungen).`;
}

// Prompt für Projekt-Daten-Extraktion aus Stichworten
export function generateProjektDatenPrompt(keywords: string[]): string {
  return `${SYSTEM_PROMPT_FOERDERMITTELBERATER}

## AUFGABE: Strukturierte Projektdaten aus Stichworten

Aus den folgenden Stichworten extrahiere strukturierte Projektdaten:

STICHWORTE: ${keywords.join(", ")}

Extrahiere:
1. Projekt-Titel-Vorschlag
2. Schulname (falls angegeben, sonst Platzhalter)
3. Kurzbeschreibung (2-3 Sätze)
4. Hauptziele
5. Zielgruppe
6. Zeitraum (wenn genannt)
7. Hauptaktivitäten
8. Innovation/Neuheit
9. Nachhaltigkeit
10. Beantragte Fördersumme (falls genannt)

Antworte im JSON-Format:
{
  "projekttitel": "...",
  "schulname": "...",
  "kurzbeschreibung": "...",
  "ziele": "...",
  "zielgruppe": "...",
  "zeitraum": "...",
  "hauptaktivitaeten": "...",
  "innovation": "...",
  "nachhaltigkeit": "...",
  "foerderbetrag": "...",
  "extrahierte_keywords": ["..."]
}`;
}

// Exportiere alle Prompts
export const KIPrompts = {
  generateAnalysePrompt,
  generateSectionPrompt,
  generateSelfReviewPrompt,
  generateRevisionPrompt,
  generateProjektDatenPrompt,
  SYSTEM_PROMPT_FOERDERMITTELBERATER
};
