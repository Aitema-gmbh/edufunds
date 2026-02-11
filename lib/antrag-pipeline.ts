/**
 * Antrags-Generierungs-Pipeline
 * 4-Schritt-Prozess: Analyse → Generation → Self-Review → Revision
 */

import { 
  ProgrammSchema, 
  GenerierterAntrag, 
  PipelineStatus, 
  StichwortAnalyse 
} from "./programSchema";
import { 
  generateAnalysePrompt, 
  generateSectionPrompt, 
  generateSelfReviewPrompt,
  generateRevisionPrompt 
} from "./ki-prompts";

// API-Konfiguration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Kosten-Tracking
interface KostenTracker {
  apiCalls: number;
  tokensUsed: number;
  estimatedCost: number;
  startTime: number;
}

export class AntragPipeline {
  private programmSchema: ProgrammSchema;
  private antragsprosaGuide: any;
  private kostenTracker: KostenTracker;
  private onProgress?: (status: PipelineStatus) => void;

  constructor(
    programmSchema: ProgrammSchema,
    antragsprosaGuide: any,
    onProgress?: (status: PipelineStatus) => void
  ) {
    this.programmSchema = programmSchema;
    this.antragsprosaGuide = antragsprosaGuide;
    this.onProgress = onProgress;
    this.kostenTracker = {
      apiCalls: 0,
      tokensUsed: 0,
      estimatedCost: 0,
      startTime: Date.now()
    };
  }

  /**
   * Hauptmethode: Führt die komplette Pipeline aus
   */
  async generateAntrag(keywords: string[]): Promise<GenerierterAntrag> {
    console.log(`[Pipeline] Starte Generierung für ${this.programmSchema.id}`);
    
    // Schritt 1: Analyse
    this.updateProgress("analyse", 10, "Analysiere Stichworte...");
    const analyse = await this.schritt1Analyse(keywords);
    
    // Schritt 2: Generation (pro Sektion)
    this.updateProgress("generation", 30, "Generiere Antragssektionen...");
    const generatedSections = await this.schritt2Generation(keywords, analyse);
    
    // Schritt 3: Self-Review
    this.updateProgress("self-review", 70, "Prüfe Qualität...");
    const reviewResult = await this.schritt3SelfReview(generatedSections);
    
    // Schritt 4: Revision (falls nötig)
    let finalSections = generatedSections;
    let revisionIterations = 0;
    
    if (reviewResult.needs_revision && reviewResult.overall_score < 80) {
      this.updateProgress("revision", 80, "Überarbeite schwache Sektionen...");
      finalSections = await this.schritt4Revision(generatedSections, reviewResult);
      revisionIterations = 1;
    }
    
    // Finanzplan generieren
    this.updateProgress("complete", 95, "Finalisiere...");
    const financials = this.generateFinancials(keywords);
    
    // Ergebnis zusammenstellen
    const antrag: GenerierterAntrag = {
      schema_id: this.programmSchema.id,
      programm_id: this.programmSchema.id,
      generiert_am: new Date().toISOString(),
      version: this.programmSchema.version,
      
      sections: Object.entries(finalSections).reduce((acc, [id, content]) => {
        acc[id] = {
          content,
          char_count: content.length,
          word_count: content.split(/\s+/).length,
          used_keywords: analyse.keyword_to_section_mapping[id] || [],
          quality_score: reviewResult.section_scores?.[id]?.score || 75
        };
        return acc;
      }, {} as Record<string, any>),
      
      financials,
      
      self_review: {
        overall_score: reviewResult.overall_score,
        criteria_scores: reviewResult.criteria_scores || {},
        suggestions: reviewResult.suggestions || [],
        needs_revision: reviewResult.needs_revision
      },
      
      metadata: {
        generation_time_ms: Date.now() - this.kostenTracker.startTime,
        api_calls: this.kostenTracker.apiCalls,
        tokens_used: this.kostenTracker.tokensUsed,
        revision_iterations: revisionIterations
      }
    };
    
    this.updateProgress("complete", 100, "Antrag generiert!");
    console.log(`[Pipeline] Abgeschlossen in ${antrag.metadata.generation_time_ms}ms, ${this.kostenTracker.apiCalls} API-Calls`);
    
    return antrag;
  }

