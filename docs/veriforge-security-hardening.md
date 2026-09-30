# VeriForge production security hardening

## Checklist

### 1. Authentication
- [x] Argon2id password hashing (`src/security/password.ts`)
- [x] Strong password policy (12+ chars, upper/lower/digit/symbol, block common)
- [x] Optional MFA (`POST /auth/mfa/enable`, login `mfaCode`)
- [x] Rate limit login/signup + global API limiter
- [x] IP + email keyed throttling
- [x] Legacy bcrypt verify + transparent rehash on login

### 2. API security
- [x] Short-lived JWT access tokens (default 15m) + refresh tokens
- [x] Signing key rotation via `JWT_ACCESS_SECRETS=kid:secret,...`
- [x] Zod validation on signup/login/quote
- [x] `requireAuth` + `requirePermission` + `refreshPermissions` on protected routes
- [x] Privilege escalation guards on role assign (`assertCanAssignRole`)
- [x] Helmet + HSTS in production; CORS `*` forbidden in production

### 3. Multi-tenant isolation
- [x] `tenantWhere` / `assertRowOrg` helpers
- [x] Org path param must match JWT `org_id` (`requireTenant`)
- [x] Automated tests (`tests/security/tenant-isolation.test.ts`)
- [x] Nest VeriForge guards reject role/tenant header spoofing (JWT-only)
- [ ] Expand to Prisma middleware that rejects queries missing `orgId` on tenant models (follow-up)

### 4. Stripe webhooks
- [x] Signature validation (`constructEvent` + `STRIPE_WEBHOOK_SECRET`)
- [x] Idempotent processing (`stripe_webhook_events.event_id` unique)

### 5. Database
- [x] Least-privilege SQL roles (`infra/veriforge/sql/least-privilege-roles.sql`)
- [ ] Enable cloud disk / RDS encryption at rest
- [x] App-level AES-256-GCM for PII (`FIELD_ENCRYPTION_KEY`, `fullNameEnc` display preference)
- [x] DSAR `GET /privacy/export` + `DELETE /privacy/me`

### 6. Secrets
- [x] No secrets in code; env / K8s Secret / Vault
- [x] Production boot checks for JWT + field encryption key length

### 7. Frontend
- [x] Prefer `Authorization: Bearer` (no CSRF cookie session by default)
- [ ] Enforce HTTPS at edge (Ingress TLS / Traefik)
- [ ] Sanitize any `dangerouslySetInnerHTML` if introduced

### 8. Logging & audit
- [x] `audit_logs` for auth, RBAC, modules, billing webhooks
- [x] Scrub passwords/tokens from audit meta
- [x] Structured Winston JSON logs
- [x] `/metrics` gated by `METRICS_BEARER_TOKEN` in production

---

## Code sketches

### Argon2id
```ts
await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2 });
```

### JWT rotation
```ts
// JWT_ACCESS_SECRETS="v2:newSecret...,v1:oldSecret..."
jwt.sign(payload, current.secret, { keyid: current.kid, expiresIn: '15m' });
// verify tries kid match then all keys
```

### RBAC middleware
```ts
router.get('/x', requireAuth, refreshPermissions(), requirePermission('vericore.audit.view'), handler);
```

### Webhook
```ts
const event = stripe.webhooks.constructEvent(rawBody, sig, secret);
await prisma.stripeWebhookEvent.create({ data: { eventId: event.id, type: event.type } }); // unique
```

## Testing strategy

| Layer | What |
|---|---|
| Unit | Password policy, argon2 round-trip, tenant helpers, role escalation |
| Unit | JWT sign/verify with rotated kids |
| Integration (follow-up) | Two orgs; Org A token cannot `GET /organizations/B/...` or read B rows |
| Integration | Duplicate Stripe event id → no double apply |
| CI | `npm test` + `npm audit` in `veriforge-ci.yml` |

Run:
```bash
cd services/veriforge-saas-service
npx prisma db push
npm test
```
