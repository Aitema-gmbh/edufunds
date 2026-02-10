/**
 * Datenbank-Modul für EduFunds Backend
 * 
 * Nutzt pg (node-postgres) für PostgreSQL Verbindung.
 * Connection String aus Umgebungsvariable DATABASE_URL.
 */

import { Pool, PoolClient, QueryResult } from 'pg';
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

const DEFAULT_DATABASE_URL = 'postgresql://localhost:5432/edufunds';
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

// =============================================================================
// Pool Management
// =============================================================================

let pool: Pool | null = null;

/**
 * Gibt den PostgreSQL Pool zurück (Singleton-Pattern)
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unerwarteter Pool-Fehler:', err);
    });
  }
  return pool;
}

/**
 * Führt eine Query aus und gibt das Ergebnis zurück
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

/**
 * Führt eine Query mit einem Client aus (für Transaktionen)
 */
export async function withClient<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

/**
 * Schließt den Pool (sollte beim Herunterfahren aufgerufen werden)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// =============================================================================
// Initialisierung
// =============================================================================

/**
 * Initialisiert die Datenbank und erstellt alle Tabellen
 */
export async function initializeDatabase(): Promise<void> {
  // Newsletter-Tabelle
  await query(`
    CREATE TABLE IF NOT EXISTS newsletter_entries (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      confirmed BOOLEAN DEFAULT FALSE,
      confirmation_token VARCHAR(64),
      unsubscribe_token VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address INET,
      user_agent TEXT
    );
  `);

  // Index für Email
  await query(`
    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_entries(email);
  `);

  // Index für Confirmation Token
  await query(`
    CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation ON newsletter_entries(confirmation_token);
  `);

  // Index für Unsubscribe Token
  await query(`
    CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe ON newsletter_entries(unsubscribe_token);
  `);

  // Kontaktanfragen-Tabelle
  await query(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'answered', 'archived')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address INET,
      user_agent TEXT,
      referrer TEXT
    );
  `);

  // Index für Status
  await query(`
    CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);
  `);

  // Index für Erstellungsdatum
  await query(`
    CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_requests(created_at);
  `);

  console.log('[DB] Datenbank initialisiert:', DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
}

/**
 * Prüft ob die Datenbank initialisiert ist
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const result = await query<{ name: string }>(`
      SELECT table_name as name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('newsletter_entries', 'contact_requests')
    `);
    return result.rows.length === 2;
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
export async function createNewsletterEntry(
  entry: NewsletterEntryCreate
): Promise<NewsletterEntry | null> {
  try {
    const result = await query<NewsletterEntry>(`
      INSERT INTO newsletter_entries 
        (email, confirmed, confirmation_token, unsubscribe_token, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      entry.email.toLowerCase().trim(),
      entry.confirmed || false,
      entry.confirmation_token || null,
      entry.unsubscribe_token,
      entry.ip_address || null,
      entry.user_agent || null,
    ]);

    return result.rows[0] || null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    console.error('[DB] Fehler beim Erstellen des Newsletter-Eintrags:', error);
    return null;
  }
}

/**
 * Holt einen Newsletter-Eintrag anhand der ID
 */
