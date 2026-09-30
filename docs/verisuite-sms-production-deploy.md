# VeriSuite SMS Production Deployment Runbook

This runbook deploys VeriSuite SMS as part of the Vera platform monolith
(`vera-backend` + `vera-frontend`). AI engines (industry benchmarking, regional
drilldown, cross-page intelligence) and AI-01…18 ship **in-process** — there is
no separate model-serving fleet for SMS D0/D1.

Authoritative platform guide: [vera-core-deployment.md](./vera-core-deployment.md)

## What ships

| Component | Artifact | Notes |
|-----------|----------|--------|
| Backend services + SMS API | `ghcr.io/<org>/<repo>/vera-backend:vX.Y.Z` | `/api/v1/sms/*` |
| Industry benchmark engine | In Nest `VerisuiteSmsModule` | AI-16 |
| Regional drilldown engine | Same | AI-18 |
| Cross-page intelligence | Same | AI-17 |
| AI orchestrator (AI-01…18) | Same | Deterministic D0/D1; LLM gated by `SMS_LLM_ENABLED` |
| Frontend dashboards / hubs | `vera-frontend:vX.Y.Z` | `/pm/*`, `/pm/sms-dashboards` |
| VeriPM / VeriCore / FieldOS / VeriHub | Same images | Unified Vera stack |

## Preconditions

1. CI green: `backend-ci`, `vera-core-ci`, `vera-e2e` (or equivalent).
2. Backend builds with `NODE_OPTIONS=--max-old-space-size=8192` (Dockerfile sets this).
3. Prisma migration `20260717000000_verisuite_sms` included in release.
4. Production secrets loaded from secret manager (never commit).
5. Stage smoke passed for the **exact** image tag to promote.

## Environment contract (SMS)

Add to production secret store (see `.env.production.example`):

```bash
SMS_MONITORING_ENABLED=1
SMS_AI_DECISION_LOGGING=1
SMS_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...   # or PagerDuty
SMS_LLM_ENABLED=0   # keep off until L1/L2 provider review
```

Platform required vars remain: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
`PUBLIC_API_URL`, `PUBLIC_BASE_URL`, `ENABLE_ORIGIN_GUARD=1`,
`VERA_VALIDATE_ENV_STRICT=1`.

## Deploy steps (stage → prod)

1. Tag release `vX.Y.Z` → `release-images.yml` publishes GHCR images.
2. Deploy tag to **stage**.
3. Migrate:
   ```bash
   MIGRATE_BACKUP_ON_DEPLOY=1 node scripts/migrate.mjs
   ```
4. Restart backend/frontend (zero-downtime rolling restart).
5. Verify:
   ```bash
   curl -sS "$PUBLIC_API_URL/health"
   curl -sS "$PUBLIC_API_URL/ready"
   curl -sS "$PUBLIC_API_URL/api/v1/sms/health"
   ```
   Expect SMS health `status=ok|degraded`, engines `ready`, `aiBehaviors.length >= 18`.
6. Run go-live smoke (includes SMS):
   ```bash
   SMOKE_BASE_URL=$PUBLIC_API_URL node scripts/go-live-smoke.mjs
   ```
7. Synthetic probe (includes SMS):
   ```bash
   SYNTHETIC_BASE_URL=$PUBLIC_API_URL node scripts/synthetic-probe.mjs
   ```
