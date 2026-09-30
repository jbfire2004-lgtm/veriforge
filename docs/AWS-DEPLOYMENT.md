# VeriForge on AWS — step-by-step deployment plan

End-to-end plan to take this repo from local `npm run dev:veriforge` to a public **staging** URL on AWS, then promote to production.

**Related:** [`VERIFORGE-DOCKER.md`](VERIFORGE-DOCKER.md) · [`veriforge-cd-runbook.md`](veriforge-cd-runbook.md) · [`veriforge-oidc-deploy.md`](veriforge-oidc-deploy.md) · [`VERIFORGE-ENV-VARIABLES.md`](VERIFORGE-ENV-VARIABLES.md)

---

## 0. What you are deploying

| Component | Repo path | AWS target |
|-----------|-----------|------------|
| **SaaS API** | `services/veriforge-saas-service` | EKS Deployment `veriforge-api` *or* Compose `api` |
| **Cron worker** | same image, `dist/worker.js` | EKS `veriforge-worker` *or* Compose `worker` |
| **VeriForge SPA** | `apps/veriforge-frontend` | EKS `veriforge-frontend` (Vite/nginx) |
| **Vera workspace (Next.js)** | `vera-frontend` | **Not in default K8s overlay** — see [Phase 6](#phase-6--full-workspace-vericore--veripm--hub) |
| **Nest API** | `backend/` | Separate ECS/EKS service or Compose container |
| **Postgres** | SaaS Prisma | **Amazon RDS PostgreSQL 16** |
| **Redis** | cache / worker | **ElastiCache Redis** (or Redis in Compose for throwaway staging) |
| **Secrets** | JWT, Stripe, etc. | **Secrets Manager** or **SSM Parameter Store** |
| **TLS / DNS** | ingress / gateway | **ACM certificate** + Route 53 + ALB / nginx Ingress |
| **Images** | GHCR (default CD) | Keep GHCR, or mirror to **ECR** |

### Important scope note

Local unified dev runs **four** processes (Vite SPA, Vera Next, Nest, SaaS).

The stock Kubernetes overlay (`infra/veriforge/k8s`) deploys **SaaS + Vite SPA only**.

To test **VeriCore / VeriPM / Hub** online you also need **Vera Next** + **Nest**. Fastest way to get that: **Path B (EC2 + Compose)**. Use **Path A (EKS)** when you want CI/CD matching the repo overlays.

---

## 1. Choose your path

| Path | Use when | Time to first URL |
|------|----------|-------------------|
| **A — EKS + RDS + ElastiCache** | Team staging, matches `infra/veriforge/k8s` + GitHub CD | 1–2 days |
| **B — EC2 + Docker Compose** | First external test, full Vera + Nest quickly | Hours |
| **C — ECS Fargate** | Prefer managed containers without Kubernetes | 1–2 days (more custom wiring) |

**Recommendation:** Path B for first tester URL → Path A for ongoing staging/production.

Before either path, complete **Phase 2** (accounts, domain, secrets).

---

## Phase 2 — Accounts, domain, and secrets (do this first)

### 2.1 Prerequisites

- [ ] AWS account with billing alerts
- [ ] Region chosen — prefer **`ca-central-1`** (Montreal) for `veriglobal.ca`
- [ ] Domain: **`veriglobal.ca`** (DNS at **GoDaddy** — keep registrar there; point only the subdomains you need at AWS)
- [ ] GitHub repo with Environments: `staging`, `production` (production: required reviewers)
- [ ] Stripe **test** keys, Resend (or accept console email on early staging)
- [ ] AWS CLI + `kubectl` + Docker on your machine (`aws configure` or SSO)

### 2.2 Hostnames (veriglobal.ca)

| Environment | Hostname | Purpose |
|-------------|----------|---------|
| Staging | `https://staging.veriglobal.ca` | Tester / soak URL |
| Production (later) | `https://app.veriglobal.ca` | Live app |
| Apex (optional) | `https://veriglobal.ca` | Marketing / redirect — leave on GoDaddy until you choose otherwise |

Env for staging:

```env
APP_PUBLIC_URL=https://staging.veriglobal.ca
NEXTAUTH_URL=https://staging.veriglobal.ca
CORS_ORIGIN=https://staging.veriglobal.ca
COOKIE_SECURE=true
EMAIL_FROM=VeriForge Staging <noreply@staging.veriglobal.ca>
```

Production Compose/K8s serve Vera at **`/`**, not local `/vera`.

### 2.2a GoDaddy DNS → AWS (do this after you have an IP / ALB hostname)

Keep **nameservers** at GoDaddy. Add records under **DNS Management** for `veriglobal.ca`:

**Path B (EC2 + Elastic IP)**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `staging` | `<EC2 Elastic IP>` | 600 |
| A | `app` | `<prod Elastic IP>` (later) | 600 |

**Path A (EKS / ALB — nginx Ingress LoadBalancer)**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `staging` | `<ingress-nginx EXTERNAL hostname>` | 600 |
| CNAME | `app` | `<prod ALB / ingress hostname>` (later) | 600 |

Notes:

- GoDaddy often requires **CNAME** for ALB DNS names (not an A record to a hostname).
- Do **not** change the apex `@` A record until you intentionally move the main site.
- TLS: issue ACM cert in the **same region** as the ALB for `staging.veriglobal.ca` (and `app.veriglobal.ca` later), **or** use cert-manager + Let’s Encrypt on the Ingress.
- Email: if you send from `@staging.veriglobal.ca` / `@veriglobal.ca`, add SPF/DKIM in GoDaddy for Resend (or your provider).

Verify after DNS propagates:

```bash
nslookup staging.veriglobal.ca
curl -sfI https://staging.veriglobal.ca/healthz
```

### 2.3 Generate secrets (store in Secrets Manager / 1Password — never commit)

```bash
# Examples — use openssl or your password manager
openssl rand -base64 48   # JWT_ACCESS_SECRET
openssl rand -base64 48   # JWT_REFRESH_SECRET
openssl rand -base64 48   # NEXTAUTH_SECRET
openssl rand -base64 48   # FIELD_ENCRYPTION_KEY
```

Also prepare:

| Secret | Notes |
|--------|--------|
| `PLATFORM_ADMIN_EMAILS` | Your operator email(s) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | `sk_test_…` / `whsec_…` for staging |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional early; required for invite emails |
| RDS master password | Strong, unique |
| Redis AUTH token | If ElastiCache encryption in transit + auth |

Template: [`infra/aws/env.aws-staging.example`](../infra/aws/env.aws-staging.example)

---

## Path A — EKS step-by-step (CI/CD)

### Phase 3A — Provision AWS data plane

```bash
export AWS_REGION=ca-central-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export CLUSTER=veriforge-staging
export RDS_ID=veriforge-staging-pg
export REDIS_ID=veriforge-staging-redis
```

**1. VPC** — Use a VPC with public + private subnets (EKS recommended pattern). Options:

- `eksctl` creates a VPC for you, or
- Use an existing VPC and note subnet IDs

**2. RDS PostgreSQL 16**

```bash
# Simplified — prefer private subnets + security group allowing EKS node SG only
aws rds create-db-instance \
  --db-instance-identifier "$RDS_ID" \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username veriforge \
  --master-user-password '<STRONG_PASSWORD>' \
  --allocated-storage 20 \
  --storage-type gp3 \
  --publicly-accessible false \
  --backup-retention-period 7 \
  --region "$AWS_REGION"
```

Build:

```text
DATABASE_URL=postgresql://veriforge:<password>@<rds-endpoint>:5432/veriforge?sslmode=require&schema=public
```

Create database `veriforge` if the instance only has `postgres` (connect once and `CREATE DATABASE veriforge;`).

**3. ElastiCache Redis**

```bash
# Prefer Redis 7, encryption in transit, AUTH token in production
# Staging: single-node cache.t4g.micro is enough to start
aws elasticache create-cache-cluster \
  --cache-cluster-id "$REDIS_ID" \
  --engine redis \
  --cache-node-type cache.t4g.micro \
  --num-cache-nodes 1 \
  --region "$AWS_REGION"
```

```text
REDIS_URL=redis://:<auth-if-any>@<primary-endpoint>:6379
# or rediss://… if TLS is required
```

**4. Secrets Manager**

```bash
aws secretsmanager create-secret --name veriforge/staging/app \
  --secret-string '{
    "DATABASE_URL":"...",
    "REDIS_URL":"...",
    "JWT_ACCESS_SECRET":"...",
    "JWT_REFRESH_SECRET":"...",
    "FIELD_ENCRYPTION_KEY":"...",
    "STRIPE_SECRET_KEY":"sk_test_...",
    "STRIPE_WEBHOOK_SECRET":"whsec_...",
    "RESEND_API_KEY":"",
    "PLATFORM_ADMIN_EMAILS":"you@veriglobal.ca"
  }'
```

### Phase 4A — Create EKS and ingress

**1. Cluster (eksctl example)**

```bash
eksctl create cluster \
  --name "$CLUSTER" \
  --region "$AWS_REGION" \
  --version 1.29 \
  --nodegroup-name ng-standard \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

**2. Allow EKS nodes → RDS / Redis**

- Attach security-group ingress on RDS/ElastiCache for the EKS node (or pod) security group on ports `5432` / `6379`.

**3. NGINX Ingress + cert-manager**

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace

helm repo add jetstack https://charts.jetstack.io
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set crds.enabled=true
```

**4. DNS**

```bash
kubectl get svc -n ingress-nginx
# Point staging.veriglobal.ca A/ALIAS → LoadBalancer hostname/IP
```

Request an ACM cert in the **same region as the ALB**, or use cert-manager ClusterIssuer + Let’s Encrypt on the Ingress.

**5. Patch repo overlays for your host**

Edit:

- `infra/veriforge/k8s/overlays/staging/ingress-patch.yaml` → `host: staging.veriglobal.ca`
- `infra/veriforge/k8s/overlays/staging/configmap-patch.yaml` → `APP_PUBLIC_URL`, `CORS_ORIGIN`, `EMAIL_FROM`

### Phase 5A — Kubernetes secrets + first deploy

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
  --from-literal=RESEND_API_KEY='' \
  --from-literal=PLATFORM_ADMIN_EMAILS='you@veriglobal.ca'
```

Long-term: External Secrets Operator → AWS Secrets Manager ([`externalsecret.example.yaml`](../infra/veriforge/k8s/externalsecret.example.yaml)).

**GitHub → EKS OIDC (required for production; preferred for staging)**

1. Create IAM OIDC identity provider for GitHub Actions (issuer `https://token.actions.githubusercontent.com`).
2. IAM role trust policy subject:
   - Staging: `repo:YOUR_ORG/YOUR_REPO:environment:staging`
   - Production: `repo:YOUR_ORG/YOUR_REPO:environment:production`
3. Attach a policy that allows `eks:DescribeCluster` + `eks:AccessKubernetesApi` (and map the role in `aws-auth` / EKS access entries so it can apply to `veriforge-staging` / `veriforge`).
4. GitHub **Environment** secrets / vars:

| Name | Type | Value |
|------|------|--------|
| `AWS_DEPLOY_ROLE_ARN` | secret | `arn:aws:iam::ACCOUNT:role/veriforge-gha-deploy` |
| `VERIFORGE_DATABASE_URL` | secret | Same as RDS `DATABASE_URL` (migrate job) |
| `AWS_REGION` | variable | e.g. `us-east-1` |
| `EKS_CLUSTER` | variable | `veriforge-staging` |
| `VERIFORGE_DEPLOY_STAGING_ENABLED` | variable | `true` |
| `VERIFORGE_DEPLOY_METHOD` | variable | `kustomize` |

CD already supports this via `.github/actions/veriforge-kube-auth` + `scripts/deploy.sh`.

**Deploy**

1. Merge to `main` (path-filtered CD) **or** Actions → VeriForge CD → environment `staging`.
2. Wait for: build/push GHCR images → Prisma migrate → kustomize apply.
3. Smoke:

```bash
curl -sf https://staging.veriglobal.ca/healthz
curl -sf https://staging.veriglobal.ca/api/health/ready
```

Staging-only fallback: `KUBE_CONFIG_DATA` + `VERIFORGE_ALLOW_KUBECONFIG=true` — **not** allowed for production.

Continue with [Phase 6](#phase-6--full-workspace-vericore--veripm--hub) if you need Core/PM/Hub.

---

## Path B — EC2 + Docker Compose (full workspace, fastest)

### Phase 3B — EC2 host

1. Launch **Ubuntu 22.04 LTS**, e.g. `t3.xlarge` (4 vCPU / 16 GB) for build+run.
2. Security group: `22` (your IP only), `80`, `443`.
3. Elastic IP + DNS `staging.veriglobal.ca` → EIP.
4. Install Docker + Compose plugin; clone the repo (deploy key or CI artifact — do not leave `.env` in git).

### Phase 4B — Env and managed DB (recommended)

1. Create RDS + (optional) ElastiCache as in Phase 3A, **or** use Compose Postgres/Redis only for disposable staging.
2. Copy env:

```bash
cp infra/aws/env.aws-staging.example infra/veriforge/.env
# fill secrets; APP_PUBLIC_URL / NEXTAUTH_URL / CORS_ORIGIN = https://staging.veriglobal.ca
```

3. If using Compose-local Postgres, keep `DATABASE_URL` host `db` as in production compose. If using RDS, set the RDS endpoint and **do not** rely on the compose `db` service for app data (or override compose).

### Phase 5B — Deploy VeriForge stack

```bash
cd /opt/veriforge   # or your clone path
bash scripts/production-deploy.sh --build
```

That brings up: Postgres (or skip if RDS), Redis, SaaS API, worker, **Vera Next (`app`)**, nginx gateway — see [`VERIFORGE-DOCKER.md`](VERIFORGE-DOCKER.md).

**TLS in front of port 80**

- **Caddy** or **nginx + Certbot**, or
- **ALB + ACM** terminating TLS and forwarding to the instance `:80`

Set:

```env
COOKIE_SECURE=true
ENFORCE_HTTPS=true
RUN_DB_SEED=0
```

Do **not** set `NEXT_PUBLIC_VERA_PM_DEV_OPEN=1` or `SEED_DEV_USERS=1` on a public host.

### Phase 5B-extra — Nest (required for modules)

```bash
# Build backend image from repo root
docker build -f backend/Dockerfile -t veriforge-nest:staging ./backend

# Run with Nest DATABASE_URL, PUBLIC_BASE_URL, CORS_ORIGIN
# Proxy /nest → Nest :3001 from Caddy/nginx (or set NEXT_PUBLIC_API_URL to Nest URL)
```

Run Nest `prisma migrate deploy` against the Nest database.

Then complete [Phase 6](#phase-6--full-workspace-vericore--veripm--hub) accounts + smoke.

---

## Phase 6 — Full workspace (VeriCore / VeriPM / Hub)

| Step | Action |
|------|--------|
| 1 | Vera Next is running (Compose `app` **or** separate EKS Deployment from `infra/veriforge/Dockerfile`) |
| 2 | Nest is running + migrated |
| 3 | Public HTTPS origin set on both UIs and Nest (`PUBLIC_BASE_URL`) |
| 4 | Create **Nest workspace user** for `/auth/login` |
| 5 | Create **VeriForge SaaS** org/admin (`PLATFORM_ADMIN_EMAILS`) for module entitlements |
| 6 | Open modules and confirm no blank/redirect-loop pages |

Two logins:

| System | URL | Purpose |
|--------|-----|---------|
| VeriForge SaaS | SPA `/login` or org console | Entitlements, billing, org admin |
| Vera NextAuth | `/auth/login` | Core / PM / Hub workspace |

---

## Phase 7 — Smoke test checklist

- [ ] `GET https://staging.veriglobal.ca/healthz` → OK  
- [ ] `GET https://staging.veriglobal.ca/api/health/ready` → OK  
- [ ] Nest health responds (path you exposed)  
- [ ] HTTPS valid (no mixed content)  
- [ ] SaaS signup/login works  
- [ ] Platform admin sees modules  
- [ ] VeriPM / VeriCore / Hub load after Vera sign-in  
- [ ] Stripe webhook (staging): `https://staging.veriglobal.ca/webhooks/...` configured in Stripe Dashboard  
- [ ] Optional: Playwright with `PLAYWRIGHT_BASE_URL=https://staging.veriglobal.ca`

---

## Phase 8 — Production promotion

1. Duplicate stack: separate RDS, Redis, EKS namespace `veriforge` (or second account).
2. Fill production secrets; Stripe **live** keys only in GitHub Environment `production`.
3. Patch `infra/veriforge/k8s/overlays/production` hostnames.
4. Soak staging on a `sha-*` image tag.
5. Actions → promote-production with that version → environment approval.
6. Rollback = prior image digest / `kubectl rollout undo` — **never** migrate down ([`veriforge-cd-runbook.md`](veriforge-cd-runbook.md)).

Production checklist:

- [ ] HTTPS + HSTS; `COOKIE_SECURE=true`
- [ ] RDS multi-AZ + automated backups / PITR
- [ ] Redis with AUTH + encryption in transit
- [ ] Secrets Manager / External Secrets; no secrets in git
- [ ] `RUN_DB_SEED=0`; no PM dev-open
- [ ] GitHub OIDC (`AWS_DEPLOY_ROLE_ARN`); no `KUBE_CONFIG_DATA`
- [ ] CloudWatch / Container Insights
- [ ] `PLATFORM_ADMIN_EMAILS` = real operators only

---

## Cost sketch (staging / month, rough USD)

| Service | Rough size |
|---------|------------|
| EKS control plane | ~$73 |
| 2 × t3.medium nodes | ~$60–80 |
| RDS db.t4g.micro | ~$15–25 |
| ElastiCache cache.t4g.micro | ~$12–20 |
| ALB / data transfer | variable |
| **EC2 Path B (t3.xlarge)** | often cheaper for a single tester stack |

---

## Ordered checklist (copy/paste)

1. [ ] Choose Path A (EKS) or Path B (EC2)  
2. [ ] Region — prefer `ca-central-1` for veriglobal.ca  
3. [ ] Generate JWT / NextAuth / field-encryption secrets  
4. [ ] Provision RDS (+ Redis)  
5. [ ] Provision EKS **or** EC2 + Docker  
6. [ ] GoDaddy DNS: `staging` → AWS IP/ALB; TLS for `staging.veriglobal.ca`  
7. [ ] Write `.env` / K8s secrets from [`infra/aws/env.aws-staging.example`](../infra/aws/env.aws-staging.example)  
8. [ ] Wire GitHub `staging` (`AWS_DEPLOY_ROLE_ARN`, `EKS_CLUSTER`, `AWS_REGION`, migrate URL) **or** SSH deploy  
9. [ ] First deploy + health checks on `https://staging.veriglobal.ca`  
10. [ ] Deploy Nest + Vera workspace accounts  
11. [ ] Module smoke tests  
12. [ ] Share staging URL with testers ([`VERIFORGE-HOSTED-REVIEW.md`](VERIFORGE-HOSTED-REVIEW.md) if no repo access)  
13. [ ] Production: `app.veriglobal.ca` + promote when soak is green  
14. [ ] VeriAgent: deploy with defaults, then enable SAFETY overlay on staging (see Phase 9)

---

## Phase 9 — VeriAgent on AWS (AI safety)

VeriAgent is the **only approved LLM egress**. Default Nest path stays in-process; remote microservice is opt-in.

Full safety map: [`VERI-AGENT-AI-SAFETY.md`](./VERI-AGENT-AI-SAFETY.md).

### 9.1 Keep current build behavior (recommended first)

- Do **not** set `VERA_AGENT_REMOTE_URL` until Nest + microservice are soaked.
- Do **not** set `VERA_AGENT_SAFETY_REQUIRE_CONFIRM`.
- Optional later: `VERA_AGENT_SAFETY_OVERLAY=enhanced` on staging for richer audit metadata only.

### 9.2 If you run the microservice on AWS

| Piece | Suggestion |
|-------|------------|
| Compute | EKS Deployment / ECS task / sidecar next to Nest |
| Port | `3040` (internal only — never public) |
| Auth | `JWT_SECRET` shared with Nest; `AUTH_DEV_BYPASS=false` |
| Logs | CloudWatch from container stdout (pino JSON audit) |
| LLM | Provider keys in Secrets Manager; zero-retention contract |
| Image egress | Keep `VERA_AGENT_ALLOW_IMAGE_EGRESS=false` until product needs Smart AI photos |

Env snippet (staging):

```env
NODE_ENV=production
AUTH_DEV_BYPASS=false
JWT_SECRET=FROM_SECRETS_MANAGER
VERA_AGENT_SAFETY_OVERLAY=enhanced
# VERA_AGENT_SAFETY_REQUIRE_CONFIRM=true   # only after Nest sends X-Veri-Agent-Confirm
VERA_AGENT_ALLOW_IMAGE_EGRESS=false
```

### 9.3 Nest wiring (opt-in)

```env
# Leave unset to preserve today’s in-process VeriAgent (no build/runtime change)
# VERA_AGENT_REMOTE_URL=http://veri-agent.internal:3040
# VERA_AGENT_REMOTE_STRICT=false
```

### 9.4 Smoke

```bash
curl -sf http://127.0.0.1:3040/health/ready   # if microservice deployed
# Nest copilot / FLHA path still works with remote URL unset
```

---

## Next decision

Domain locked: **`veriglobal.ca`** (GoDaddy) → staging **`staging.veriglobal.ca`**, prod **`app.veriglobal.ca`**.

Still need:

1. **Path A (EKS)** or **Path B (EC2)**  
2. AWS **region** (recommend **`ca-central-1`**)  
3. VeriAgent: **in-process only** (default) or **remote microservice** on AWS  

…and we can turn the matching path into exact commands (VPC/SG, GitHub OIDC trust JSON, GoDaddy record values once the ALB/EIP exists).