  /**
   * Schritt 1: Analyse der Stichworte
   */
  private async schritt1Analyse(keywords: string[]): Promise<StichwortAnalyse> {
    const prompt = generateAnalysePrompt(keywords, this.programmSchema);
    
    try {
      const response = await this.callGeminiAPI(prompt, true);
      const parsed = JSON.parse(response);
      
      return {
        keywords,
        keyword_to_section_mapping: parsed.keyword_to_section || {},
        suggested_focus_areas: parsed.suggested_focus_areas || [],
        estimated_quality_score: this.calculateKeywordQuality(keywords, parsed)
      };
    } catch (error) {
      console.warn("[Pipeline] Analyse-Fehler, nutze Fallback:", error);
      return this.fallbackAnalyse(keywords);
    }
  }

  /**
   * Schritt 2: Generation der Sektionen
   */
  private async schritt2Generation(
    keywords: string[],
    analyse: StichwortAnalyse
  ): Promise<Record<string, string>> {
    const sections: Record<string, string> = {};
    const totalSections = this.programmSchema.sections.length;
    
    for (let i = 0; i < totalSections; i++) {
      const section = this.programmSchema.sections[i];
      const progress = 30 + Math.floor((i / totalSections) * 35);
      
      this.updateProgress(
        "generation", 
        progress, 
        `Generiere: ${section.title}...`
      );
      
      // Bestimme relevante Keywords für diese Sektion
      const relevantKeywords = analyse.keyword_to_section_mapping[section.id] || 
        this.findRelevantKeywords(section, keywords);
      
      // Generiere die Sektion
      const prompt = generateSectionPrompt(
        section,
        keywords,
        relevantKeywords,
        this.programmSchema,
        this.antragsprosaGuide,
        sections // Vorherige Sektionen für Kohärenz
      );
      
      try {
        const response = await this.callGeminiAPI(prompt, true);
        const parsed = JSON.parse(response);
        
        // Kombiniere alle Felder zu einem Text
        let sectionContent = `# ${section.title}\n\n`;
        if (parsed.fields) {
          Object.entries(parsed.fields).forEach(([fieldId, content]) => {
            const field = section.fields.find(f => f.id === fieldId);
            if (field && content) {
              sectionContent += `## ${field.title}\n\n${content}\n\n`;
            }
          });
        }
        
        sections[section.id] = sectionContent.trim();
      } catch (error) {
        console.warn(`[Pipeline] Fehler bei Sektion ${section.id}:`, error);
        sections[section.id] = this.fallbackSection(section, relevantKeywords);
      }
    }
    
    return sections;
  }

  /**
   * Schritt 3: Self-Review
   */
  private async schritt3SelfReview(
    generatedSections: Record<string, string>
  ): Promise<any> {
    const prompt = generateSelfReviewPrompt(
      generatedSections,
      this.programmSchema,
      this.antragsprosaGuide
    );
    
    try {
      const response = await this.callGeminiAPI(prompt, true);
      return JSON.parse(response);
    } catch (error) {
      console.warn("[Pipeline] Review-Fehler, nutze Fallback:", error);
      return this.fallbackReview(generatedSections);
    }
  }

  /**
   * Schritt 4: Revision schwacher Sektionen
   */
  private async schritt4Revision(
    sections: Record<string, string>,
    reviewResult: any
  ): Promise<Record<string, string>> {
    const revised = { ...sections };
    const priorityRevisions = reviewResult.priority_revisions || [];
    
    for (const sectionId of priorityRevisions.slice(0, 3)) { // Max 3 Revisionen
      const section = this.programmSchema.sections.find(s => s.id === sectionId);
      if (!section || !sections[sectionId]) continue;
      
      const sectionReview = reviewResult.section_scores?.[sectionId] || {};
      
      const prompt = generateRevisionPrompt(
        sectionId,
        section.title,
        sections[sectionId],
        sectionReview,
        this.antragsprosaGuide
      );
      
      try {
        const response = await this.callGeminiAPI(prompt, false);
        revised[sectionId] = response.trim();
      } catch (error) {
        console.warn(`[Pipeline] Revisions-Fehler für ${sectionId}:`, error);
      }
    }
    
    return revised;
  }

