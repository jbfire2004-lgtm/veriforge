# Vera Offline Engine

Unified offline sync microservice: cache ingestion, conflict detection/resolution, delta sync, device registration, and audit logs.

## Features

- **Offline cache ingestion** — `POST /offline/sync` with multi-module actions
- **Conflict detection** — client version vs server cache; module apply errors
- **Conflict resolution** — `prefer_local`, `prefer_server`, `merge`
- **Delta sync** — `GET /offline/device/{id}?since=<ISO8601>`
- **Device registration** — auto-register on first sync
- **Sync logs** — `offline_audit` table
- **Validation hooks** — local rules + optional `VALIDATION_HOOK_URL`
- **Background worker** — retries `pending_sync` cache rows

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/offline/sync` | Ingest batch of offline actions |
| POST | `/offline/conflict/resolve` | Resolve a conflict |
| GET | `/offline/device/{id}` | Device queue, counts, open conflicts, delta |

## Quick start

```bash
cd services/offline-service
cp .env.example .env
docker compose up -d offline-db
npm install
npx prisma migrate deploy
npm run dev
```

Port **3005**. Postgres **5437**.

## Sync request

```json
POST /offline/sync
Authorization: Bearer <token>

{
  "device_id": "field-tablet-001",
  "company_id": "uuid",
  "batch_id": "batch-42",
  "actions": [
    {
      "type": "pm-hazard",
      "recordId": "rec-001",
      "clientVersion": 2,
      "lastModified": "2026-05-19T12:00:00.000Z",
      "payload": { "clientSyncId": "rec-001", "title": "Slip hazard" }
    }
  ]
}
```

## Conflict resolution

```json
POST /offline/conflict/resolve

{
  "conflict_id": "uuid",
  "company_id": "uuid",
  "strategy": "merge",
  "resolved_value": { "title": "Merged title" },
  "retry_sync": true
}
```

## Hooks

| Env | Purpose |
|-----|---------|
| `VALIDATION_HOOK_URL` | POST `{ moduleType, payload }` → `{ valid, errors? }` |
| `MODULE_APPLY_URL` | POST apply payload to domain backend |

## Tests

```bash
npm test
```
