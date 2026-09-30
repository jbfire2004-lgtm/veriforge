# Vera Platform — E2E Test Suite (Playwright)



End-to-end coverage for deep routes, assessment engines, PM inspections, routing, and smart automation features.



## Multi-role storage state



Auth setup writes **three** Playwright storage files (NextAuth session cookies):



| Role | Default login | Storage file | Env override |

|------|---------------|--------------|--------------|

| Admin | `admin@vera.com` | `playwright/.auth/admin.json` | `PLAYWRIGHT_STORAGE_STATE_ADMIN` |

| PM / supervisor | `supervisor1@vera.com` | `playwright/.auth/pm.json` | `PLAYWRIGHT_STORAGE_STATE_PM` |

| Contractor | `contractor1@vera.com` | `playwright/.auth/contractor.json` | `PLAYWRIGHT_STORAGE_STATE_CONTRACTOR` |



Credentials: copy `playwright/.env.e2e.example` → `playwright/.env.e2e`. All seeded dev accounts share `PLAYWRIGHT_TEST_PASSWORD` (default `hashedpassword123`).



```bash

npm run test:e2e:setup    # writes admin.json, pm.json, contractor.json

```



Legacy `PLAYWRIGHT_STORAGE_STATE` defaults to `admin.json` for mocked/authenticated projects.



## Test suites



| Project | Specs | Auth |

|---------|-------|------|

| `deep-crawl-public` | `/`, `/qr`, `/verify/[id]`, public docs | None |

| `deep-crawl-admin` | `/admin/workers/[id]`, equipment, projects, core, wallet | Admin |

| `deep-crawl-pm` | `/pm/projects`, inspections, SIF-HECA, SMS, core, wallet | PM |

| `deep-crawl-contractor` | `/contractor` | Contractor |

| `mocked` | `*.mocked.spec.ts` | Admin (legacy path) |

| `authenticated` | Nav, deep links, integration | Admin (legacy path) |



Assertions: HTTP status &lt; 500, no login redirect for auth routes, no “Application error”, optional `expectText` for key UI shells.



## Running locally



```bash

cd vera-frontend

npm ci

# Terminal A (repo root): npm run dev:parallel

# Terminal B:

npm run test:e2e:prep

npm run test:e2e:deep-crawl          # public + all role deep crawls

npm run test:e2e                     # full suite (all projects)

```



With servers already running:



```bash

set PLAYWRIGHT_SKIP_WEB_SERVER=1

npm run test:e2e:prep

npm run test:e2e:deep-crawl-public

npm run test:e2e:deep-crawl-admin

```



## Environment variables



| Variable | Purpose |

|----------|---------|

| `PLAYWRIGHT_BASE_URL` | App origin (default `http://localhost:5175/vera`) |

| `PLAYWRIGHT_TEST_PASSWORD` | Shared password for seeded accounts |

| `PLAYWRIGHT_ADMIN_EMAIL` / `PLAYWRIGHT_PM_EMAIL` / `PLAYWRIGHT_CONTRACTOR_EMAIL` | Per-role logins |

| `PLAYWRIGHT_STORAGE_STATE_*` | Per-role storage JSON paths |

| `PLAYWRIGHT_DEEP_CRAWL_MOCKS` | Set `0` to hit live API during deep crawl |

| `PLAYWRIGHT_AUTH_REFRESH` | Set `1` to force re-login |

| `PLAYWRIGHT_E2E_BACKEND` | Set `1` for live API integration specs |



## CI



`.github/workflows/vera-e2e.yml` runs `npm run test:e2e` (public routes always; authenticated deep crawl when `PLAYWRIGHT_TEST_PASSWORD` secret and `PLAYWRIGHT_TEST_EMAIL` or `PLAYWRIGHT_ADMIN_EMAIL` repo var are set).



## File structure



```

tests/e2e/

├── setup/auth.setup.ts           # Multi-role NextAuth API login

├── fixtures/vera-test.ts         # adminTest, pmTest, contractorTest

├── helpers/

│   ├── auth.ts                   # Storage paths per role

│   ├── deep-crawl.ts             # Route catalogs + assertions

│   └── mock-api.ts               # API stubs for deep crawl

└── routing/

    ├── public-deep-crawl.spec.ts

    ├── admin-deep-crawl.spec.ts

    ├── pm-deep-crawl.spec.ts

    └── contractor-deep-crawl.spec.ts

```



