# AWS infrastructure prep

Starter files for deploying VeriForge on Amazon Web Services.

| File | Purpose |
|------|---------|
| [`env.aws-staging.example`](env.aws-staging.example) | Staging env (RDS + ElastiCache URL shapes) |
| [`../../docs/AWS-DEPLOYMENT.md`](../../docs/AWS-DEPLOYMENT.md) | Full step-by-step plan (EKS, EC2, CI/CD, checklist) |

**Quick start (EKS):** follow Path A in the doc — RDS + ElastiCache + EKS + Ingress, create `veriforge-secrets` in `veriforge-staging`, wire GitHub OIDC (`AWS_DEPLOY_ROLE_ARN`, `EKS_CLUSTER`, `AWS_REGION`), set `VERIFORGE_DEPLOY_STAGING_ENABLED=true`.

**Quick start (full workspace on one EC2):** Path B — `bash scripts/production-deploy.sh --build` plus Nest container and TLS.

OIDC details: [`docs/veriforge-oidc-deploy.md`](../../docs/veriforge-oidc-deploy.md).

There is no committed Terraform/CDK yet; use the AWS CLI / `eksctl` steps in the doc or add IaC under this folder when your account layout is fixed.
