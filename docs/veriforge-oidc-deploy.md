# VeriForge CD — OIDC deploy (preferred over KUBE_CONFIG_DATA)

## Goal

Replace long-lived kubeconfig secrets with short-lived tokens from GitHub Actions OIDC federated to GKE / EKS / AKS.

## Options

### GKE (Workload Identity Federation)

1. Create workload identity pool + provider for GitHub.
2. Bind `roles/container.developer` (or narrower) to the GitHub service account **scoped to** namespaces `veriforge` and `veriforge-staging`.
3. In CD jobs, use `google-github-actions/auth` + `get-gke-credentials` instead of `KUBE_CONFIG_DATA`.
4. Remove `KUBE_CONFIG_DATA` from the repository secrets once green.

### EKS

1. Create IAM OIDC provider for GitHub Actions (issuer `https://token.actions.githubusercontent.com`).
2. Role trust on `repo:ORG/REPO:environment:staging` and/or `:environment:production`.
3. Map the role in EKS access entries / `aws-auth` so it can apply overlays.
4. GitHub secrets/vars: `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `EKS_CLUSTER`.
5. CD uses `aws-actions/configure-aws-credentials` + `aws eks update-kubeconfig` via `.github/actions/veriforge-kube-auth`.

Full AWS playbook: [`docs/AWS-DEPLOYMENT.md`](AWS-DEPLOYMENT.md).

### AKS

1. Federated credentials on Azure AD app registration (subject: `repo:ORG/REPO:environment:staging`).
2. Grant **Azure Kubernetes Service Cluster User Role** on the AKS cluster.
3. GitHub secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.
4. GitHub variables: `AKS_CLUSTER`, `AKS_RESOURCE_GROUP`.
5. CD uses `azure/login` + `az aks get-credentials` via `.github/actions/veriforge-kube-auth`.

Full Azure playbook: [`docs/AZURE-DEPLOYMENT.md`](AZURE-DEPLOYMENT.md).

**Interim (staging only):** `KUBE_CONFIG_DATA` plus repo variable `VERIFORGE_ALLOW_KUBECONFIG=true`. Production deploy **exits** if kubeconfig is present.

## Production

Production CD **requires** `GCP_WORKLOAD_IDENTITY_PROVIDER` + `GCP_DEPLOY_SERVICE_ACCOUNT` (GKE) or `AWS_DEPLOY_ROLE_ARN` (EKS). `KUBE_CONFIG_DATA` is rejected.

## Checklist

- [ ] OIDC provider configured
- [ ] Least-privilege namespace RoleBinding
- [ ] CD job green on staging
- [ ] `KUBE_CONFIG_DATA` deleted from GitHub secrets
