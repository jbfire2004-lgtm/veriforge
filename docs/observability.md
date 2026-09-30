# Vera Observability and Reliability

This document defines baseline SLOs, golden signals, telemetry sources, and alert routing for Hub/Core/PM/FieldOS.

## Golden signals

- Latency: p95 and p99 for backend and API gateway requests
- Traffic: request rate by route and tenant
- Errors: HTTP 5xx ratio, auth failures, event-bus publish failures
- Saturation: DB readiness failures, queue backlog, offline sync queue depth

## Initial SLO targets

- Backend API availability: 99.9% monthly (`/ready` success)
- API gateway availability: 99.9% monthly
- Authenticated critical route p95 latency: < 1200ms
- Event bus publish failure ratio: < 1%
- Field sync conflict resolution success: > 99%

## Telemetry sources

- Backend request logs: `RequestLoggingInterceptor`
- Gateway request logs: `services/api-gateway/src/middleware/request-logger.ts`
- Event bus metrics: `EventBusMetricsService`
- Synthetic probe endpoint: `GET /health/synthetic`

## Alert routing

- P0 (service down, auth failure surge, migration failure): pager + incident channel
- P1 (SLO burn > 2x, repeated slow requests, event-bus delivery degradation): on-call Slack
- P2 (single tenant issue, low-priority drift): ticket queue

## Synthetic probes

Run every 5 minutes from two regions against:

- `/health`
- `/ready`
- `/health/synthetic`
- one authenticated API route (`/api/v1/pm/project/list` in stage/prod)

## Dashboard minimums

- Service health panel: backend, gateway, postgres, nats
- Request panel: rate, error %, latency p95/p99 by route
- Event bus panel: emitted/published/publishFailed/dlq
- Field reliability panel: offline queue depth, sync retries, conflict count

## Correlation and tracing

- Propagate `X-Correlation-Id` and `traceparent` from gateway to backend.
- Include correlation id in all structured logs and audit events.
- Store correlation id in incident timelines and postmortems.