export async function getNewsletterEntryById(id: number): Promise<NewsletterEntry | null> {
  const result = await query<NewsletterEntry>(
    'SELECT * FROM newsletter_entries WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Holt einen Newsletter-Eintrag anhand der Email
 */
export async function getNewsletterEntryByEmail(email: string): Promise<NewsletterEntry | null> {
  const result = await query<NewsletterEntry>(
    'SELECT * FROM newsletter_entries WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  return result.rows[0] || null;
}

/**
 * Holt einen Newsletter-Eintrag anhand des Confirmation Tokens
 */
export async function getNewsletterEntryByConfirmationToken(
  token: string
): Promise<NewsletterEntry | null> {
  const result = await query<NewsletterEntry>(
    'SELECT * FROM newsletter_entries WHERE confirmation_token = $1',
    [token]
  );
  return result.rows[0] || null;
}

/**
 * Holt einen Newsletter-Eintrag anhand des Unsubscribe Tokens
 */
export async function getNewsletterEntryByUnsubscribeToken(
  token: string
): Promise<NewsletterEntry | null> {
  const result = await query<NewsletterEntry>(
    'SELECT * FROM newsletter_entries WHERE unsubscribe_token = $1',
    [token]
  );
  return result.rows[0] || null;
}

/**
 * Bestätigt einen Newsletter-Eintrag
 */
export async function confirmNewsletterEntry(token: string): Promise<boolean> {
  const result = await query(`
    UPDATE newsletter_entries 
    SET confirmed = TRUE, confirmation_token = NULL, updated_at = CURRENT_TIMESTAMP 
    WHERE confirmation_token = $1
  `, [token]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Löscht einen Newsletter-Eintrag anhand des Unsubscribe Tokens
 */
export async function unsubscribeNewsletterEntry(token: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM newsletter_entries WHERE unsubscribe_token = $1',
    [token]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Löscht einen Newsletter-Eintrag anhand der ID
 */
export async function deleteNewsletterEntry(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM newsletter_entries WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Holt alle Newsletter-Einträge (mit Pagination)
 */
export async function getNewsletterEntries(
  options: QueryOptions = {}
): Promise<PaginatedResult<NewsletterEntry>> {
  const { limit = 50, offset = 0, orderBy = 'created_at', orderDirection = 'DESC' } = options;

  // SQL Injection Schutz
  const allowedColumns = ['id', 'email', 'confirmed', 'created_at', 'updated_at'];
  const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'created_at';
  const safeDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';

  const countResult = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM newsletter_entries'
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await query<NewsletterEntry>(`
    SELECT * FROM newsletter_entries 
    ORDER BY ${safeOrderBy} ${safeDirection} 
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  return { data: dataResult.rows, total, limit, offset };
}

/**
 * Holt alle bestätigten Newsletter-Einträge
 */
export async function getConfirmedNewsletterEntries(): Promise<NewsletterEntry[]> {
  const result = await query<NewsletterEntry>(`
    SELECT * FROM newsletter_entries 
    WHERE confirmed = TRUE 
    ORDER BY created_at ASC
  `);
  return result.rows;
}

/**
 * Zählt die Newsletter-Einträge
 */
export async function countNewsletterEntries(confirmedOnly = false): Promise<number> {
  const sql = confirmedOnly 
    ? 'SELECT COUNT(*) as count FROM newsletter_entries WHERE confirmed = TRUE'
    : 'SELECT COUNT(*) as count FROM newsletter_entries';
  const result = await query<{ count: string }>(sql);
  return parseInt(result.rows[0].count, 10);
}

// =============================================================================
// Kontaktanfragen CRUD Operationen
// =============================================================================

/**
 * Erstellt eine neue Kontaktanfrage
 */
export async function createContactRequest(
  request: ContactRequestCreate
): Promise<ContactRequest | null> {
  try {
    const result = await query<ContactRequest>(`
      INSERT INTO contact_requests 
        (name, email, subject, message, status, ip_address, user_agent, referrer)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      request.name.trim(),
      request.email.toLowerCase().trim(),
      request.subject.trim(),
      request.message.trim(),
      request.status || 'new',
      request.ip_address || null,
      request.user_agent || null,
      request.referrer || null,
    ]);

    return result.rows[0] || null;
  } catch (error) {
    console.error('[DB] Fehler beim Erstellen der Kontaktanfrage:', error);
    return null;
  }
}

/**
 * Holt eine Kontaktanfrage anhand der ID
 */
export async function getContactRequestById(id: number): Promise<ContactRequest | null> {
  const result = await query<ContactRequest>(
    'SELECT * FROM contact_requests WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Holt alle Kontaktanfragen (mit Pagination und Filter)
 */
export async function getContactRequests(
  options: QueryOptions & { status?: ContactStatus } = {}
): Promise<PaginatedResult<ContactRequest>> {
  const { limit = 50, offset = 0, orderBy = 'created_at', orderDirection = 'DESC', status } = options;

  // SQL Injection Schutz
  const allowedColumns = ['id', 'name', 'email', 'subject', 'status', 'created_at', 'updated_at'];
  const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'created_at';
  const safeDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';

  let whereClause = '';
  const params: (string | number)[] = [];

  if (status) {
    whereClause = 'WHERE status = $3';
    params.push(status);
  }

  const countSql = `SELECT COUNT(*) as count FROM contact_requests ${whereClause}`;
  const countResult = await query<{ count: string }>(countSql, status ? [status] : []);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataSql = `
    SELECT * FROM contact_requests ${whereClause}
    ORDER BY ${safeOrderBy} ${safeDirection}
    LIMIT $1 OFFSET $2
  `;
  const dataResult = await query<ContactRequest>(dataSql, [limit, offset, ...params]);

  return { data: dataResult.rows, total, limit, offset };
}

/**
 * Aktualisiert den Status einer Kontaktanfrage
 */
export async function updateContactRequestStatus(
  id: number,
  status: ContactStatus
): Promise<boolean> {
  const result = await query(`
    UPDATE contact_requests 
    SET status = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2
  `, [status, id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Löscht eine Kontaktanfrage
 */
export async function deleteContactRequest(id: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM contact_requests WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Zählt die Kontaktanfragen
 */
export async function countContactRequests(status?: ContactStatus): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM contact_requests';
  const params: string[] = [];

  if (status) {
    sql += ' WHERE status = $1';
    params.push(status);
  }

  const result = await query<{ count: string }>(sql, params);
  return parseInt(result.rows[0].count, 10);
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
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const tablesResult = await query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  const tableNames = tablesResult.rows.map(r => r.table_name);
  const recordCounts: Record<string, number> = {};

  for (const table of tableNames) {
    if (!table.startsWith('pg_') && !table.startsWith('sql_')) {
      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) as count FROM "${table}"`
      );
      recordCounts[table] = parseInt(countResult.rows[0].count, 10);
    }
  }

  return {
    connected: true,
    databasePath: DATABASE_URL.replace(/:[^:@]*@/, ':****@'),
    tables: tableNames,
    recordCounts,
  };
}

/**
 * Exportiert alle Daten als JSON
 */
export async function exportDatabaseData(): Promise<{
  newsletter: NewsletterEntry[];
  contacts: ContactRequest[];
}> {
  const newsletterResult = await query<NewsletterEntry>(`
    SELECT * FROM newsletter_entries ORDER BY created_at DESC
  `);
  const contactsResult = await query<ContactRequest>(`
    SELECT * FROM contact_requests ORDER BY created_at DESC
  `);

  return {
    newsletter: newsletterResult.rows,
    contacts: contactsResult.rows,
  };
}

// =============================================================================
// Default Export
// =============================================================================

export default {
  // Verbindung
  getPool,
  query,
  withClient,
  closePool,
  
  // Initialisierung
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
