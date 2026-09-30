# VeriForge CD — operator checklist

## GitHub setup

1. Create Environments: `staging`, `production` (add required reviewers on `production`).
2. Repository variables:
   - `VERIFORGE_DEPLOY_STAGING_ENABLED=true` when the staging cluster/namespace is ready.
3. Repository secrets:
   - **Required for production:** `GCP_WORKLOAD_IDENTITY_PROVIDER` + `GCP_DEPLOY_SERVICE_ACCOUNT`, *or* `AWS_DEPLOY_ROLE_ARN`.
   - Staging-only fallback: `KUBE_CONFIG_DATA` **and** variable `VERIFORGE_ALLOW_KUBECONFIG=true`. Production rejects kubeconfig.
   - `PLAYWRIGHT_TEST_PASSWORD` — required for Vera E2E (no fallback).
   - Optional: `SNYK_TOKEN`.
4. Branch protection on `main` — require status checks:
   - `API lint + test`
   - `Frontend typecheck + build`
   - Prefer also: `Backend CI`, `Vera Core CI`, `nav-smoke` as applicable.

## Promotion flow

```text
PR → VeriForge CI (npm ci + Postgres integration)
  → merge to main
  → CD build sha-xxxxxxxxxxxx (cosign + SBOM + attest)
  → deploy staging overlay (veriforge-staging)
  → soak / synthetic probe
  → Actions → VeriForge CD → promote-production + version=sha-...
  → production environment approval
  → digest-pinned deploy (veriforge)
```

## Hotfix

1. Fix on branch → PR → merge main.
2. Confirm staging healthy.
3. Promote same `sha-*` to production.

## Rollback

Actions → VeriForge CD → `rollback`:

| Field | Value |
|---|---|
| overlay | `production` or `staging` |
| version | prior `sha-*` (preferred) or empty for `rollout undo` |

Migrations are **not** reversed. Use forward-fix or PITR.

## OIDC (required for production)

Production CD uses `.github/actions/veriforge-kube-auth` (GitHub OIDC → GKE WIF or AWS IAM). See `docs/veriforge-oidc-deploy.md`. `KUBE_CONFIG_DATA` is not a production path.
