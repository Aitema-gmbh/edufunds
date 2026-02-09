/**
 * Datenbank Typen für EduFunds Backend
 * 
 * Diese Datei enthält alle TypeScript Interfaces für die Datenbank-Models.
 */

// =============================================================================
// Newsletter
// =============================================================================

/**
 * Newsletter-Eintrag in der Datenbank
 */
export interface NewsletterEntry {
  id: number;
  email: string;
  confirmed: boolean;
  confirmation_token: string | null;
  unsubscribe_token: string;
  created_at: string;
  updated_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

/**
 * Newsletter-Eintrag beim Erstellen (ohne ID und Timestamps)
 */
export interface NewsletterEntryCreate {
  email: string;
  confirmed?: boolean;
  confirmation_token?: string | null;
  unsubscribe_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

/**
 * Newsletter-Eintrag für öffentliche API (ohne sensitive Daten)
 */
export interface NewsletterEntryPublic {
  id: number;
  email: string;
  confirmed: boolean;
  created_at: string;
}

// =============================================================================
// Kontaktanfragen
// =============================================================================

/**
 * Kontaktanfrage in der Datenbank
 */
export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
}

/**
 * Status einer Kontaktanfrage
 */
export type ContactStatus = 'new' | 'in_progress' | 'answered' | 'archived';

/**
 * Kontaktanfrage beim Erstellen (ohne ID und Timestamps)
 */
export interface ContactRequestCreate {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: ContactStatus;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
}

/**
 * Kontaktanfrage für Admin-Panel
 */
export interface ContactRequestAdmin extends ContactRequest {
  // Alle Felder sichtbar für Admins
}

// =============================================================================
// Datenbank Helper Typen
// =============================================================================

/**
 * Generische Query Options für Listen
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Paginierte Ergebnisse
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Datenbank Status
 */
export interface DatabaseStatus {
  connected: boolean;
  databasePath: string;
  tables: string[];
  recordCounts: Record<string, number>;
}

// =============================================================================
// API Response Typen
// =============================================================================

/**
 * Standard API Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Newsletter Subscription Response
 */
export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  requiresConfirmation?: boolean;
}

/**
 * Contact Form Response
 */
export interface ContactFormResponse {
  success: boolean;
  message: string;
  ticketId?: number;
}
