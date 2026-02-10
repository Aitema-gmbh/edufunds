# EduFunds Architektur

## Übersicht

EduFunds ist eine moderne Full-Stack Webanwendung basierend auf Next.js 14 und PostgreSQL. Dieses Dokument beschreibt die technische Architektur, Design-Entscheidungen und Best Practices.

## Tech Stack

| Layer | Technologie | Zweck |
|-------|-------------|-------|
| Frontend | Next.js 14 (App Router) | React Framework mit SSR/SSG |
| Styling | Tailwind CSS | Utility-First CSS |
| Backend | Next.js API Routes | REST API Endpoints |
| Datenbank | PostgreSQL 16 | Relationale Datenbank |
| ORM/DB | pg (node-postgres) | Native PostgreSQL Driver |
| Validation | Zod | Schema Validation |
| Email | Resend | Transactional Emails |
| Deployment | Docker + Traefik | Container Orchestrierung |

## Architektur-Prinzipien

### 1. Separation of Concerns
- **Presentation Layer**: React Components, Pages
- **Business Logic**: API Routes, Services
- **Data Layer**: Database Module, Queries

### 2. Type Safety
- TypeScript überall
- Zod für Runtime Validation
- Datenbank-Types aus `@/types/db`

### 3. Security First
- Environment Variables für Secrets
- Parameterized Queries (SQL Injection Prevention)
- CORS konfiguriert
- Security Headers (HSTS, CSP, etc.)
- Non-root User in Containern

## Projektstruktur

```
edufunds-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── foerderprogramme/  # Seiten
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Homepage
├── components/            # React Components
│   ├── ui/               # UI-Komponenten (Buttons, etc.)
│   └── *.tsx             # Feature Components
├── lib/                   # Shared Libraries
│   ├── db.ts             # Datenbank-Modul
│   └── utils.ts          # Utility-Funktionen
├── types/                 # TypeScript Types
│   └── db.ts             # Datenbank-Types
├── scripts/               # Setup & Migration Scripts
│   ├── setup-db.ts       # DB Initialisierung
│   ├── init-db.sql       # SQL Schema
│   └── backup.sh         # Backup Script
├── docs/                  # Dokumentation
├── docker-compose.yml     # Development Stack
├── docker-compose.prod.yml # Production Stack
├── Dockerfile             # Production Image
├── Dockerfile.dev         # Development Image
└── next.config.js         # Next.js Config
```

## Datenbank-Architektur

### Tabellen

#### newsletter_entries
Speichert Newsletter-Abonnenten mit Double-Opt-In.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | SERIAL PK | Primärschlüssel |
| email | VARCHAR(255) UNIQUE | E-Mail-Adresse |
| confirmed | BOOLEAN | Double-Opt-In Status |
| confirmation_token | VARCHAR(64) | Token für Bestätigung |
| unsubscribe_token | VARCHAR(64) | Token für Abmeldung |
| created_at | TIMESTAMP | Erstellungsdatum |
| updated_at | TIMESTAMP | Letzte Änderung |

#### contact_requests
Speichert Kontaktformular-Einträge.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | SERIAL PK | Primärschlüssel |
| name | VARCHAR(255) | Absender-Name |
| email | VARCHAR(255) | Absender-E-Mail |
| subject | VARCHAR(500) | Betreff |
| message | TEXT | Nachricht |
| status | VARCHAR(20) | Status (new, in_progress, answered, archived) |

### Connection Pooling

```typescript
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  // Defaults: max: 10, idleTimeoutMillis: 30000
});
```

### SQL Injection Prevention

Alle Queries verwenden parameterized queries:

```typescript
// ✅ Sicher
await query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ UNSICHER - Niemals so machen!
await query(`SELECT * FROM users WHERE id = ${userId}`);
```

## API-Architektur

### Route Struktur

```
/api/
├── health/              # Health Check
├── newsletter/
│   └── route.ts        # POST: Anmeldung
├── contact/
│   └── route.ts        # POST: Kontaktformular
└── admin/
    └── stats/          # GET: Statistiken
```

### Response Format

```typescript
// Erfolg
{
  "success": true,
  "data": { ... }
}

// Fehler
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable message"
}
```

### Error Handling

```typescript
try {
  const result = await someOperation();
  return Response.json({ success: true, data: result });
} catch (error) {
  console.error('[API] Fehler:', error);
  return Response.json(
    { success: false, error: 'INTERNAL_ERROR', message: 'Server-Fehler' },
    { status: 500 }
  );
}
```

## Deployment-Architektur

### Development

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js Dev   │────▶│   PostgreSQL    │
│   Port: 3101    │     │   Port: 5432    │
└─────────────────┘     └─────────────────┘
```

### Production

```
                         ┌─────────────────┐
    HTTPS Traffic       │     Traefik     │
         │              │   (Reverse Proxy)│
         ▼              └────────┬────────┘
    ┌────────┐                   │
    │  User  │◀──────────────────┘
    └────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   PostgreSQL    │
│   (Docker)      │     │   (Docker)      │
└─────────────────┘     └─────────────────┘
```

## Sicherheitsmaßnahmen

### Container Security
- Non-root User (nextjs:nodejs)
- Read-only Filesystem wo möglich
- No new privileges
- Minimal Base Images (Alpine)

### Netzwerk Security
- Internes Docker Network für DB
- Kein DB-Port nach außen (Production)
- Traefik für HTTPS Termination

### Application Security
- Security Headers (HSTS, CSP, etc.)
- Rate Limiting (API Routes)
- Input Validation (Zod)
- SQL Injection Prevention

## Performance-Optimierungen

### Next.js
- Standalone Output für kleinere Images
- Image Optimization
- Code Splitting (automatisch)
- Streaming SSR

### Datenbank
- Connection Pooling
- Indizes auf häufige Queries
- Prepared Statements

### Docker
- Multi-Stage Builds
- Layer Caching
- .dockerignore

## Monitoring & Logging

### Health Checks
- `/api/health` - Application Health
- Docker Health Checks
- Database Connectivity

### Logging
- Structured Logging (JSON)
- Log Levels (ERROR, WARN, INFO, DEBUG)
- Centralized Log Collection (optional)

## Skalierung

### Horizontal
- Mehrere Next.js Container hinter Load Balancer
- Stateless Design
- Shared Nothing Architecture

### Vertikal
- Datenbank: Read Replicas
- Caching: Redis (optional)
- CDN für statische Assets

## Backup & Recovery

### Automatisierte Backups
- Tägliche PostgreSQL Dumps
- 7-Tage Retention
- Gespeichert in `./backups/`

### Recovery
```bash
# Backup wiederherstellen
gunzip < backups/edufunds_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i edufunds-postgres psql -U edufunds -d edufunds
```

## Weiterentwicklung

### Geplante Features
- Redis für Caching/Sessions
- OAuth Integration
- Admin Dashboard
- Analytics/Monitoring

### Migrationsstrategie
- Datenbank-Migrations mit `init-db.sql`
- Zero-Downtime Deployments
- Blue/Green Deployment (optional)

---

**Letzte Aktualisierung:** Februar 2025  
**Version:** 1.0.0