  /**
   * Gemini API Call
   */
  private async callGeminiAPI(prompt: string, expectJson: boolean): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY nicht konfiguriert");
    }
    
    this.kostenTracker.apiCalls++;
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: expectJson ? 0.3 : 0.5,
          maxOutputTokens: 8192,
          responseMimeType: expectJson ? "application/json" : "text/plain"
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API Fehler: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Schätze Tokens (ca. 4 Zeichen pro Token)
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    this.kostenTracker.tokensUsed += Math.ceil((prompt.length + outputText.length) / 4);
    
    // Gemini Flash: ca. $0.075 pro 1M Tokens
    this.kostenTracker.estimatedCost = (this.kostenTracker.tokensUsed / 1000000) * 0.075;
    
    return outputText;
  }

  /**
   * Hilfsmethoden
   */
  private updateProgress(step: PipelineStatus["step"], percent: number, message: string) {
    const status: PipelineStatus = {
      step,
      progress_percent: percent,
      messages: [message]
    };
    
    if (this.onProgress) {
      this.onProgress(status);
    }
    
    console.log(`[Pipeline] ${step}: ${percent}% - ${message}`);
  }

  private calculateKeywordQuality(keywords: string[], analysis: any): number {
    // Berechne geschätzte Qualität basierend auf Keyword-Abdeckung
    const sectionCount = this.programmSchema.sections.length;
    const mappedSectionCount = Object.keys(analysis.keyword_to_section || {}).length;
    const coverage = mappedSectionCount / sectionCount;
    
    let score = Math.min(100, Math.floor(coverage * 100));
    if (keywords.length < 5) score -= 20;
    if (keywords.length > 15) score += 10;
    
    return Math.max(0, score);
  }

  private findRelevantKeywords(section: any, keywords: string[]): string[] {
    // Heuristik: Finde Keywords die thematisch zur Sektion passen
    const sectionTitle = section.title.toLowerCase();
    return keywords.filter(kw => {
      const kwLower = kw.toLowerCase();
      return sectionTitle.includes(kwLower) || 
             section.fields.some((f: any) => 
               f.title.toLowerCase().includes(kwLower) ||
               f.prompt_question.toLowerCase().includes(kwLower)
             );
    });
  }

  private generateFinancials(keywords: string[]): any {
    // Extrahiere Budget aus Keywords oder nutze Standard
    const budgetMatch = keywords.join(" ").match(/(\d+)\s*€?\s*(?:Euro|Tsd|EUR)/i);
    const requestedAmount = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : 25000;
    
    const schema = this.programmSchema.financials;
    const eigenanteil = Math.floor(requestedAmount * (schema.eigenanteil_typisch_percent || 10) / 100);
    
    // Verteile auf Kategorien
    const kostenaufteilung: Record<string, number> = {};
    const categories = schema.categories.filter(c => c.foerderfaehig);
    const amountPerCategory = Math.floor(requestedAmount / categories.length);
    
    categories.forEach(cat => {
      kostenaufteilung[cat.id] = amountPerCategory;
    });
    
    return {
      gesamtkosten: requestedAmount + eigenanteil,
      foerderbetrag: requestedAmount,
      eigenanteil,
      kostenaufteilung
    };
  }

  /**
   * Fallback-Methoden
   */
  private fallbackAnalyse(keywords: string[]): StichwortAnalyse {
    const mapping: Record<string, string[]> = {};
    
    this.programmSchema.sections.forEach(section => {
      mapping[section.id] = this.findRelevantKeywords(section, keywords);
    });
    
    return {
      keywords,
      keyword_to_section_mapping: mapping,
      suggested_focus_areas: keywords.slice(0, 3),
      estimated_quality_score: 60
    };
  }

  private fallbackSection(section: any, keywords: string[]): string {
    return `# ${section.title}

## Platzhalter-Inhalt

Basierend auf den Stichworten: ${keywords.join(", ")}

[Inhalt konnte nicht generiert werden. Bitte manuell ergänzen.]

## Hinweise

- Diese Sektion erfordert: ${section.fields.filter((f: any) => f.required).length} Pflichtfelder
- Maximale Länge: ${section.fields.reduce((sum: number, f: any) => sum + (f.max_chars || 1000), 0)} Zeichen
`;
  }

  private fallbackReview(sections: Record<string, string>): any {
    return {
      overall_score: 70,
      section_scores: {},
      criteria_scores: {},
      suggestions: ["Bitte manuell prüfen"],
      needs_revision: false
    };
  }

  /**
   * Getter für Kosten-Tracking
   */
  getKosten(): KostenTracker {
    return { ...this.kostenTracker };
  }
}

// Exportiere Factory-Funktion
export async function createAntragPipeline(
  programmId: string,
  onProgress?: (status: PipelineStatus) => void
): Promise<AntragPipeline> {
  // Lade Schema
  const schemaModule = await import(`@/data/programm-schemas/${programmId}.json`);
  const programmSchema: ProgrammSchema = schemaModule.default || schemaModule;
  
  // Lade Prosa-Guide
  let antragsprosaGuide = null;
  try {
    const guideModule = await import(`@/data/antragsprosa-guide.json`);
    antragsprosaGuide = guideModule.default || guideModule;
  } catch (e) {
    console.warn("Antragsprosa-Guide nicht gefunden");
  }
  
  return new AntragPipeline(programmSchema, antragsprosaGuide, onProgress);
}
