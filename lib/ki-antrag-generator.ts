// KI-Antragsgenerierung mit programmspezifischen Templates
// Diese Datei enthält eine sophisticated Mock-Funktion, die realistische,
// programmspezifische Antragstexte generiert, bis eine echte OpenAI-Integration verfügbar ist.

import type { Förderprogramm } from "@/types/foerderprogramm";

export interface ProjektDaten {
  schulname: string;
  projekttitel: string;
  kurzbeschreibung: string;
  ziele: string;
  zielgruppe: string;
  zeitraum: string;
  hauptaktivitaeten: string;
  ergebnisse: string;
  nachhaltigkeit: string;
  foerderbetrag: string;
}

// OpenAI-API-Struktur (vorbereitet für echte Integration)
interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  model: "gpt-4-turbo-preview",
  temperature: 0.7,
  maxTokens: 2000,
};

// Prüft ob OpenAI-API verfügbar ist
export function isOpenAIAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Echte OpenAI-Integration (wenn API-Key verfügbar)
export async function generateAntragWithOpenAI(
  programm: Förderprogramm,
  projektDaten: ProjektDaten,
  config: Partial<OpenAIConfig> = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  if (!finalConfig.apiKey) {
    throw new Error("OpenAI API Key nicht konfiguriert");
  }

  const prompt = buildPrompt(programm, projektDaten);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${finalConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: finalConfig.model,
        messages: [
          {
            role: "system",
            content: "Du bist ein erfahrener Antragsberater für schulische Förderprogramme. Erstelle professionelle und überzeugende Förderanträge."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: finalConfig.temperature,
        max_tokens: finalConfig.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Fehler: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Fehler bei der Generierung";
  } catch (error) {
    console.error("OpenAI API Fehler:", error);
    // Fallback zu Mock-Generierung
    return generateMockAntrag(programm, projektDaten);
  }
}

// Prompt-Builder für KI
function buildPrompt(programm: Förderprogramm, projektDaten: ProjektDaten): string {
  return `Du bist ein erfahrener Antragsberater für schulische Förderprogramme. Erstelle einen professionellen und überzeugenden Förderantrag.

## PROGRAMMDETAILS
- Programm: ${programm.name}
- Fördergeber: ${programm.foerdergeber}
- Fördergeber-Typ: ${programm.foerdergeberTyp}
- Fördersumme: ${programm.foerdersummeText}
- Kategorien: ${programm.kategorien.join(", ")}

## PROJEKTDATEN
- Schulname: ${projektDaten.schulname}
- Projekttitel: ${projektDaten.projekttitel}
- Beantragter Förderbetrag: ${projektDaten.foerderbetrag} €
- Projektlaufzeit: ${projektDaten.zeitraum}
- Zielgruppe: ${projektDaten.zielgruppe}
- Kurzbeschreibung: ${projektDaten.kurzbeschreibung}
- Projektziele: ${projektDaten.ziele}
- Hauptaktivitäten: ${projektDaten.hauptaktivitaeten}
- Erwartete Ergebnisse: ${projektDaten.ergebnisse}
- Nachhaltigkeit: ${projektDaten.nachhaltigkeit}

## ANFORDERUNGEN AN DEN ANTRAGSTEXT
1. Beginne mit einer starken Einleitung, die das Projekt vorstellt
2. Beziehe dich explizit auf die Ziele des Förderprogramms
3. Argumentiere, warum die Schule für dieses Projekt geeignet ist
4. Beschreibe die Projektumsetzung detailliert und realistisch
5. Hebe die Nachhaltigkeit und den Mehrwert hervor
6. Schließe mit einer überzeugenden Zusammenfassung
7. Verwende eine professionelle, aber zugängliche Sprache
8. Strukturiere den Text in Abschnitte mit Überschriften

Generiere nun den vollständige Antragstext (ca. 800-1200 Wörter):`;
}

// Hauptfunktion: Entscheidet zwischen OpenAI und Mock
export async function generateAntrag(
  programm: Förderprogramm,
  projektDaten: ProjektDaten
): Promise<string> {
  if (isOpenAIAvailable()) {
    return generateAntragWithOpenAI(programm, projektDaten);
  }
  // Simuliere API-Delay für realistisches Verhalten
  await new Promise(resolve => setTimeout(resolve, 2000));
  return generateMockAntrag(programm, projektDaten);
}

// Programmspezifische Templates
const PROGRAM_TEMPLATES = {
  bund: {
    einleitung: (schulname: string, projekttitel: string, programmName: string) => 
      `Die ${schulname} reicht im Rahmen des Bundesförderprogramms „${programmName}" einen Antrag für das innovative Bildungsprojekt „${projekttitel}" ein. Mit diesem Projekt leisten wir einen aktiven Beitrag zur Umsetzung der Bildungsziele der Bundesregierung und stärken die Qualität schulischer Bildung auf nationaler Ebene.`,
    
    passung: (kategorien: string[]) => 
      `Das Projekt adressiert zentrale Handlungsfelder der nationalen Bildungspolitik. Insbesondere die Kategorien ${kategorien.slice(0, 2).join(" und ")} stehen im Einklang mit den strategischen Zielen der Bundesregierung zur Bildungsmodernisierung. Durch die bundesweite Relevanz unseres Ansatzes tragen wir zur Schaffung gleichwertiger Lebensverhältnisse in allen Regionen Deutschlands bei.`,
    
    abschluss: () => 
      `Wir sind überzeugt, dass unser Projekt einen nachhaltigen Beitrag zur Qualitätsentwicklung im deutschen Bildungssystem leistet. Eine positive Förderentscheidung würde nicht nur unsere Schule voranbringen, sondern auch als Modell für andere Bildungseinrichtungen im Bundesgebiet dienen.`
  },
  
  land: {
    einleitung: (schulname: string, projekttitel: string, programmName: string, foerdergeber: string) => 
      `Im Rahmen der landespolitischen Initiativen des ${foerdergeber} stellt die ${schulname} den Antrag „${projekttitel}". Mit diesem Projekt setzen wir die landesspezifischen Bildungsprioritäten konsequent um und tragen zur Weiterentwicklung des Schulwesens in unserem Bundesland aktiv bei.`,
    
    passung: (kategorien: string[]) => 
      `Unser Projekt ist eng an die bildungspolitischen Leitlinien unseres Landes gekoppelt. Die Schwerpunkte ${kategorien.slice(0, 2).join(" und ")} reflektieren die aktuellen prioritären Handlungsfelder der Landesbildungspolitik. Als innovative Schule im Land übernehmen wir damit Vorreiterfunktion für die regionale Bildungslandschaft.`,
    
    abschluss: () => 
      `Das Projekt stärkt die bildungspolitische Profilierung unseres Landes und leistet einen konkreten Beitrag zur Umsetzung der Landesbildungsziele. Wir freuen uns auf die Möglichkeit, gemeinsam mit dem Land innovative Impulse für die regionale Schulentwicklung zu setzen.`
  },
  
  stiftung: {
    einleitung: (schulname: string, projekttitel: string, programmName: string, foerdergeber: string) => 
      `Die ${schulname} bewirbt sich beim „${programmName}" der ${foerdergeber} mit dem Projekt „${projekttitel}". Wir teilen die grundlegenden Werte und das Engagement der Stiftung für exzellente Bildung und möchten gemeinsam nachhaltige Wirkung entfalten.`,
    
    passung: (kategorien: string[]) => 
      `Die Ausrichtung unseres Projekts auf ${kategorien.slice(0, 2).join(" und ")} korrespondiert in vorbildlicher Weise mit der stiftungspolitischen Mission. Wir verstehen uns als Partner, der die philanthropischen Ziele der Stiftung durch innovative Praxis im schulischen Alltag umsetzt und sichtbar macht.`,
    
    abschluss: () => 
      `In Partnerschaft mit der Stiftung können wir transformative Bildungswirkung erzielen. Wir sind überzeugt, dass gemeinsam eine nachhaltige Veränderung zum Wohl der Schülerinnen und Schüler sowie der gesamten Bildungsgemeinschaft möglich ist.`
  },
  
  eu: {
    einleitung: (schulname: string, projekttitel: string, programmName: string) => 
      `Die ${schulname} reicht im Rahmen des EU-Programms „${programmName}" einen transnationalen Bildungsantrag für „${projekttitel}" ein. Das Projekt fördert die europäische Dimension der Bildung und stärkt die grenzüberschreitende Zusammenarbeit im europäischen Bildungsraum.`,
    
    passung: (kategorien: string[]) => 
      `Unser Vorhaben unterstützt aktiv die Ziele der Europäischen Bildungsstrategie. Die thematischen Schwerpunkte ${kategorien.slice(0, 2).join(" und ")} tragen zur Realisierung europäischer Bildungsziele bei und fördern die internationale Mobilität und Zusammenarbeit von Schülerinnen und Schülern sowie Lehrkräften.`,
    
    abschluss: () => 
      `Das Projekt leistet einen konkreten Beitrag zum Aufbau eines gemeinsamen europäischen Bildungsraums. Wir freuen uns darauf, gemeinsam mit europäischen Partnern innovative Bildungsansätze zu entwickeln und die europäische Identität an unserer Schule zu stärken.`
  },
  
  sonstige: {
    einleitung: (schulname: string, projekttitel: string, programmName: string, foerdergeber: string) => 
      `Die ${schulname} bewirbt sich beim „${programmName}" der ${foerdergeber} mit dem Projekt „${projekttitel}". Wir teilen die Vision unseres Förderpartners für innovative Bildung und möchten gemeinsam positive Veränderungen im Bildungssektor bewirken.`,
    
    passung: (kategorien: string[]) => 
      `Unser Projekt adressiert die zentralen Förderschwerpunkte in den Bereichen ${kategorien.slice(0, 2).join(" und ")}. Die inhaltliche Übereinstimmung mit den Zielen des Förderprogramms sichert eine maximale Wirkung der eingesetzten Mittel.`,
    
    abschluss: () => 
      `Wir sind überzeugt, dass unsere Partnerschaft mit dem Fördergeber nachhaltige positive Effekte für unsere Schule und darüber hinaus erzielen wird. Eine Förderzusage würde den Grundstein für eine erfolgreiche Zusammenarbeit legen.`
  }
};

// Helper-Funktion für formatierte Listen
function formatList(text: string): string {
  if (!text) return "- Noch nicht spezifiziert";
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .filter(s => s.trim())
    .map(s => `- ${s.trim()}`)
    .join("\n");
}

// Haupt-Generierungsfunktion
function generateMockAntrag(programm: Förderprogramm, projektDaten: ProjektDaten): string {
  const template = PROGRAM_TEMPLATES[programm.foerdergeberTyp] || PROGRAM_TEMPLATES.sonstige;
  const kategorienText = programm.kategorien.map(k => 
    k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, " ")
  ).join(", ");

  const foerdergeberTypMap: Record<string, string> = {
    bund: "des Bundes",
    land: "des Landes",
    stiftung: "der Stiftung",
    eu: "der Europäischen Union",
    sonstige: "der Organisation"
  };

  return `# FÖRDERANTRAG

## ${projektDaten.projekttitel}

---

### 1. EINLEITUNG UND PROJEKTÜBERSICHT

${template.einleitung(
  projektDaten.schulname, 
  projektDaten.projekttitel, 
  programm.name,
  programm.foerdergeber
)}

Die ${projektDaten.schulname} beantragt im Rahmen des Programms „${programm.name}" ${foerdergeberTypMap[programm.foerdergeberTyp] || ""} einen Zuschuss in Höhe von ${Number(projektDaten.foerderbetrag).toLocaleString("de-DE")} €.

**Projektträger:** ${projektDaten.schulname}  
**Projektlaufzeit:** ${projektDaten.zeitraum}  
**Beantragte Fördersumme:** ${Number(projektDaten.foerderbetrag).toLocaleString("de-DE")} €

---

### 2. PROJEKTBESCHREIBUNG

**Kurzbeschreibung:**  
${projektDaten.kurzbeschreibung}

**Projektziele:**  
${formatList(projektDaten.ziele)}

**Zielgruppe:**  
Das Projekt richtet sich gezielt an: ${projektDaten.zielgruppe}

---

### 3. PROJEKTUMSETZUNG

**Geplante Hauptaktivitäten:**  
${formatList(projektDaten.hauptaktivitaeten)}

**Projektkonzeption und -ablauf:**

Das Projekt gliedert sich in vier aufeinander aufbauende Phasen:

1. **Vorbereitungsphase (Monat 1-2):**  
   Bedarfsanalyse, Feinkonzeption, Materialbeschaffung

2. **Implementierungsphase (Monat 3-8):**  
   Umsetzung der geplanten Aktivitäten, laufende Evaluation

3. **Intensivierungsphase (Monat 9-10):**  
   Verstetigung etablierter Strukturen, Multiplikatorenschulung

4. **Abschlussphase (Monat 11-12):**  
   Ergebnissicherung, Abschlussbericht, Nachhaltigkeitsplanung

---

### 4. PASSUNG ZUM FÖRDERPROGRAMM

${template.passung(programm.kategorien)}

**Kategoriezuordnung:** ${kategorienText}

**Fördersumme:** ${programm.foerdersummeText}

Das Projekt entspricht vollumfänglich den Förderrichtlinien und erfüllt alle formellen sowie inhaltlichen Anforderungen des Ausschreibungstextes.

---

### 5. ERWARTETE ERGEBNISSE UND WIRKUNG

**Konkrete Projektergebnisse:**  
${formatList(projektDaten.ergebnisse)}

**Qualitative Wirkungen:**
- Nachhaltige Kompetenzentwicklung bei den Teilnehmenden
- Strukturelle Verankerung im Schulalltag
- Multiplikatoreneffekte für die gesamte Schulfamilie
- Sichtbarkeit und Anerkennung der Bildungsarbeit

**Quantitative Ziele:**
- Direkte Teilnehmende: ${projektDaten.zielgruppe.match(/\d+/)?.[0] || "ca. 150"} Personen
- Indirekte Reichweite: gesamte Schulgemeinschaft
- Projektdauer: ${projektDaten.zeitraum}

---

### 6. NACHHALTIGKEIT UND VERSTETIGUNG

${projektDaten.nachhaltigkeit || `Das Projekt ist konzipiert für nachhaltige Wirkung über die Förderphase hinaus. Die entwickelten Konzepte, Materialien und Strukturen werden in den Regelbetrieb der Schule überführt. Durch die Qualifizierung von Multiplikatoren und die dokumentierten Best-Practices entsteht ein nachhaltiger Impact, der über die Projektlaufzeit hinaus wirksam bleibt.`}

---

### 7. BUDGETÜBERSICHT

| Position | Betrag (€) |
|----------|------------|
| Beantragte Förderung | ${Number(projektDaten.foerderbetrag).toLocaleString("de-DE")} |
| Programm | ${programm.name} |
| Fördergeber | ${programm.foerdergeber} |
| Förderquote | bis zu 100% |

---

### 8. ABSCHLUSS

${template.abschluss()}

Die ${projektDaten.schulname} freut sich auf eine positive Prüfung des Antrags und die Möglichkeit, mit dem Projekt „${projektDaten.projekttitel}" einen wertvollen Beitrag zu ${kategorienText} zu leisten.

Für Rückfragen steht das Projektteam jederzeit zur Verfügung.

Mit freundlichen Grüßen

Das Projektteam der ${projektDaten.schulname}

---

*Dieser Antrag wurde mit Unterstützung des KI-Antragsassistenten erstellt.*  
*Programm: ${programm.name} (${programm.foerdergeber})*  
*Generiert am: ${new Date().toLocaleDateString("de-DE")}*
`;
}

export { generateMockAntrag };
