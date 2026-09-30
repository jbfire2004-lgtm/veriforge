# Vera RBAC Service

Role-based access control microservice for the Vera platform.

## Features

- Role and permission definitions (per company)
- Role ↔ permission and user ↔ role mappings
- Fast policy evaluation with LRU permission cache
- JWT validation (shared secret with Auth Service)
- Auth registration hook: `POST /rbac/hooks/user-registered`
- Evaluate returns `{ allow, reason, matchedPermission? }`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/rbac/role` | JWT | Create role |
| POST | `/rbac/permission` | JWT | Create permission |
| POST | `/rbac/role/:id/assign-permission` | JWT | Map permission to role |
| POST | `/rbac/user/:id/assign-role` | JWT | Assign role to user |
| GET | `/rbac/user/:id/permissions` | JWT | List effective permissions |
| POST | `/rbac/evaluate` | JWT | Policy check |
| POST | `/rbac/hooks/user-registered` | Service key | Auth service hook |

## Quick start

```bash
cd services/rbac-service
cp .env.example .env
docker compose up -d rbac-db
npm install
npx prisma migrate deploy
npm run dev
```

Port **3002**.

## Evaluate

```json
POST /rbac/evaluate
Authorization: Bearer <access_token>

{
  "user_id": "uuid",
  "company_id": "uuid",
  "resource": "hazard",
  "action": "read"
}
```

Response:

```json
{
  "allow": true,
  "reason": "Allowed by permission \"Read hazards\" (hazard:read)",
  "matchedPermission": "uuid"
}
```

## Auth Service integration

Set on auth-service:

```env
RBAC_HOOK_URL=http://localhost:3002/rbac/hooks/user-registered
```

Set on rbac-service:

```env
RBAC_SERVICE_KEY=dev-rbac-hook-secret
JWT_ACCESS_SECRET=<same as auth service>
```

Auth hook request includes header `x-rbac-service-key`.

## Tests

```bash
npm test
```

## Docker

```bash
docker compose up --build
```
