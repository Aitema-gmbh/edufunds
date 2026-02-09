/**
 * Datenbank-Modul für EduFunds Backend
 * 
 * Nutzt better-sqlite3 für synchronen, schnellen Datenzugriff.
 * SQLite-Datenbank wird im data/-Verzeichnis gespeichert.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type {
  NewsletterEntry,
  NewsletterEntryCreate,
  ContactRequest,
  ContactRequestCreate,
  ContactStatus,
  QueryOptions,
  PaginatedResult,
  DatabaseStatus,
} from '@/types/db';

// =============================================================================
// Konfiguration
// =============================================================================

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'edufunds.db');

// =============================================================================
// Verbindungs-Management
// =============================================================================

let db: Database.Database | null = null;

/**
 * Gibt die Datenbank-Instanz zurück (Singleton-Pattern)
 * Erstellt die Verbindung bei Bedarf
 */
export function getDatabase(): Database.Database {
  if (!db) {
    // Stelle sicher, dass das data-Verzeichnis existiert
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging für bessere Performance
    db.pragma('foreign_keys = ON'); // Foreign Keys aktivieren
  }
  return db;
}

/**
 * Schließt die Datenbank-Verbindung
 * Sollte beim Herunterfahren des Servers aufgerufen werden
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// =============================================================================
// Initialisierung
// =============================================================================

/**
 * Initialisiert die Datenbank und erstellt alle Tabellen
 * Sollte beim Server-Start aufgerufen werden
 */
export function initializeDatabase(): void {
  const database = getDatabase();

  // Newsletter-Tabelle
  database.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      confirmed BOOLEAN DEFAULT 0,
      confirmation_token TEXT,
      unsubscribe_token TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    );
  `);

  // Index für schnelle Email-Suche
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_entries(email);
  `);

  // Index für Confirmation Token
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation ON newsletter_entries(confirmation_token);
  `);

  // Index für Unsubscribe Token
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe ON newsletter_entries(unsubscribe_token);
  `);

  // Kontaktanfragen-Tabelle
  database.exec(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'answered', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT
    );
  `);

  // Index für Status (für Admin-Panel Filter)
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);
  `);

  // Index für Erstellungsdatum (für Sortierung)
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_requests(created_at);
  `);

  console.log('[DB] Datenbank initialisiert:', DB_PATH);
}

/**
 * Prüft ob die Datenbank initialisiert ist und die Tabellen existieren
 */
export function isDatabaseInitialized(): boolean {
  try {
    const database = getDatabase();
    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('newsletter_entries', 'contact_requests')")
      .all() as { name: string }[];
    return tables.length === 2;
  } catch {
    return false;
  }
}

// =============================================================================
// Newsletter CRUD Operationen
// =============================================================================

/**
 * Fügt einen neuen Newsletter-Eintrag hinzu
 */
export function createNewsletterEntry(entry: NewsletterEntryCreate): NewsletterEntry | null {
  const database = getDatabase();

  try {
    const stmt = database.prepare(`
      INSERT INTO newsletter_entries (email, confirmed, confirmation_token, unsubscribe_token, ip_address, user_agent)
      VALUES (@email, @confirmed, @confirmation_token, @unsubscribe_token, @ip_address, @user_agent)
    `);

    const result = stmt.run({
      email: entry.email.toLowerCase().trim(),
      confirmed: entry.confirmed ? 1 : 0,
      confirmation_token: entry.confirmation_token || null,
      unsubscribe_token: entry.unsubscribe_token,
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || null,
    });

    return getNewsletterEntryById(Number(result.lastInsertRowid));
  } catch (error) {
    // Duplicate email Fehler abfangen
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    console.error('[DB] Fehler beim Erstellen des Newsletter-Eintrags:', error);
    return null;
  }
}

/**
 * Holt einen Newsletter-Eintrag anhand der ID
 */
export function getNewsletterEntryById(id: number): NewsletterEntry | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM newsletter_entries WHERE id = ?');
  const row = stmt.get(id) as NewsletterEntry | undefined;
  return row || null;
}

/**
 * Holt einen Newsletter-Eintrag anhand der Email
 */
export function getNewsletterEntryByEmail(email: string): NewsletterEntry | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM newsletter_entries WHERE email = ?');
  const row = stmt.get(email.toLowerCase().trim()) as NewsletterEntry | undefined;
  return row || null;
}

/**
 * Holt einen Newsletter-Eintrag anhand des Confirmation Tokens
 */
export function getNewsletterEntryByConfirmationToken(token: string): NewsletterEntry | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM newsletter_entries WHERE confirmation_token = ?');
  const row = stmt.get(token) as NewsletterEntry | undefined;
  return row || null;
}

/**
 * Holt einen Newsletter-Eintrag anhand des Unsubscribe Tokens
 */
export function getNewsletterEntryByUnsubscribeToken(token: string): NewsletterEntry | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM newsletter_entries WHERE unsubscribe_token = ?');
  const row = stmt.get(token) as NewsletterEntry | undefined;
  return row || null;
}

/**
 * Bestätigt einen Newsletter-Eintrag anhand des Confirmation Tokens
 */
export function confirmNewsletterEntry(token: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE newsletter_entries 
    SET confirmed = 1, confirmation_token = NULL, updated_at = CURRENT_TIMESTAMP 
    WHERE confirmation_token = ?
  `);
  const result = stmt.run(token);
  return result.changes > 0;
}

