# Azure infrastructure prep

Starter files for deploying VeriForge on Microsoft Azure.

| File | Purpose |
|------|---------|
| [`env.azure-staging.example`](env.azure-staging.example) | Staging env template (Postgres Flexible Server + Redis URLs) |
| [`../../docs/AZURE-DEPLOYMENT.md`](../../docs/AZURE-DEPLOYMENT.md) | Full launch playbook (AKS, VM, CI/CD, checklist) |

**Quick start (AKS):** follow Path A in the doc — provision AKS + Postgres + Redis + Key Vault, create `veriforge-secrets` in namespace `veriforge-staging`, wire GitHub OIDC, enable `VERIFORGE_DEPLOY_STAGING_ENABLED=true`.

**Quick start (full workspace on one VM):** Path B — `production-deploy.sh --build` plus Nest container; see doc.

There is no committed Bicep/Terraform yet; use the `az` commands in the doc or add IaC under this folder when your subscription layout is fixed.
