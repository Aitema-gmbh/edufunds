# EduFunds Datenbank (PostgreSQL)

Diese Dokumentation beschreibt die PostgreSQL-Datenbank-Integration für EduFunds.

## Überblick

- **Datenbank**: PostgreSQL 16
- **Driver**: pg (node-postgres)
- **Connection**: Umgebungsvariable `DATABASE_URL`
- **Schema**: `data/schema.sql`

## Umgebungsvariablen

```bash
# Lokal
DATABASE_URL=postgresql://localhost:5432/edufunds

# Mit Docker
DATABASE_URL=postgresql://edufunds:edufunds_secret@localhost:5432/edufunds

# Produktion (Render, Railway, etc.)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

## Docker Compose

PostgreSQL läuft im Docker Container (siehe `docker-compose.yml`):

```bash
# Starten
docker compose up -d postgres

# Logs ansehen
docker compose logs -f postgres

# Datenbank-Backup
docker exec edufunds-postgres pg_dump -U edufunds edufunds > backup.sql

# Datenbank wiederherstellen
docker exec -i edufunds-postgres psql -U edufunds edufunds < backup.sql
```

## Tabellen

### newsletter_entries

Speichert Newsletter-Abonnenten mit Double-Opt-In Verfahren.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | SERIAL | Primärschlüssel |
| email | VARCHAR(255) | Email-Adresse (UNIQUE) |
| confirmed | BOOLEAN | Bestätigungsstatus |
| confirmation_token | VARCHAR(64) | Token für Email-Bestätigung |
| unsubscribe_token | VARCHAR(64) | Token für Austragen |
| created_at | TIMESTAMP | Erstellungszeitpunkt |
| updated_at | TIMESTAMP | Letzte Änderung |
| ip_address | INET | IP-Adresse des Nutzers |
| user_agent | TEXT | Browser-Info |

### contact_requests

Speichert Kontaktformular-Einträge.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | SERIAL | Primärschlüssel |
| name | VARCHAR(255) | Name des Absenders |
| email | VARCHAR(255) | Email-Adresse |
| subject | VARCHAR(500) | Betreff |
| message | TEXT | Nachricht |
| status | VARCHAR(20) | Status: new, in_progress, answered, archived |
| created_at | TIMESTAMP | Erstellungszeitpunkt |
| updated_at | TIMESTAMP | Letzte Änderung |
| ip_address | INET | IP-Adresse |
| user_agent | TEXT | Browser-Info |
| referrer | TEXT | Herkunftsseite |

## Verwendung

### Initialisierung

```typescript
import { initializeDatabase } from '@/lib/db';

// Beim Server-Start aufrufen (async!)
await initializeDatabase();
```

### Newsletter abonnieren

```typescript
import { createNewsletterEntry, generateToken } from '@/lib/db';

const entry = await createNewsletterEntry({
  email: 'user@example.com',
  confirmed: false,
  confirmation_token: generateToken(),
  unsubscribe_token: generateToken(),
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
});
```

### Newsletter bestätigen

```typescript
import { confirmNewsletterEntry } from '@/lib/db';

const success = await confirmNewsletterEntry(token);
```

### Kontaktanfrage erstellen

```typescript
import { createContactRequest } from '@/lib/db';

const request = await createContactRequest({
  name: 'Max Mustermann',
  email: 'max@example.com',
  subject: 'Frage',
  message: 'Hallo, ich habe eine Frage...',
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
});
```

## Wichtig: Async/Await

Alle Datenbank-Funktionen sind **asynchron** (Promise-basiert):

```typescript
// ❌ Falsch (SQLite war sync)
const entry = getNewsletterEntryById(1);

// ✅ Richtig (PostgreSQL ist async)
const entry = await getNewsletterEntryById(1);
```

## Pool Management

Der Pool wird automatisch verwaltet. Bei Server-Shutdown:

```typescript
import { closePool } from '@/lib/db';

// Cleanup beim Beenden
process.on('SIGTERM', async () => {
  await closePool();
});
```

## Migration von SQLite

1. Daten exportieren: `npm run db:export`
2. PostgreSQL starten
3. `DATABASE_URL` setzen
4. `await initializeDatabase()` aufrufen
5. Daten importieren

## Backup & Restore

```bash
# Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20240209.sql
```
