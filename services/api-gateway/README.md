# Vera API Gateway

Production-ready edge gateway for the Vera platform: JWT validation, RBAC enforcement, multi-tenant scoping, rate limiting, and reverse proxy routing to domain services.

## Features

- **JWT validation** — token introspection via Auth Service (`GET /auth/validate-token`) with optional local JWT fallback
- **RBAC enforcement** — `POST /rbac/evaluate` before proxying protected domain routes
- **Company scoping** — rejects `company_id` / `x-company-id` mismatches against JWT claims
- **Request logging** — structured logs with `x-request-id` correlation
- **Rate limiting** — global + stricter limits on `/auth/*`
- **Reverse proxy** — `http-proxy-middleware` to auth, rbac, audit, and NestJS backend
- **Health checks** — `/health/live`, `/health/ready` (probes all upstreams)
- **CORS** — configurable origins
- **Error normalization** — `{ error, code, requestId }` JSON responses

## Routing table

Configurable via `config/routes.json` (override with `ROUTES_CONFIG_PATH`).

| Gateway prefix | Upstream |
|----------------|----------|
| `/auth/*` | Auth Service |
| `/rbac/*` | RBAC Service |
| `/audit/*` | Audit Service |
| `/safety/*` | Backend (`/api/v1/pm/...`) |
| `/context/*` | Backend |
| `/access/*` | Backend |
| `/pm/*` | Backend |
| `/platform/*` | Backend |
| `/cail/*` | Backend |

Path rewrites map spec-style prefixes to Vera monolith routes (see `config/routes.json`).

## Quick start

```bash
cd services/api-gateway
cp .env.example .env
# Start auth (3001), rbac (3002), audit (3003), backend (3000)
npm install
npm run dev
```

Gateway listens on **8080**.

## Example

```bash
# Login via gateway
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"company_id":"...","email":"user@example.com","password":"secret"}'

# Call PM API through gateway (RBAC + company scope applied)
curl http://localhost:8080/safety/hazard \
  -H "Authorization: Bearer <access_token>"
```

## Environment

See `.env.example`. Key variables:

| Variable | Description |
|----------|-------------|
| `AUTH_SERVICE_URL` | Auth microservice base URL |
| `RBAC_SERVICE_URL` | RBAC microservice base URL |
| `AUDIT_SERVICE_URL` | Audit microservice base URL |
| `BACKEND_SERVICE_URL` | NestJS monolith base URL |
| `JWT_ACCESS_SECRET` | Local JWT verify fallback |
| `RBAC_ENABLED` | Set `false` to disable RBAC checks (dev only) |
| `ROUTES_CONFIG_PATH` | Custom routing JSON path |

## Docker

```bash
docker compose up --build
```

## Tests

```bash
npm test
```
