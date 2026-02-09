# Newsletter API

API-Endpunkt für Newsletter-Anmeldungen mit Double-Opt-In.

## Endpunkt

```
/api/newsletter
```

## POST - Newsletter-Anmeldung

Neue Anmeldung zum Newsletter. Sendet Double-Opt-In E-Mail.

### Request

```bash
curl -X POST http://localhost:3101/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Response (Success - 201)

```json
{
  "success": true,
  "message": "Bitte bestätigen Sie Ihre Anmeldung über den Link in der E-Mail, die wir Ihnen gesendet haben."
}
```

### Response (Already Confirmed - 200)

```json
{
  "success": true,
  "message": "Sie sind bereits für unseren Newsletter angemeldet."
}
```

### Response (Validation Error - 400)

```json
{
  "success": false,
  "message": "Validierungsfehler",
  "errors": [
    { "field": "email", "message": "Bitte geben Sie eine gültige E-Mail-Adresse ein" }
  ]
}
```

### Response (Rate Limit - 429)

```json
{
  "success": false,
  "message": "Zu viele Anfragen. Bitte versuchen Sie es in 60 Minuten erneut."
}
```

### Rate Limiting

- **Limit**: 5 Anfragen pro Stunde pro IP
- **Headers**:
  - `X-RateLimit-Limit`: 5
  - `X-RateLimit-Remaining`: 4
  - `X-RateLimit-Reset`: 3600

## GET - Anmeldung bestätigen

Bestätigt die Newsletter-Anmeldung über Token.

### Request

```
GET /api/newsletter?token=<uuid>
```

### Response

Gibt eine HTML-Erfolgsseite zurück:
- Bei Erfolg: Bestätigungsmeldung + Link zur Startseite
- Bei Fehler: Fehlermeldung mit entsprechendem Status Code

## Environment Variables

```env
# Für E-Mail-Versand (optional, Mock-Modus wenn nicht gesetzt)
RESEND_API_KEY=your_resend_api_key

# Basis-URL für Bestätigungslinks
NEXT_PUBLIC_APP_URL=https://edufunds.de
```

## Dateien

| Datei | Beschreibung |
|-------|-------------|
| `app/api/newsletter/route.ts` | API Route Handler |
| `lib/newsletter-schema.ts` | Zod Validierungsschema |
| `lib/newsletter-templates.ts` | E-Mail HTML Templates |

## Datenbank

Aktuell wird ein In-Memory Store verwendet (für MVP). Für Production:

1. SQLite mit better-sqlite3 (bereits installiert)
2. Oder PostgreSQL/MySQL

### Migration zu SQLite

```typescript
import Database from 'better-sqlite3';

const db = new Database('newsletter.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    confirmed BOOLEAN DEFAULT FALSE,
    token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME,
    ip_address TEXT
  );
  
  CREATE INDEX IF NOT EXISTS idx_token ON newsletter_subscriptions(token);
  CREATE INDEX IF NOT EXISTS idx_email ON newsletter_subscriptions(email);
`);
```
