# EduFunds Datenbank

Diese Dokumentation beschreibt die Datenbank-Integration für EduFunds.

## Überblick

- **Datenbank**: SQLite (better-sqlite3)
- **Speicherort**: `data/edufunds.db`
- **Schema**: `data/schema.sql`

## Tabellen

### newsletter_entries

Speichert Newsletter-Abonnenten mit Double-Opt-In Verfahren.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | INTEGER | Primärschlüssel, Auto-Increment |
| email | TEXT | Email-Adresse (UNIQUE) |
| confirmed | BOOLEAN | Bestätigungsstatus (0/1) |
| confirmation_token | TEXT | Token für Email-Bestätigung |
| unsubscribe_token | TEXT | Token für Austragen |
| created_at | DATETIME | Erstellungszeitpunkt |
| updated_at | DATETIME | Letzte Änderung |
| ip_address | TEXT | IP-Adresse des Nutzers |
| user_agent | TEXT | Browser-Info |

### contact_requests

Speichert Kontaktformular-Einträge.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | INTEGER | Primärschlüssel, Auto-Increment |
| name | TEXT | Name des Absenders |
| email | TEXT | Email-Adresse |
| subject | TEXT | Betreff |
| message | TEXT | Nachricht |
| status | TEXT | Status: new, in_progress, answered, archived |
| created_at | DATETIME | Erstellungszeitpunkt |
| updated_at | DATETIME | Letzte Änderung |
| ip_address | TEXT | IP-Adresse |
| user_agent | TEXT | Browser-Info |
| referrer | TEXT | Herkunftsseite |

## Verwendung

### Initialisierung

```typescript
import { initializeDatabase } from '@/lib/db';

// Beim Server-Start aufrufen
initializeDatabase();
```

### Newsletter abonnieren

```typescript
import { createNewsletterEntry, generateToken } from '@/lib/db';

const entry = createNewsletterEntry({
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

const success = confirmNewsletterEntry(token);
```

### Kontaktanfrage erstellen

```typescript
import { createContactRequest } from '@/lib/db';

const request = createContactRequest({
  name: 'Max Mustermann',
  email: 'max@example.com',
  subject: 'Frage',
  message: 'Hallo, ich habe eine Frage...',
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
});
```

## API Routes Beispiele

Siehe `app/api/newsletter/route.ts` und `app/api/contact/route.ts` für vollständige Implementierungen.

## Backup

Die Datenbank-Datei `data/edufunds.db` kann einfach kopiert werden:

```bash
cp data/edufunds.db data/backups/edufunds-$(date +%Y%m%d).db
```

## Migration zu PostgreSQL

Für Produktionsumgebungen kann später auf PostgreSQL migriert werden:

1. `pg` statt `better-sqlite3` installieren
2. Connection-String in `lib/db.ts` anpassen
3. SQL-Schema leicht anpassen (SQLite-spezifische Syntax)
