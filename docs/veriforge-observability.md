# VeriForge observability

## Logging

| Item | Detail |
|---|---|
| Library | Winston JSON to stdout |
| Levels | `debug` · `info` · `warn` · `error` via `LOG_LEVEL` |
| Correlation | `X-Correlation-Id` / `X-Request-Id` → AsyncLocalStorage → every log line |
| Response | Echoes `X-Correlation-Id`; errors include `correlationId` |

Files: `src/utils/logger.ts`, `src/middleware/correlation.ts`, `src/observability/context.ts`

## Metrics (Prometheus)

| Metric | Purpose |
|---|---|
| `veriforge_http_request_duration_seconds` | API latency histogram |
| `veriforge_http_requests_total` | Request counter |
| `veriforge_http_errors_total` | 5xx counter |
| `veriforge_worker_job_duration_seconds` | Job duration |
| `veriforge_worker_job_runs_total` | Job success/error |
| `veriforge_trial_expiry_orgs_total` | Trial expiry outcomes |
| `veriforge_trial_notifications_total` | Notification sends |
| `veriforge_stripe_webhook_processed_total` | Webhook results |
| `veriforge_stripe_webhook_duration_seconds` | Webhook latency |
| `veriforge_db_ready` | Ready probe gauge |
| `veriforge_db_pool_saturation_ratio` | Pool pressure signal |

Scrape: `GET /metrics` on API `:3020` and worker `:3021`.

## Tracing (OpenTelemetry)

Enable with:

```bash
OTEL_ENABLED=true
# or set endpoint (auto-enables):
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318/v1/traces
OTEL_SERVICE_NAME=veriforge-saas-service
```

Bootstrap: `src/observability/instrumentation.ts` (imported first in `index.ts` / `worker.ts`).

Auto-instruments HTTP + Express. Manual spans:

- `stripe.webhook`
- `worker.trial_workflow`
- `worker.trial_expiry_hourly`

Attribute `correlation.id` links logs ↔ traces.

Optional collector:

```bash
docker compose -f infra/veriforge/docker-compose.yml \
  -f infra/veriforge/docker-compose.monitoring.yml \
  --profile tracing --env-file infra/veriforge/.env up -d
```

## Dashboards (Grafana)

Provisioned under `infra/veriforge/monitoring/grafana/dashboards/json/`:

| UID | Dashboard |
|---|---|
| `veriforge-api-perf` | API performance (rate, latency, top routes) |
| `veriforge-trial` | Trial jobs + notifications |
| `veriforge-billing` | Stripe webhooks |
| `veriforge-errors` | Error rate + DB readiness |

Grafana: http://localhost:3000 (default admin/admin).

## Alerts

`infra/veriforge/monitoring/alerts.yml`

| Alert | Condition |
|---|---|
| `VeriForgeHighErrorRate` | 5xx ratio > 5% for 5m |
| `VeriForgeHighLatencyP95` | p95 > 1s for 10m |
| `VeriForgeTrialJobFailures` | trial job errors in 15m |
| `VeriForgeStripeWebhookFailures` | >2 webhook errors / 10m |
| `VeriForgeDbNotReady` | `veriforge_db_ready == 0` for 2m |
| `VeriForgeDbPoolSaturation` | saturation > 0.85 for 5m |

## Quick start

```bash
cd services/veriforge-saas-service && npm install
# API + worker with REDIS_URL set
# then:
docker compose -f infra/veriforge/docker-compose.yml \
  -f infra/veriforge/docker-compose.monitoring.yml \
  --env-file infra/veriforge/.env up -d

curl -s localhost:3020/metrics | head
open http://localhost:9090   # Prometheus
open http://localhost:3000   # Grafana
```
