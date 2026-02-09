# Kontakt API

Dieser API-Endpunkt verarbeitet Kontaktanfragen vom EduFunds Kontaktformular.

## Endpunkt

```
POST /api/contact
```

## Request Body

```typescript
{
  name: string;           // min 2 Zeichen, max 100 Zeichen
  email: string;          // gültige E-Mail-Adresse
  subject: string;        // min 5 Zeichen, max 200 Zeichen
  message: string;        // min 20 Zeichen, max 5000 Zeichen
  datenschutz: true;      // muss true sein
  website?: string;       // Honeypot-Feld (sollte leer bleiben)
  timestamp?: number;     // Zeitstempel für Spam-Schutz
}
```

## Response

### Erfolg (200)
```json
{
  "success": true,
  "message": "Ihre Nachricht wurde erfolgreich gesendet."
}
```

### Validierungsfehler (400)
```json
{
  "success": false,
  "error": "Validierungsfehler",
  "errors": [
    { "field": "name", "message": "Name muss mindestens 2 Zeichen lang sein" }
  ]
}
```

### Rate Limit (429)
```json
{
  "success": false,
  "error": "Zu viele Anfragen. Bitte versuchen Sie es später erneut."
}
```

### Serverfehler (500)
```json
{
  "success": false,
  "error": "Interner Serverfehler. Bitte versuchen Sie es später erneut."
}
```

## Spam-Schutz

Der Endpunkt implementiert mehrere Spam-Schutzmechanismen:

1. **Honeypot-Feld (`website`)**: Ein verstecktes Feld, das von Bots ausgefüllt wird
2. **Zeit-Check (`timestamp`)**: Mindestens 3 Sekunden zwischen Laden und Absenden
3. **Rate Limiting**: Maximal 5 Anfragen pro E-Mail-Adresse pro Stunde

## E-Mail-Versand

Bei erfolgreicher Verarbeitung werden zwei E-Mails versendet:

1. **Admin-Benachrichtigung** an `office@aitema.de`
2. **Bestätigungs-E-Mail** an den Absender

### E-Mail-Templates

- `templates/admin-email.ts` - HTML und Text Template für Admin-Benachrichtigung
- `templates/user-email.ts` - HTML und Text Template für Bestätigungs-E-Mail

## Datenbank

Kontaktanfragen werden in `data/contacts.json` gespeichert mit folgendem Schema:

```typescript
{
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  datenschutz: true;
  createdAt: string;  // ISO 8601
}
```

## Umgebungsvariablen

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Verwendung im Frontend

```typescript
import { contactFormSchema, type ContactFormData } from '@/lib/contactSchema';

// Validierung
const result = contactFormSchema.safeParse(formData);

// API-Aufruf
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...formData,
    timestamp: Date.now(),  // Für Spam-Schutz
  }),
});
```

## Testing

```bash
# Erfolgreiche Anfrage
curl -X POST http://localhost:3101/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max Mustermann",
    "email": "max@example.com",
    "subject": "Test Betreff",
    "message": "Dies ist eine Testnachricht mit mehr als 20 Zeichen.",
    "datenschutz": true,
    "timestamp": '$(($(date +%s%3N) - 5000))'
  }'

# Spam-Test (Honeypot)
curl -X POST http://localhost:3101/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spammer",
    "email": "spam@example.com",
    "subject": "Spam",
    "message": "Spam Nachricht hier...",
    "datenschutz": true,
    "website": "spam-site.com"
  }'
```
