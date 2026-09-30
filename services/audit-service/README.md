# Vera Audit Service

Centralized append-only audit logging microservice for the Vera platform.

## Features

- Append-only `audit_events` store (no delete/update API)
- JSON `event_data` payloads (JSONB, max 256 KB)
- Multi-company isolation on all reads and JWT-backed writes
- Indexed queries by `company_id`, `module`, `event_type`, `actor_id`, `created_at`
- Automatic `created_at` timestamping
- High-throughput ingestion via service key (`x-audit-service-key`)
- JWT validation (shared secret with Auth Service)

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/audit/event` | JWT or service key | Ingest audit event |
| GET | `/audit/events` | JWT | Query events (filtered, paginated) |
| GET | `/audit/event/:id` | JWT | Get single event |
| GET | `/health/ready` | — | Readiness probe |

### Query parameters (`GET /audit/events`)

| Param | Description |
|-------|-------------|
| `company_id` | Required if not implied by token (defaults to JWT `company_id`) |
| `module` | Filter by module name |
| `actor_id` | Filter by actor UUID |
| `event_type` | Filter by event type |
| `limit` | Page size (default 50, max 200) |
| `offset` | Pagination offset |
| `from` / `to` | ISO8601 time range on `created_at` |

## Quick start

```bash
cd services/audit-service
cp .env.example .env
docker compose up -d audit-db
npm install
npx prisma migrate deploy
npm run dev
```

Port **3003**. Postgres **5435**.

## Ingest event

```json
POST /audit/event
x-audit-service-key: dev-audit-ingest-secret

{
  "company_id": "uuid",
  "module": "pm-hazard",
  "event_type": "hazard.created",
  "actor_id": "uuid",
  "event_data": {
    "hazard_id": "uuid",
    "project_id": "uuid"
  }
}
```

Response `201`:

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "module": "pm-hazard",
  "eventType": "hazard.created",
  "actorId": "uuid",
  "eventData": { "hazard_id": "uuid", "project_id": "uuid" },
  "createdAt": "2026-05-19T12:00:00.000Z"
}
```

## Service integration

Any Vera microservice or monolith module can emit audit events:

```env
AUDIT_SERVICE_URL=http://localhost:3003
AUDIT_SERVICE_KEY=dev-audit-ingest-secret
```

```typescript
await fetch(`${process.env.AUDIT_SERVICE_URL}/audit/event`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-audit-service-key': process.env.AUDIT_SERVICE_KEY!,
  },
  body: JSON.stringify({
    company_id,
    module: 'auth',
    event_type: 'user.login',
    actor_id: userId,
    event_data: { ip, userAgent },
  }),
});
```

## Tests

```bash
npm test
```

Integration tests require Postgres on port **5435** (`docker compose up -d audit-db`).