8. Optional alert channel test (admin JWT):
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "X-Vera-Plane: company" \
     "$PUBLIC_API_URL/api/v1/sms/ops/alert-test"
   ```
9. Promote **unchanged** images stage → prod. Repeat steps 3–7 on prod.

## Local / compose production-shaped stack

```bash
docker compose -f docker-compose.vera-core.yml up --build
```

- Frontend: http://localhost:3001  
- Backend: http://localhost:3000  
- SMS health: http://localhost:3000/api/v1/sms/health  

## Final production audits

Before promoting images, run the automated gate (security + compliance +
performance + catalog integrity):

```bash
node scripts/verisuite-sms-production-gate.mjs
```

CI workflow: `.github/workflows/verisuite-sms-production-gate.yml`

Audits cover:

| Audit | Checks |
|-------|--------|
| Security | PlaneScopeGuard, JWT/RBAC, accept-before-SoR, no LLM EMS phones, k=5, HTTPS webhooks |
| Compliance | Append-only audit, AI decision logging, retention (no audit purge), benchmark suppress, design lock FINAL |
| Performance | Warm cache p95 ≤400ms, /200k rates O(1), TTL 45s |
| Deploy surface | Engines registered, 18 AI behaviors, migration present, prod env flags |

## Post-launch monitoring & release cycle

Ops dashboard: `/pm/sms-ops` (HSE roles via API).

| Domain | API | Signals |
|--------|-----|---------|
| AI decisions | `GET /ops/monitoring` · `/ops/ai-performance` | accept/dismiss rates, by behavior |
| Incident trends | domain `incident_trends` | open, overdue investigations, /200k |
| Inspection patterns | `inspection_patterns` | findings open, completion, repeats |
| FLHA quality | `flha_quality` | avg score, fail band |
| JHA usage | `jha_usage` | created / approved / SIF |
| ERP accuracy | `erp_accuracy` | plans, drills, sim score |
| Competency risk | `competency_risk` | high-risk + k-suppressed cells |
| Benchmarking | `benchmarking_accuracy` | cohorts suppressed vs publishable |

Release tracks (`GET /ops/release-cycle`):

- **Monthly** feature releases  
- **Quarterly** intelligence upgrades  
- **Annual** UI refresh  
- **Continuous** AI tuning (weekly digest)

Compliance: `GET /ops/compliance` — monitoring/decision-logging/LLM-off/k-anonymity/design lock.

Logs: `sms.metric` (`ops.monitoring.*`, `ai.decision`), `sms_audit_log`, `sms_ai_suggestion_audit`.

## Post-launch monitoring & release cycle

Ops dashboard: `/pm/sms-ops` (HSE via API).

| Domain | API | Signals |
|--------|-----|---------|
| AI decisions | `GET /ops/monitoring`, `/ops/ai-performance` | accept/dismiss rates, by behavior |
| Incident trends | domain `incident_trends` | open, overdue inv, /200k |
| Inspection patterns | `inspection_patterns` | findings, completion |
| FLHA quality | `flha_quality` | avg score, fail band |
| JHA usage | `jha_usage` | created/approved/SIF |
| ERP accuracy | `erp_accuracy` | drills, sim score |
| Competency risk | `competency_risk` | high-risk + k-suppress |
| Benchmarking | `benchmarking_accuracy` | cohorts suppressed |

Release tracks: `GET /ops/release-cycle`

- Monthly feature releases  
- Quarterly intelligence upgrades  
- Annual UI refresh  
- Continuous AI tuning (weekly digest)

Compliance: `GET /ops/compliance` — decision logging, monitoring, LLM off, k-anonymity, design lock.

Maintain logs via `sms_audit_log`, `sms_ai_suggestion_audit`, and `sms.metric` stdout.

## Monitoring & logging

| Signal | Mechanism |
|--------|-----------|
| Boot | JSON `sms.ops.boot` on module init |
| Metrics | JSON `sms.metric` (stdout) when `SMS_MONITORING_ENABLED=1` |
| AI decisions | `sms_ai_suggestion_audit` table + `sms.metric` `ai.decision` |
| Compliance export | `GET /api/v1/sms/ops/ai-decisions` (HSE roles) |
| Audit trail | `sms_audit_log` |

Ship container stdout to your log platform (CloudWatch / Datadog / Loki).

## Incident alerting

Set `SMS_ALERT_WEBHOOK_URL`. Alerts fire on audit write failures and via
`ops.raiseAlert` / `POST .../ops/alert-test`. Payload is Slack-compatible JSON
with `severity`, `source=verisuite-sms`, `requestId`.

## AI models note

- **D0/D1 (production default):** rule/scorer behaviors AI-01…18 — no external
  model endpoint. Deploying backend **is** deploying SMS AI.
- **L1/L2:** gated by `SMS_LLM_ENABLED=1` + provider keys (not enabled by
  default). Do not invent EMS phone numbers via LLM (`no_llm_phone` guardrail).

## Rollback

1. Redeploy previous `vera-backend` / `vera-frontend` tag.
2. If migration must roll back: stop writes → restore pre-migrate backup →
   redeploy matching app tag (see platform rollback in vera-core-deployment.md).

## Post-deploy checklist

- [ ] `/api/v1/sms/health` ok/degraded with 18 behaviors  
- [ ] Go-live smoke includes SMS  
- [ ] Synthetic probe includes SMS  
- [ ] Alert webhook test received (if configured)  
- [ ] AI decision logging visible in logs or `ops/ai-decisions`  
- [ ] VeriPM hubs show `SmsConnectedInsightPanel` without errors  
- [ ] Gallery `/pm/sms-dashboards` loads under PM auth  
- [ ] Mockups `/pm/sms-mockups` remain auth-gated (design reference)  
