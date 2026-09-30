# VeriAgent deployment

## Docker

```bash
cd services/veri-agent-service
docker build -t veriforge/veri-agent-service:1.0.0 .
docker run --rm -p 3040:3040 \
  --env-file .env \
  veriforge/veri-agent-service:1.0.0
```

Health: `GET /health/live`, `GET /health/ready`  
Metrics: `GET /metrics` (Prometheus text)

## Kubernetes (raw manifests)

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
kubectl apply -f deploy/k8s/secret.example.yaml   # replace values first
kubectl apply -f deploy/k8s/deployment.yaml
kubectl apply -f deploy/k8s/service.yaml
kubectl apply -f deploy/k8s/prometheus-alerts.yaml  # requires Prometheus Operator
```

## Helm

```bash
helm upgrade --install veri-agent deploy/helm/veri-agent \
  --namespace veri-agent --create-namespace \
  --set privacyMode=strict \
  --set existingSecret=veri-agent-secrets
```

## Configuration

| Concern | Env / file |
|---------|------------|
| AI keys | `VERA_LLM_ENDPOINT`, `VERA_LLM_API_KEY`, `VERA_LLM_MODEL` |
| Privacy mode | `VERA_AGENT_PRIVACY_MODE=strict\|balanced` |
| Tenant overrides | `VERA_AGENT_TENANT_POLICY_MAP` → JSON map companyId→profile |
| Image egress | `VERA_AGENT_ALLOW_IMAGE_EGRESS` |
| Auth | `JWT_SECRET` (required in prod), `JWT_ISSUER`, `JWT_AUDIENCE`; `AUTH_DEV_BYPASS` forbidden in production |
| Nest invoke | `POST /v1/invoke`, `POST /v1/invoke/multimodal` (JWT) |
| OTLP | `OTEL_EXPORTER_OTLP_ENDPOINT` (empty = stub; set to enable real OTLP export) |

Examples: `deploy/config/production.example.yaml`, `tenant-overrides.example.json`, `orchestration.production.example.json`.

## Observability

- **Metrics** — Prometheus at `/metrics`; optional OTLP flush when `OTEL_EXPORTER_OTLP_ENDPOINT` is set.
- **Tracing** — In-memory spans by default; real OTLP HTTP exporter when endpoint is set (`src/observability/otlp.ts`).
- **Alerts** — `deploy/k8s/prometheus-alerts.yaml` (error rate, policy spikes, rate limits, latency, abuse blocks).
