# Public verification surfaces

Routes and APIs intentionally reachable **without authentication** (QR kiosk, gate verify, training card checks). All others require JWT (`/wallet`, `/supervisor/scan`, `/field/scan` UI is signed-in; staff APIs use Bearer tokens).

## URL map

| Surface | Auth | Rate limit | Identifier |
|---------|------|------------|------------|
| `GET /verify/t/:token` | Public | 60/min | Worker `w-{uuid}` or equipment `e-{uuid}` |
| `GET /verify/worker/:ref` | Public | 40/min | Token preferred; numeric `ref` legacy |
| `GET /verify/worker/:ref/full` | Staff JWT | — | Full wallet (supervisor/admin/worker self) |
| `GET /verify/equipment?ref=` | Public | 40/min | Token preferred |
| `GET /verify/equipment/full?ref=` | Staff JWT | — | Full equipment detail |
| `POST /qr/scan` | Public | 40/min | Rejects bare numeric QR |
| `GET /combined`, `/combined/result` | Public | 20/min | Sanitized summary only |
| `GET /combined/full` | Staff JWT | — | Full combined payload |
| `GET /access/:workerId/:siteId` | Public | 30/min | Gate check; minimal response |
| `GET /api/v1/core/verification/training/:id` | Public | 30/min | Optional query hardening |

## Frontend (signed-in vs public)

| Path | Shell | Notes |
|------|-------|-------|
| `/verify/*`, `/qr` | Lightweight signed-in or anonymous | Public wallet cards |
| `/supervisor/scan`, `/field/scan` | Workspace / field | **Authenticated**; uses same QR parsers but routes to supervisor tools |
| `/wallet/*` | Staff | Requires login |

## Data minimization

Public responses **omit**: internal numeric worker/equipment/company ids (where possible), incident lists, RCA, tenant metadata, credential secrets, serial numbers on anonymous equipment cards.

Public responses **include**: display name, employer name (not id), training/credential status summaries, safety status, compliance issue counts.

## QR token policy

- New QR payloads use `qrToken` (`w-` / `e-` + UUID) in JSON and `/verify/t/` URLs.
- Legacy numeric URLs remain for backward compatibility but are rate-limited and discouraged.
- Authenticated staff linking (`linkByQrToken`) accepts **tokens only** (no numeric id guessing).

## Abuse protection

- `@PublicRateLimited` per route (see `security/decorators/public-rate-limit.decorator.ts`).
- Global `ThrottlerGuard` (120/min) as backstop.
- `OriginGuard` optional for cookie POSTs (`ENABLE_ORIGIN_GUARD=1`).

See also [security.md](./security.md).
