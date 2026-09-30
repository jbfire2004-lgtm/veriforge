# Vera — developer guide

Vera is a workplace safety and compliance platform. This repository is a **monorepo-style layout** with a NestJS API and a Next.js web app.

| Area | Path | Stack |
|------|------|--------|
| API | `backend/` | NestJS 9, Prisma 5, PostgreSQL |
| Web | `vera-frontend/` | Next.js 16, React 19 |

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node)
- **PostgreSQL** for local development
- Optional: **Prisma Studio** / a GUI client for inspecting the database

---

## Backend (`backend/`)

### Install and run

```bash
cd backend
npm install
```

Create a **`.env`** in `backend/` (not committed) with at least:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `SHADOW_DATABASE_URL` | Shadow DB URL for migrations (Prisma) |

Optional:

| Variable | Purpose |
|----------|---------|
| `CORS_ORIGIN` | Comma-separated allowed origins; if unset, CORS allows all (`true`) |

Generate the client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the API (default **HTTP port `3001`** — see `src/main.ts`):

```bash
npm run start:dev
```

Production-style build and run:

```bash
npm run build
npm run start:prod
```

### Database seed

```bash
npm run prisma:seed
# or: npm run seed
```

Requires seed configuration in `package.json` and `prisma/seed.ts`.

### Static uploads

The API serves files from `backend/uploads/` at **`/uploads/`** (see `main.ts`).

### Testing

```bash
npm test              # Jest (unit tests under src/**/*.spec.ts)
npm run test:cov      # With coverage
npm run test:e2e      # E2e config in test/jest-e2e.json
```

Jest is configured in `jest.config.js` (`roots: ./src`, `temp-project` ignored).

### API modules currently wired in `AppModule`

The running Nest app loads **only** the modules imported in `src/app.module.ts`. At a high level:

- **Data:** workers, companies, training records, documents, certifications (`src/certifications/`)
- **Compliance & rules:** `compliance`, `rules` (rule engine), `verification` (public verify HTTP API)
- **Incidents:** `incidents`, `investigations`, `safety-workflow` (incident lifecycle helpers)
- **Access & training:** `access` (site/worker checks), `training-requirements`, `training-dashboard`, `equipment-training-requirements`, `training-ingestion`

There may be **additional folders under `src/`** that are not imported into `AppModule`; treat those as inactive or work-in-progress unless you register them.

### Public verification API (`/verify`)

Used by QR and verify pages in the frontend. Base path: **`/verify`**.

Examples:

- `GET /verify/worker/:id` — worker verification card
- `GET /verify/equipment/:id`
- `GET /verify/credential/:id`
- `GET /verify/training/:id`
- `GET /verify/cert/:id`
- `GET /verify/company/:id`
- `GET /verify/site-access/:token` — token format `workerId-siteId` (e.g. `12-4`)

Full logic lives in `src/verification/`.

### Safety workflow API (`/safety-workflow`)

- `GET /safety-workflow` — workflow definition (steps, allowed transitions)
- `GET /safety-workflow/incidents/:id` — current phase and available status transitions
- `POST /safety-workflow/incidents/:id/advance` — body includes `status` and optional `startInvestigation`, `investigatorId`

Implemented in `src/safety-workflow/`.

### Incidents

REST under **`/incidents`** — create, list, patch, status, assign, comments (see `src/incidents/`).

---

## Frontend (`vera-frontend/`)

### Install and run (unified stack — recommended)

From repo root:

```bash
npm run dev:veriforge
```

Open **http://localhost:5175** (SPA) and **http://localhost:5175/vera** (workspace modules).

See [VERIFORGE-LOCAL-PORTS.md](VERIFORGE-LOCAL-PORTS.md) and [NAMING-CONVENTION.md](NAMING-CONVENTION.md).

### Install and run (standalone Next)

```bash
cd vera-frontend
npm install
npm run dev
```

Runs on **http://localhost:3000** (internal; unified dev redirects to :5175).

### Point the UI at the API

In **`.env.local`**:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BASE_PATH` | `/vera` when proxied from Vite :5175 |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:5175/vera` (browser origin) |
| `NEXTAUTH_URL` | `http://localhost:5175/vera` (auth callbacks) |
| `NEXT_PUBLIC_API_URL` | Leave unset for smart routing (`/nest` on :5175, `:3001` on SSR) |

### Verify routes

Pages under `app/verify/...` use `VerifyPage` and call:

`GET {NEXT_PUBLIC_API_URL}/verify/{endpoint}/{id}`

Use query `?id=` for deep links (e.g. worker id).

### Build

```bash
npm run build
npm start
```

---

## Local full stack (typical)

1. Start Docker Desktop; start Postgres+Redis: `docker compose -f infra/veriforge/docker-compose.yml -f infra/veriforge/docker-compose.dev-ports.yml --env-file infra/veriforge/.env up -d postgres redis`
2. `npm run dev:veriforge` from repo root.
3. Open **http://localhost:5175** — never use `:3000` in the browser.

Internal ports: SaaS `:3020`, Nest `:3001`, Next `:3000` (proxied).

---

## Troubleshooting

- **CORS errors in the browser** — set `CORS_ORIGIN` to your frontend origin (e.g. `http://localhost:3000`) or confirm the dev server allows credentials as needed.
- **Prisma migration errors** — ensure `SHADOW_DATABASE_URL` points to a valid database; fix connection strings and PostgreSQL version.
- **404 on a route** — confirm the module is imported in `AppModule` and the global prefix (if any) matches your client.

---

## Code style and quality

- Backend: ESLint via `npm run lint` (see `backend` package scripts).
- Prefer **small, focused changes**; keep public HTTP contracts stable when possible.

For questions about a specific feature, start from the module folder under `backend/src/` and the matching Prisma models in `backend/prisma/schema.prisma`.

**Architecture:** bounded contexts and sequence diagrams for verification, compliance, and site access live in [docs/architecture/verification-and-trust.md](architecture/verification-and-trust.md).

**Site directory (VERA stack example):** [docs/modules/sites-directory.md](modules/sites-directory.md) — Prisma, `src/modules/sites`, `/api/v1/sites`, and `vera-frontend` under `src/api`, `src/hooks`, `app/sites`.

**Site contacts:** [docs/modules/site-contacts.md](modules/site-contacts.md) — `SiteContact` model, `/api/v1/site-contacts`, UI at `/site-contacts`.

### Supervisor incidents (end-to-end)

1. Run the API (`backend`, port **3001**) with migrations applied (includes `Incident.category`, `latitude`, `longitude`, `metadata`).
2. Open **`/supervisor/incidents`** in **`vera-frontend`** (hub with links to report, list, map).
3. **New report** → posts `POST /incidents` (category, GPS, metadata with signatures); redirects to **`/supervisor/incidents/:id`**.
4. **Workflow** uses **`GET /safety-workflow/incidents/:id`** and **`POST /safety-workflow/incidents/:id/advance`** for validated status transitions and optional investigation creation.

Set **`NEXT_PUBLIC_API_URL=http://localhost:3001`** for local development.