/**
 * Löscht einen Newsletter-Eintrag anhand des Unsubscribe Tokens (Austragen)
 */
export function unsubscribeNewsletterEntry(token: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM newsletter_entries WHERE unsubscribe_token = ?');
  const result = stmt.run(token);
  return result.changes > 0;
}

/**
 * Löscht einen Newsletter-Eintrag anhand der ID
 */
export function deleteNewsletterEntry(id: number): boolean {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM newsletter_entries WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Holt alle Newsletter-Einträge (mit Pagination)
 */
export function getNewsletterEntries(options: QueryOptions = {}): PaginatedResult<NewsletterEntry> {
  const database = getDatabase();
  const { limit = 50, offset = 0, orderBy = 'created_at', orderDirection = 'DESC' } = options;

  // Validiere orderBy um SQL Injection zu verhindern
  const allowedColumns = ['id', 'email', 'confirmed', 'created_at', 'updated_at'];
  const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'created_at';
  const safeDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';

  const countStmt = database.prepare('SELECT COUNT(*) as total FROM newsletter_entries');
  const { total } = countStmt.get() as { total: number };

  const dataStmt = database.prepare(`
    SELECT * FROM newsletter_entries 
    ORDER BY ${safeOrderBy} ${safeDirection} 
    LIMIT ? OFFSET ?
  `);
  const data = dataStmt.all(limit, offset) as NewsletterEntry[];

  return { data, total, limit, offset };
}

/**
 * Holt alle bestätigten Newsletter-Einträge (für Versand)
 */
export function getConfirmedNewsletterEntries(): NewsletterEntry[] {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM newsletter_entries WHERE confirmed = 1 ORDER BY created_at ASC');
  return stmt.all() as NewsletterEntry[];
}

/**
 * Zählt die Newsletter-Einträge
 */
export function countNewsletterEntries(confirmedOnly = false): number {
  const database = getDatabase();
  const sql = confirmedOnly 
    ? 'SELECT COUNT(*) as count FROM newsletter_entries WHERE confirmed = 1'
    : 'SELECT COUNT(*) as count FROM newsletter_entries';
  const stmt = database.prepare(sql);
  const result = stmt.get() as { count: number };
  return result.count;
}

// =============================================================================
// Kontaktanfragen CRUD Operationen
// =============================================================================

/**
 * Erstellt eine neue Kontaktanfrage
 */
export function createContactRequest(request: ContactRequestCreate): ContactRequest | null {
  const database = getDatabase();

  try {
    const stmt = database.prepare(`
      INSERT INTO contact_requests (name, email, subject, message, status, ip_address, user_agent, referrer)
      VALUES (@name, @email, @subject, @message, @status, @ip_address, @user_agent, @referrer)
    `);

    const result = stmt.run({
      name: request.name.trim(),
      email: request.email.toLowerCase().trim(),
      subject: request.subject.trim(),
      message: request.message.trim(),
      status: request.status || 'new',
      ip_address: request.ip_address || null,
      user_agent: request.user_agent || null,
      referrer: request.referrer || null,
    });

    return getContactRequestById(Number(result.lastInsertRowid));
  } catch (error) {
    console.error('[DB] Fehler beim Erstellen der Kontaktanfrage:', error);
    return null;
  }
}

/**
 * Holt eine Kontaktanfrage anhand der ID
 */
export function getContactRequestById(id: number): ContactRequest | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM contact_requests WHERE id = ?');
  const row = stmt.get(id) as ContactRequest | undefined;
  return row || null;
}

