#!/usr/bin/env bash
# Render a VeriForge kustomize overlay with immutable image@digest refs and apply.
# Usage: VER=sha-... API_DIGEST=sha256:... WEB_DIGEST=sha256:... \
#          bash infra/veriforge/scripts/kustomize-deploy.sh <staging|production>
set -euo pipefail

OVERLAY_NAME="${1:?overlay name required (staging|production)}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OVERLAY="${ROOT}/k8s/overlays/${OVERLAY_NAME}"

OWNER="$(echo "${GITHUB_REPOSITORY_OWNER:-${OWNER:-OWNER}}" | tr '[:upper:]' '[:lower:]')"
VER="${VER:?VER (image tag) required}"
API_DIGEST="${API_DIGEST:?API_DIGEST required}"
WEB_DIGEST="${WEB_DIGEST:?WEB_DIGEST required}"

if [[ "${OVERLAY_NAME}" == "staging" ]]; then
  NS="veriforge-staging"
else
  NS="veriforge"
fi

API_REF="ghcr.io/${OWNER}/veriforge-api:${VER}@${API_DIGEST}"
WEB_REF="ghcr.io/${OWNER}/veriforge-frontend:${VER}@${WEB_DIGEST}"

echo "Deploying overlay=${OVERLAY_NAME} ns=${NS}"
echo "  api=${API_REF}"
echo "  web=${WEB_REF}"

TMP="$(mktemp)"
# shellcheck disable=SC2064
trap "rm -f '${TMP}'" EXIT

kubectl kustomize "${OVERLAY}" \
  | sed "s|ghcr.io/OWNER/veriforge-api:latest|${API_REF}|g" \
  | sed "s|ghcr.io/OWNER/veriforge-frontend:latest|${WEB_REF}|g" \
  > "${TMP}"

kubectl apply -f "${TMP}"

kubectl delete job veriforge-migrate -n "${NS}" --ignore-not-found
# Re-apply so the Job is recreated with the new image digest
kubectl apply -f "${TMP}"
kubectl wait --for=condition=complete "job/veriforge-migrate" -n "${NS}" --timeout=180s

kubectl rollout status deployment/veriforge-api -n "${NS}" --timeout=300s
kubectl rollout status deployment/veriforge-worker -n "${NS}" --timeout=180s
kubectl rollout status deployment/veriforge-frontend -n "${NS}" --timeout=180s

kubectl -n "${NS}" run "curl-${RANDOM}" --rm -i --restart=Never \
  --image=curlimages/curl:8.10.1 -- \
  curl -sf "http://veriforge-api:3020/health/ready"

echo "Deploy ${OVERLAY_NAME} OK"
