/**
 * Programm-Schema Typen für den KI-Antragsgenerator
 * Definiert die Struktur von Antragsformularen für verschiedene Förderprogramme
 */

// Basis-Typen für Antragsfelder
export type AntragsfeldTyp = "freitext" | "auswahl" | "zahl" | "tabelle" | "datum" | "datei" | "email" | "telefon" | "url" | "mehrzeilig" | "berechnung";

// Auswahlmöglichkeiten für 'auswahl'-Typ
export interface AuswahlOption {
  value: string;
  label: string;
  description?: string;
}

// Einzelnes Antragsfeld innerhalb einer Sektion
export interface Antragsfeld {
  id: string;
  title: string;
  type: AntragsfeldTyp;
  prompt_question: string; // Die Frage, die an die KI gestellt wird
  max_chars?: number;
  max_words?: number;
  required: boolean;
  hints?: string; // Hinweise für den Bewerber / die KI
  weight?: number; // Gewichtung in % der Gesamtbewertung (optional)
  placeholder?: string;
  min_value?: number;
  max_value?: number;
  options?: AuswahlOption[]; // Für 'auswahl'-Typ
  validation_regex?: string; // Optionale Validierung
  depends_on?: { // Bedingte Felder
    field: string;
    value: string | string[];
  };
}

// Eine Sektion des Antragsformulars
export interface Antragssektion {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: Antragsfeld[];
  is_collapsible?: boolean;
  section_weight?: number; // Gewichtung der gesamten Sektion
}

// Finanzplan-Konfiguration
export interface FinanzplanSchema {
  type: "tabelle" | "freitext" | "kalkulation";
  categories: Finanzkategorie[];
  requires_eigenanteil: boolean;
  eigenanteil_min_percent?: number;
  eigenanteil_max_percent?: number;
  eigenanteil_typisch_percent?: number;
  total_min?: number;
  total_max?: number;
  total_step?: number;
  hint_text?: string;
}

export interface Finanzkategorie {
  id: string;
  name: string;
  description?: string;
  foerderfaehig: boolean;
  max_betrag?: number;
  min_betrag?: number;
  typische_positionen?: string[];
}

// Bewertungskriterien
export interface Bewertungskriterium {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100
  keywords: string[]; // Buzzwords die das Kriterium adressieren
  tipps?: string; // Tipps für die Bewerbung
}

// Meta-Informationen zum Programm
export interface ProgrammMeta {
  bewertungskriterien: Bewertungskriterium[];
  typische_buzzwords: string[];
  erfolgsquote_tipps: string;
  haeufige_fehler: string[];
  antragsdauer_schaetzung: string;
  komplexitaet: "einfach" | "mittel" | "komplex";
  prioritaetsfelder: string[]; // Besonders wichtige Sektionen
  kontakt?: {
    email?: string;
    telefon?: string;
    beratung_verfuegbar: boolean;
  };
}

// Zulässige Dateitypen für Uploads
export interface DateiUploadKonfig {
  max_files: number;
  max_size_mb: number;
  erlaubte_typen: string[];
  pflicht_unterlagen: string[];
}

// Komplettes Programm-Schema
export interface ProgrammSchema {
  id: string; // Verweist auf foerderprogramme.json Eintrag
  version: string;
  last_updated: string;
  schema_type: "standard" | "stiftung" | "bund" | "land" | "eu";
  
  // Kopfdaten (werden oft vorausgefüllt)
  kopfdaten: {
    projekttraeger_required: boolean;
    schultraeger_required: boolean;
    ansprechpartner_required: boolean;
    vertretungsberechtigter_required: boolean;
    bankverbindung_required: boolean;
  };
  
  // Die Hauptsektionen
  sections: Antragssektion[];
  
  // Finanzplan
  financials: FinanzplanSchema;
  
  // Meta-Informationen für KI-Optimierung
  meta: ProgrammMeta;
  
  // Uploads
  uploads?: DateiUploadKonfig;
  
  // Besondere Anforderungen
  besondere_anforderungen?: {
    kooperationspartner?: boolean;
    referenzen_benoetigt?: boolean;
    evaluierung_vorgeschrieben?: boolean;
    oeffentlichkeitsarbeit?: boolean;
  };
}

// Für die Pipeline: Strukturierter Plan aus Stichworten
export interface StichwortAnalyse {
  keywords: string[];
  keyword_to_section_mapping: Record<string, string[]>; // keyword -> section IDs
  suggested_focus_areas: string[];
  estimated_quality_score: number; // 0-100, basierend auf Keyword-Vollständigkeit
}

// Pipeline-Ergebnis
export interface PipelineStatus {
  step: "analyse" | "generation" | "self-review" | "revision" | "complete";
  progress_percent: number;
  current_section?: string;
  messages: string[];
}

// Generierter Antrag
export interface GenerierterAntrag {
  schema_id: string;
  programm_id: string;
  generiert_am: string;
  version: string;
  
  // Pro Sektion der generierte Text
  sections: Record<string, {
    content: string;
    char_count: number;
    word_count: number;
    used_keywords: string[];
    quality_score: number; // 0-100
  }>;
  
  // Finanzplan (generiert oder vom Nutzer)
  financials: {
    gesamtkosten: number;
    foerderbetrag: number;
    eigenanteil: number;
    kostenaufteilung: Record<string, number>;
  };
  
  // Self-Review Ergebnis
  self_review: {
    overall_score: number;
    criteria_scores: Record<string, number>;
    suggestions: string[];
    needs_revision: boolean;
  };
  
  // Metadaten
  metadata: {
    generation_time_ms: number;
    api_calls: number;
    tokens_used: number;
    revision_iterations: number;
  };
}

// Export-Formate
export type ExportFormat = "docx" | "pdf" | "txt" | "html" | "json";

export interface ExportConfig {
  format: ExportFormat;
  include_header: boolean;
  include_footer: boolean;
  include_page_numbers: boolean;
  corporate_design?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
}
