-- =============================================================================
-- EduFunds Datenbank Schema
-- SQLite Datenbank für Newsletter und Kontaktanfragen
-- =============================================================================

-- =============================================================================
-- Newsletter Tabelle
-- Speichert Newsletter-Abonnenten mit Double-Opt-In
-- =============================================================================

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

-- Index für schnelle Email-Suche
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_entries(email);

-- Index für Confirmation Token
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation ON newsletter_entries(confirmation_token);

-- Index für Unsubscribe Token
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe ON newsletter_entries(unsubscribe_token);

-- =============================================================================
-- Kontaktanfragen Tabelle
-- Speichert Kontaktformular-Einträge
-- =============================================================================

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

-- Index für Status (für Admin-Panel Filter)
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);

-- Index für Erstellungsdatum (für Sortierung)
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_requests(created_at);

-- =============================================================================
-- Datenbank-Einstellungen
-- =============================================================================

-- Aktiviere Foreign Keys
PRAGMA foreign_keys = ON;

-- Write-Ahead Logging für bessere Performance bei gleichzeitigen Zugriffen
PRAGMA journal_mode = WAL;

-- Synchronisation für Datensicherheit (FULL = sicherster Modus)
PRAGMA synchronous = NORMAL;
