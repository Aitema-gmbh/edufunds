-- =============================================================================
-- EduFunds Datenbank Schema (PostgreSQL)
-- =============================================================================

-- =============================================================================
-- Newsletter Tabelle
-- Speichert Newsletter-Abonnenten mit Double-Opt-In
-- =============================================================================

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

-- Index für Status (für Admin-Panel Filter)
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);

-- Index für Erstellungsdatum (für Sortierung)
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_requests(created_at);
