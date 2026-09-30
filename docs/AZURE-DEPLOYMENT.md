# VeriForge on Azure — launch prep

Guide for staging and production on Microsoft Azure. Maps this repo’s services to Azure resources and walks through provisioning, secrets, CI/CD, and smoke tests.

**Related:** [`VERIFORGE-DOCKER.md`](VERIFORGE-DOCKER.md) · [`veriforge-cd-runbook.md`](veriforge-cd-runbook.md) · [`VERIFORGE-ENV-VARIABLES.md`](VERIFORGE-ENV-VARIABLES.md)

---

## What you are deploying

| Component | Repo path | Azure home (recommended) |
|-----------|-----------|---------------------------|
| **SaaS API** | `services/veriforge-saas-service` | AKS Deployment `veriforge-api` |
| **Cron worker** | same image, `dist/worker.js` | AKS Deployment `veriforge-worker` |
| **VeriForge SPA** | `apps/veriforge-frontend` | AKS Deployment `veriforge-frontend` (Vite/nginx) |
| **Vera workspace (Next.js)** | `vera-frontend` | **Not in default K8s overlay** — see [Full workspace](#full-workspace-vericore--veripm--hub) |
| **Nest API** | `backend/` | Separate AKS Deployment or Container App |
| **Postgres** | SaaS Prisma schema | **Azure Database for PostgreSQL Flexible Server** |
| **Redis** | SaaS cache / worker | **Azure Cache for Redis** |
| **Secrets** | JWT, Stripe, etc. | **Azure Key Vault** (+ External Secrets Operator) |
| **Ingress / TLS** | nginx Ingress manifests | **NGINX Ingress + cert-manager** or **Application Gateway** |
| **Images** | GHCR (default CD) | Keep GHCR or mirror to **ACR** |

### Default K8s overlay vs full local dev

Local `npm run dev:veriforge` runs **four** processes (Vite SPA, Vera Next, Nest, SaaS). The stock K8s overlay deploys **SaaS + Vite SPA only**.

To test **VeriCore / VeriPM / Hub** online you must also deploy:

1. **Vera Next** (`infra/veriforge/Dockerfile` → `veriforge-app` image), and  
2. **Nest** (`backend/Dockerfile`) with its own Postgres (or a shared instance you configure).

Fastest path for full-module testing on Azure: **one VM + `docker-compose.production.yml` + Nest container** (see [Path B](#path-b--azure-vm--docker-compose-full-workspace)).

---

## Choose a path

| Path | Best for | Time to first URL |
|------|----------|-------------------|
| **A — AKS + managed data** | Team CI/CD, staging that matches `infra/veriforge/k8s` | 1–2 days |
| **B — VM + Docker Compose** | Solo pre-production, full Vera + Nest quickly | Hours |
| **C — Container Apps** | Serverless-style API/worker without managing nodes | 1 day (custom wiring) |

Most teams: **Path B for first external test**, then **Path A** for ongoing staging.

---

## Path A — AKS staging (recommended for CI)

### 1. Azure resources

Create in one region (e.g. `canadacentral` or `eastus`):

```bash
# Variables — change these
export AZ_RG=veriforge-staging-rg
export AZ_LOCATION=canadacentral
export AZ_AKS=veriforge-staging-aks
export AZ_PG=veriforge-staging-pg
export AZ_REDIS=veriforge-staging-redis
export AZ_KV=veriforge-staging-kv

az group create -n "$AZ_RG" -l "$AZ_LOCATION"

# AKS (2 nodes minimum for rolling updates)
az aks create -g "$AZ_RG" -n "$AZ_AKS" -l "$AZ_LOCATION" \
  --node-count 2 --node-vm-size Standard_D2s_v5 \
  --enable-managed-identity --generate-ssh-keys

# Postgres Flexible Server (SaaS DB)
az postgres flexible-server create -g "$AZ_RG" -n "$AZ_PG" -l "$AZ_LOCATION" \
  --sku-name Standard_B1ms --tier Burstable --storage-size 32 \
  --version 16 --admin-user veriforge --admin-password '<GENERATE_STRONG_PASSWORD>'

# Allow AKS outbound IPs to Postgres (or use Private Link for production)
az postgres flexible-server firewall-rule create -g "$AZ_RG" -n "$AZ_PG" \
  --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# Redis
az redis create -g "$AZ_RG" -n "$AZ_REDIS" -l "$AZ_LOCATION" \
  --sku Basic --vm-size c0

# Key Vault
az keyvault create -g "$AZ_RG" -n "$AZ_KV" -l "$AZ_LOCATION" \
  --enable-rbac-authorization true
```

Build connection strings:

```text
DATABASE_URL=postgresql://veriforge:<password>@<pg-fqdn>:5432/postgres?sslmode=require&schema=public
REDIS_URL=rediss://:<primary-key>@<redis-name>.redis.cache.windows.net:6380
```

Store secrets in Key Vault (never commit):

```bash
az keyvault secret set --vault-name "$AZ_KV" -n DATABASE_URL --value "$DATABASE_URL"
az keyvault secret set --vault-name "$AZ_KV" -n JWT_ACCESS_SECRET --value "$(openssl rand -base64 32)"
az keyvault secret set --vault-name "$AZ_KV" -n JWT_REFRESH_SECRET --value "$(openssl rand -base64 32)"
az keyvault secret set --vault-name "$AZ_KV" -n FIELD_ENCRYPTION_KEY --value "$(openssl rand -base64 32)"
# … STRIPE_*, RESEND_API_KEY, PLATFORM_ADMIN_EMAILS
```

### 2. Cluster add-ons

```bash
az aks get-credentials -g "$AZ_RG" -n "$AZ_AKS"

# NGINX Ingress
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace

# cert-manager (Let's Encrypt)
helm repo add jetstack https://charts.jetstack.io
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set crds.enabled=true
```

Point DNS `staging.yourdomain.com` → Ingress public IP (`kubectl get svc -n ingress-nginx`).

Update [`infra/veriforge/k8s/overlays/staging/ingress-patch.yaml`](../infra/veriforge/k8s/overlays/staging/ingress-patch.yaml) and [`configmap-patch.yaml`](../infra/veriforge/k8s/overlays/staging/configmap-patch.yaml) with your host and URLs.

### 3. Kubernetes secrets

One-time (before first deploy):

```bash
kubectl create namespace veriforge-staging

kubectl -n veriforge-staging create secret generic veriforge-secrets \
  --from-literal=DATABASE_URL='...' \
  --from-literal=REDIS_URL='...' \
  --from-literal=JWT_ACCESS_SECRET='...' \
  --from-literal=JWT_REFRESH_SECRET='...' \
  --from-literal=FIELD_ENCRYPTION_KEY='...' \
  --from-literal=STRIPE_SECRET_KEY='sk_test_...' \
  --from-literal=STRIPE_WEBHOOK_SECRET='whsec_...' \
  --from-literal=RESEND_API_KEY='...' \
  --from-literal=PLATFORM_ADMIN_EMAILS='you@yourdomain.com'
```

Long-term: [External Secrets Operator](https://external-secrets.io/) + Key Vault — template at [`infra/veriforge/k8s/externalsecret.example.yaml`](../infra/veriforge/k8s/externalsecret.example.yaml) (switch provider to `azurekv`).

### 4. GitHub Actions → AKS (OIDC)

1. Create an **App registration** (or use managed identity) with **Federated credential** for GitHub:
   - Issuer: `https://token.actions.githubusercontent.com`
   - Subject: `repo:YOUR_ORG/veri-temp:environment:staging` (adjust repo name)
2. Grant **Azure Kubernetes Service Cluster User Role** on the AKS resource (or narrower custom role).
3. Add GitHub **Environment** `staging` with secrets:

| Secret | Value |
|--------|--------|
| `AZURE_CLIENT_ID` | App (client) ID |
| `AZURE_TENANT_ID` | Directory (tenant) ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID |
| `VERIFORGE_DATABASE_URL` | Same as `DATABASE_URL` (for migrate job) |

4. Add repository **variables**:

| Variable | Example |
|----------|---------|
| `VERIFORGE_DEPLOY_STAGING_ENABLED` | `true` |
| `VERIFORGE_DEPLOY_METHOD` | `kustomize` |
| `AKS_CLUSTER` | `veriforge-staging-aks` |
| `AKS_RESOURCE_GROUP` | `veriforge-staging-rg` |

5. Push to `main` → CI builds images → migrate → deploy to `veriforge-staging` namespace.

**Staging-only fallback:** `KUBE_CONFIG_DATA` (base64 kubeconfig) + `VERIFORGE_ALLOW_KUBECONFIG=true` — not allowed for production.

### 5. Smoke tests

```bash
curl -sf https://staging.yourdomain.com/healthz
curl -sf https://staging.yourdomain.com/api/health/ready
```

Then: signup/login, org admin, module list. For workspace modules, complete [Full workspace](#full-workspace-vericore--veripm--hub).

---

## Path B — Azure VM + Docker Compose (full workspace)

Good for **first online test** with VeriCore / VeriPM / Hub.

1. **VM:** Ubuntu 22.04+, `Standard_D4s_v5`, ports 80/443.
2. Install Docker + Compose plugin.
3. Copy [`infra/veriforge/env/.env.staging.example`](../infra/veriforge/env/.env.staging.example) → `infra/veriforge/.env`.
4. Point `DATABASE_URL` at **Azure Postgres** (or a Postgres container only for throwaway tests).
5. Set:
   ```env
   APP_PUBLIC_URL=https://staging.yourdomain.com
   NEXTAUTH_URL=https://staging.yourdomain.com
   CORS_ORIGIN=https://staging.yourdomain.com
   COOKIE_SECURE=true
   RUN_DB_SEED=0
   ```
6. Deploy:
   ```bash
   bash scripts/production-deploy.sh --build
   ```
7. Run **Nest** separately (`backend/Dockerfile`), set Vera/Nest `NEXT_PUBLIC_API_URL` or reverse-proxy `/nest` → Nest `:3001`.
8. Put **Caddy** or **nginx** in front for TLS.

See [`infra/azure/env.azure-staging.example`](../infra/azure/env.azure-staging.example) for Azure-specific notes.

---

## Full workspace (VeriCore / VeriPM / Hub)

| Step | Action |
|------|--------|
| 1 | Deploy **Vera Next** image from `infra/veriforge/Dockerfile` (not the Vite `veriforge-frontend` image). |
| 2 | Deploy **Nest** from `backend/Dockerfile`; run `prisma migrate deploy` on Nest DB. |
| 3 | Set `NEXTAUTH_URL` / `APP_PUBLIC_URL` to your public HTTPS origin (no `/vera` prefix in production). |
| 4 | Create **Nest users** for `/auth/login`; VeriForge SaaS login alone does not open workspace modules. |
| 5 | Do **not** set `NEXT_PUBLIC_VERA_PM_DEV_OPEN=1` on a public host. |

---

## Production checklist

- [ ] HTTPS everywhere; `COOKIE_SECURE=true`, `ENFORCE_HTTPS=true`
- [ ] Postgres + Redis on managed services with backups / PITR
- [ ] Key Vault + RBAC; no secrets in git or plain ConfigMaps
- [ ] `RUN_DB_SEED=0`, no dev seed flags
- [ ] Stripe **live** keys only on production environment
- [ ] GitHub **production** environment with required reviewers
- [ ] Azure OIDC for production deploy (no `KUBE_CONFIG_DATA`)
- [ ] Stripe webhook URL: `https://app.yourdomain.com/webhooks/stripe`
- [ ] `PLATFORM_ADMIN_EMAILS` set to real operator emails
- [ ] Monitoring: Azure Monitor / Container Insights on AKS
- [ ] Runbook: [`veriforge-cd-runbook.md`](veriforge-cd-runbook.md) (rollback = prior image digest, not migrate down)

---

## Cost sketch (staging, monthly)

| Service | Rough size |
|---------|------------|
| AKS (2 × D2s_v5) | $150–250 |
| Postgres Flexible B1ms | $25–40 |
| Redis Basic C0 | $15–20 |
| Key Vault | <$5 |
| Egress / IP | variable |

VM-only Path B is cheaper but you manage patches and backups yourself.

---

## Next steps

1. Pick **Path A** or **Path B** and a staging hostname.
2. Provision Postgres + Redis + secrets in Key Vault.
3. Update K8s overlay hostnames or VM `.env`.
4. Wire GitHub **staging** environment (Azure OIDC secrets + variables above).
5. Deploy and run smoke tests.
6. Add Nest + Vera Next when you need full module testing.

For hosted external reviewers (no repo access): [`VERIFORGE-HOSTED-REVIEW.md`](VERIFORGE-HOSTED-REVIEW.md).