/**
 * Holt alle Kontaktanfragen (mit Pagination und Filter)
 */
export function getContactRequests(
  options: QueryOptions & { status?: ContactStatus } = {}
): PaginatedResult<ContactRequest> {
  const database = getDatabase();
  const { limit = 50, offset = 0, orderBy = 'created_at', orderDirection = 'DESC', status } = options;

  // Validiere orderBy um SQL Injection zu verhindern
  const allowedColumns = ['id', 'name', 'email', 'subject', 'status', 'created_at', 'updated_at'];
  const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'created_at';
  const safeDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';

  let whereClause = '';
  const params: (string | number)[] = [];

  if (status) {
    whereClause = 'WHERE status = ?';
    params.push(status);
  }

  const countSql = `SELECT COUNT(*) as total FROM contact_requests ${whereClause}`;
  const countStmt = database.prepare(countSql);
  const { total } = (status ? countStmt.get(status) : countStmt.get()) as { total: number };

  const dataSql = `
    SELECT * FROM contact_requests ${whereClause}
    ORDER BY ${safeOrderBy} ${safeDirection}
    LIMIT ? OFFSET ?
  `;
  const dataStmt = database.prepare(dataSql);
  const data = dataStmt.all(...(status ? [status, limit, offset] : [limit, offset])) as ContactRequest[];

  return { data, total, limit, offset };
}

/**
 * Aktualisiert den Status einer Kontaktanfrage
 */
export function updateContactRequestStatus(id: number, status: ContactStatus): boolean {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE contact_requests 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  const result = stmt.run(status, id);
  return result.changes > 0;
}

/**
 * Löscht eine Kontaktanfrage
 */
export function deleteContactRequest(id: number): boolean {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM contact_requests WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Zählt die Kontaktanfragen (optional gefiltert nach Status)
 */
export function countContactRequests(status?: ContactStatus): number {
  const database = getDatabase();
  let sql = 'SELECT COUNT(*) as count FROM contact_requests';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  const stmt = database.prepare(sql);
  const result = stmt.get(...params) as { count: number };
  return result.count;
}

// =============================================================================
// Hilfsfunktionen
// =============================================================================

/**
 * Generiert einen zufälligen Token
 */
export function generateToken(length = 32): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Gibt den Status der Datenbank zurück
 */
export function getDatabaseStatus(): DatabaseStatus {
  const database = getDatabase();

  const tablesStmt = database.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const tables = tablesStmt.all() as { name: string }[];
  const tableNames = tables.map(t => t.name);

  const recordCounts: Record<string, number> = {};
  for (const table of tableNames) {
    if (!table.startsWith('sqlite_')) {
      const countStmt = database.prepare(`SELECT COUNT(*) as count FROM "${table}"`);
      const result = countStmt.get() as { count: number };
      recordCounts[table] = result.count;
    }
  }

  return {
    connected: true,
    databasePath: DB_PATH,
    tables: tableNames,
    recordCounts,
  };
}

/**
 * Exportiert alle Daten als JSON (für Backups)
 */
export function exportDatabaseData(): { newsletter: NewsletterEntry[]; contacts: ContactRequest[] } {
  const database = getDatabase();

  const newsletterStmt = database.prepare('SELECT * FROM newsletter_entries ORDER BY created_at DESC');
  const contactsStmt = database.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC');

  return {
    newsletter: newsletterStmt.all() as NewsletterEntry[],
    contacts: contactsStmt.all() as ContactRequest[],
  };
}

// =============================================================================
// Default Export
// =============================================================================

export default {
  // Verbindung
  getDatabase,
  closeDatabase,
  initializeDatabase,
  isDatabaseInitialized,
  
  // Newsletter
  createNewsletterEntry,
  getNewsletterEntryById,
  getNewsletterEntryByEmail,
  getNewsletterEntryByConfirmationToken,
  getNewsletterEntryByUnsubscribeToken,
  confirmNewsletterEntry,
  unsubscribeNewsletterEntry,
  deleteNewsletterEntry,
  getNewsletterEntries,
  getConfirmedNewsletterEntries,
  countNewsletterEntries,
  
  // Kontakt
  createContactRequest,
  getContactRequestById,
  getContactRequests,
  updateContactRequestStatus,
  deleteContactRequest,
  countContactRequests,
  
  // Hilfsfunktionen
  generateToken,
  getDatabaseStatus,
  exportDatabaseData,
};
