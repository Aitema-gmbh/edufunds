-- =============================================================================
-- EduFunds Database Initialization
-- =============================================================================
-- Dieses Script wird automatisch beim ersten Start des PostgreSQL Containers
-- ausgeführt (über docker-entrypoint-initdb.d).
--
-- Es erstellt:
-- - Newsletter Tabelle
-- - Kontaktanfragen Tabelle
-- - Indizes für Performance
-- - Constraints für Datenintegrität
-- =============================================================================

-- =============================================================================
-- Newsletter Entries Table
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

-- Indizes für Newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_entries(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation ON newsletter_entries(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe ON newsletter_entries(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON newsletter_entries(created_at DESC);

-- Trigger für automatisches updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_newsletter_updated_at ON newsletter_entries;
CREATE TRIGGER update_newsletter_updated_at
    BEFORE UPDATE ON newsletter_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Contact Requests Table
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

-- Indizes für Kontaktanfragen
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_requests(email);

-- Trigger für automatisches updated_at
DROP TRIGGER IF EXISTS update_contact_updated_at ON contact_requests;
CREATE TRIGGER update_contact_updated_at
    BEFORE UPDATE ON contact_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- KI-Anträge Table (für zukünftige Nutzung)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ki_antraege (
    id SERIAL PRIMARY KEY,
    foerderprogramm_id VARCHAR(100) NOT NULL,
    foerderprogramm_name VARCHAR(500) NOT NULL,
    antrag_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);

-- Indizes für KI-Anträge
CREATE INDEX IF NOT EXISTS idx_ki_antraege_programm ON ki_antraege(foerderprogramm_id);
CREATE INDEX IF NOT EXISTS idx_ki_antraege_status ON ki_antraege(status);
CREATE INDEX IF NOT EXISTS idx_ki_antraege_created ON ki_antraege(created_at DESC);

-- Trigger für automatisches updated_at
DROP TRIGGER IF EXISTS update_ki_antraege_updated_at ON ki_antraege;
CREATE TRIGGER update_ki_antraege_updated_at
    BEFORE UPDATE ON ki_antraege
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Logging Table (für Audit Logs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================================================
-- Kommentare für Dokumentation
-- =============================================================================
COMMENT ON TABLE newsletter_entries IS 'Newsletter-Abonnenten mit Double-Opt-In';
COMMENT ON TABLE contact_requests IS 'Kontaktformular-Einträge';
COMMENT ON TABLE ki_antraege IS 'Generierte KI-Anträge für Förderprogramme';
COMMENT ON TABLE audit_logs IS 'Audit-Log für wichtige Aktionen';
