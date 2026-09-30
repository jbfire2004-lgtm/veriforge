# Vera Auth Service

Production-ready authentication microservice for the Vera platform.

## Features

- JWT access tokens (`user_id`, `company_id`, `roles[]`)
- Rotating opaque refresh tokens (SHA-256 hashed at rest)
- bcrypt password hashing
- Multi-company tenant isolation (`company_id` required on register/login)
- Optional RBAC hook on registration (`RBAC_HOOK_URL`)
- HttpOnly secure cookie support for refresh tokens
- Token introspection: `GET /auth/validate-token`
- Health: `GET /health`, `GET /health/ready`

## Quick start

```bash
cd services/auth-service
cp .env.example .env
docker compose up -d auth-db
npm install
npx prisma migrate deploy
npm run dev
```

Service listens on **http://localhost:3001**.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create user in company |
| POST | `/auth/login` | — | Login (requires `company_id`) |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | Optional | Revoke refresh token |
| GET | `/auth/me` | Bearer | Current user profile |
| GET | `/auth/validate-token` | Bearer or `?token=` | Introspect JWT |
| GET | `/health/ready` | — | Readiness (DB ping) |

### Register

```json
POST /auth/register
{
  "company_id": "uuid",
  "email": "user@company.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Doe",
  "roles": ["worker"]
}
```

### Login

```json
POST /auth/login
{
  "company_id": "uuid",
  "email": "user@company.com",
  "password": "SecurePass123!"
}
```

## Tests

```bash
docker compose up -d auth-db
npm test
npm run test:coverage
```

## Docker

```bash
docker compose up --build
```

## Integration with Vera monolith

Point API gateway or services at this service for auth. JWT payload matches Vera PM guards:

```json
{
  "user_id": "uuid",
  "company_id": "uuid",
  "email": "user@company.com",
  "roles": ["worker", "supervisor"]
}
```

Map `user_id` to monolith `User.id` when bridging integer vs UUID user stores.
