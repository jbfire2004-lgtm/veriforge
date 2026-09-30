# VeriForge automated testing plan

## Goals

Prove that VeriForge correctly prices modules, enforces RBAC, isolates tenants, runs trials, and handles Stripe webhooks — without calling live Stripe or leaking cross-org data.

## Pyramid

| Layer | Tool | When it runs | Speed |
|---|---|---|---|
| Unit | Vitest + mocked Prisma/Stripe | Every PR (`npm test`) | Fast |
| API integration | Vitest + Supertest + test Postgres | `RUN_INTEGRATION=1` / nightly | Medium |
| Multi-tenant isolation | Unit helpers + HTTP integration | PR (helpers) + integration job | Fast / Medium |
| Frontend E2E | Playwright | Main / nightly (`npm run test:e2e`) | Slow |
| Load (optional) | k6 | Manual / pre-release | Variable |

## Coverage matrix

### Unit (mocked)

| Suite | Asserts |
|---|---|
| `PricingService` | Quote totals, annual discount, unknown module errors |
| `RBACService` | `can` / `canAny` / `assertSameOrg`, module filter |
| `TrialService` | Trial window, expire due trials, idempotent notifications |
| `BillingIntegrationService` | Webhook idempotency, signature path, convert with mocked Stripe |
| `OrganizationService` | get/update validation, unique slug |
| `UserService` | invite privilege rules, org-scoped list |

### Integration (test DB)

| Flow | Asserts |
|---|---|
| Signup | Org + owner + modules + `trialing` subscription |
| `POST /pricing/quote` | Schema + totals |
| Trial expiry job | Past `trialEnd` → locked modules / inactive trial |
| Stripe webhook | Signed event applied once; duplicate ignored |
| Tenant isolation | Org A token → `403` on Org B paths |

### Frontend E2E

| Flow | Asserts |
|---|---|
| Signup wizard | Company → modules → billing → confirm → dashboard |
| Pricing preview | Selected total updates with modules/cycle |
| Trial banner | Days remaining + activate link |
| Activate subscription | Billing page + convert (API mocked or Stripe test mode) |

## Environments

| Var | Purpose |
|---|---|
| `DATABASE_URL` | App / unit (unused when Prisma mocked) |
| `TEST_DATABASE_URL` | Integration Postgres |
| `RUN_INTEGRATION=1` | Enable integration suites |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Only for live Stripe Test Mode E2E |
| `PLAYWRIGHT_BASE_URL` | Default `http://localhost:5175` |
| `API_BASE_URL` | Default `http://localhost:3020` |

## CI strategy

1. **PR:** unit + security tests + frontend lint/build  
2. **Integration job:** Postgres service container + seed + Supertest  
3. **E2E job (main/nightly):** start API + frontend, Playwright  
4. **Load:** manual `k6 run load/k6/*.js`

## Mocking strategy (Stripe)

See § Mocking Stripe below and `tests/helpers/stripe-mock.ts`.

**Rules**

- Never hit live Stripe in unit/integration.
- Prefer injecting a Stripe stub via `vi.mock('stripe')`.
- Webhook tests: build a fake `Stripe.Event`, bypass `constructEvent` **or** call `constructEvent` with a stubbed `stripe.webhooks.constructEvent`.
- Idempotency: assert second `handleWebhookEvent` returns `{ duplicate: true }` and does not re-apply side effects.
- E2E activation: either intercept `POST **/billing/convert` in Playwright, or use Stripe Test Mode keys in a dedicated staging env.

## How to run

```bash
# Unit + security (default CI)
cd services/veriforge-saas-service
npm install
npx prisma generate
npm test

# Integration (seeded Postgres required)
set RUN_INTEGRATION=1
npm run db:push && npm run db:seed
npm run test:integration

# Frontend E2E (API on :3020 + Vite proxy)
cd apps/veriforge-frontend
npm install
npx playwright install chromium
# terminal A: API  ·  terminal B:
npm run test:e2e

# Load (optional)
k6 run -e BASE_URL=http://localhost:3020 load/k6/pricing-load.js
```

## Layout

```
docs/veriforge-testing-plan.md
services/veriforge-saas-service/tests/
  helpers/          # prisma mock, stripe mock, factories
  unit/             # Pricing, RBAC, Trial, Billing, Org, User
  integration/      # signup, quote, trial job, webhook, tenant
  security/         # isolation helpers (always on)
apps/veriforge-frontend/e2e/
load/k6/
```

## Exit criteria (release)

- [ ] All unit suites green
- [ ] Integration signup + tenant isolation green against test DB
- [ ] Webhook duplicate + payment_succeeded paths covered
- [ ] Playwright signup → dashboard → trial banner green
- [ ] No secrets in fixtures; scrubbed audit assertions where relevant

---

## Mocking Stripe

### Unit / integration (recommended)

```ts
vi.mock('stripe', () => {
  const StripeMock = vi.fn().mockImplementation(() => ({
    customers: { create: vi.fn(), update: vi.fn() },
    paymentMethods: { attach: vi.fn() },
    subscriptions: { create: vi.fn() },
    subscriptionItems: { create: vi.fn(), del: vi.fn() },
    webhooks: {
      constructEvent: vi.fn((body, sig, secret) => {
        if (sig !== 'valid') throw new Error('bad sig');
        return JSON.parse(body.toString());
      }),
    },
  }));
  return { default: StripeMock };
});
```

### Event factory

```ts
export function stripeEvent(type: string, object: unknown, id = `evt_${type}`): Stripe.Event {
  return {
    id,
    object: 'event',
    type,
    data: { object },
    // …minimal Stripe.Event fields
  } as Stripe.Event;
}
```

### What to mock vs assert

| Method | Mock | Assert |
|---|---|---|
| `customers.create` | returns `{ id: 'cus_test' }` | Org gets `externalCustomerId` |
| `subscriptions.create` | returns sub with items | Subscription row `active`/`trialing` |
| `webhooks.constructEvent` | validates signature stub | 400 on bad sig |
| `handleWebhookEvent` | real Prisma (integration) | Unique `event_id`; no double update |

### Frontend E2E

```ts
await page.route('**/organizations/*/billing/convert', async (route) => {
  await route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
});
```
