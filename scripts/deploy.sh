#!/usr/bin/env bash
# VeriForge deploy orchestrator.
#
# DEPLOY_METHOD:
#   kustomize  — infra/veriforge Kustomize overlay (default)
#   ssh        — SSH to host and pull/restart compose or script
#   webhook    — POST deploy webhook
#   dry-run    — print plan only
#
# Required for kustomize: VER, API_DIGEST, WEB_DIGEST, OWNER (or GITHUB_REPOSITORY_OWNER)
# Optional: DEPLOY_ENV=staging|production
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
METHOD="${DEPLOY_METHOD:-kustomize}"
ENV_NAME="${DEPLOY_ENV:-staging}"
OWNER="$(echo "${OWNER:-${GITHUB_REPOSITORY_OWNER:-}}" | tr '[:upper:]' '[:lower:]')"
VER="${VER:-}"
API_DIGEST="${API_DIGEST:-}"
WEB_DIGEST="${WEB_DIGEST:-}"
API_IMAGE="${API_IMAGE:-ghcr.io/${OWNER}/veriforge-api}"
WEB_IMAGE="${WEB_IMAGE:-ghcr.io/${OWNER}/veriforge-frontend}"

echo "==> VeriForge deploy"
echo "    method=${METHOD} env=${ENV_NAME} ver=${VER:-unset}"

dry_run_plan() {
  echo "DRY-RUN plan:"
  echo "  images: ${API_IMAGE}:${VER}@${API_DIGEST}"
  echo "          ${WEB_IMAGE}:${VER}@${WEB_DIGEST}"
  echo "  migrate: scripts/migrate.sh (DATABASE_URL)"
  echo "  overlay: infra/veriforge/k8s/overlays/${ENV_NAME}"
}

deploy_kustomize() {
  if [ -z "$VER" ] || [ -z "$API_DIGEST" ] || [ -z "$WEB_DIGEST" ]; then
    echo "ERROR: VER, API_DIGEST, WEB_DIGEST required for kustomize deploy" >&2
    exit 1
  fi

  if [ "${ENV_NAME}" = "staging" ] && [ "${VERIFORGE_DEPLOY_STAGING_ENABLED:-}" != "true" ]; then
    echo "Staging deploy disabled (set VERIFORGE_DEPLOY_STAGING_ENABLED=true). Skipping."
    exit 0
  fi

  if [ -n "${KUBE_CONFIG_DATA:-}" ]; then
    mkdir -p "${HOME}/.kube"
    echo "${KUBE_CONFIG_DATA}" | base64 -d > "${HOME}/.kube/config"
    chmod 600 "${HOME}/.kube/config"
  fi

  if ! command -v kubectl >/dev/null 2>&1; then
    echo "ERROR: kubectl not found" >&2
    exit 1
  fi

  export GITHUB_REPOSITORY_OWNER="${OWNER}"
  export VER API_DIGEST WEB_DIGEST OWNER
  bash "${ROOT}/infra/veriforge/scripts/kustomize-deploy.sh" "${ENV_NAME}"
}

deploy_ssh() {
  if [ -z "${DEPLOY_SSH_HOST:-}" ] || [ -z "${DEPLOY_SSH_USER:-}" ] || [ -z "${DEPLOY_SSH_KEY:-}" ]; then
    echo "ERROR: DEPLOY_SSH_HOST, DEPLOY_SSH_USER, DEPLOY_SSH_KEY required" >&2
    exit 1
  fi

  KEY_FILE="$(mktemp)"
  # shellcheck disable=SC2064
  trap "rm -f '${KEY_FILE}'" EXIT
  printf '%s\n' "${DEPLOY_SSH_KEY}" > "${KEY_FILE}"
  chmod 600 "${KEY_FILE}"

  REMOTE_PATH="${DEPLOY_SSH_PATH:-/opt/veriforge}"
  SSH=(ssh -i "${KEY_FILE}" -o StrictHostKeyChecking=accept-new "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}")

  echo "==> SSH deploy to ${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:${REMOTE_PATH}"
  "${SSH[@]}" bash -s <<EOF
set -euo pipefail
cd "${REMOTE_PATH}"
export API_IMAGE="${API_IMAGE}:${VER}"
export WEB_IMAGE="${WEB_IMAGE}:${VER}"
if [ -f docker-compose.yml ] || [ -f compose.yml ]; then
  echo "\${DEPLOY_SSH_TOKEN:-}" | docker login ghcr.io -u "${GITHUB_ACTOR:-github}" --password-stdin || true
  docker compose pull
  docker compose up -d
else
  echo "No compose file — expecting remote scripts/deploy-local.sh"
  if [ -x ./scripts/deploy-local.sh ]; then
    VER="${VER}" ./scripts/deploy-local.sh
  else
    echo "ERROR: nothing to deploy on remote host" >&2
    exit 1
  fi
fi
EOF
}

deploy_webhook() {
  if [ -z "${DEPLOY_WEBHOOK_URL:-}" ]; then
    echo "ERROR: DEPLOY_WEBHOOK_URL required" >&2
    exit 1
  fi
  echo "==> POST ${DEPLOY_WEBHOOK_URL}"
  curl -fsS -X POST "${DEPLOY_WEBHOOK_URL}" \
    -H "Authorization: Bearer ${DEPLOY_WEBHOOK_TOKEN:-}" \
    -H "Content-Type: application/json" \
    -d "{\"environment\":\"${ENV_NAME}\",\"version\":\"${VER}\",\"apiImage\":\"${API_IMAGE}:${VER}\",\"webImage\":\"${WEB_IMAGE}:${VER}\",\"apiDigest\":\"${API_DIGEST}\",\"webDigest\":\"${WEB_DIGEST}\"}"
  echo
}

case "${METHOD}" in
  dry-run)
    dry_run_plan
    ;;
  kustomize)
    if [ -z "${KUBE_CONFIG_DATA:-}" ] && [ -z "${GKE_CLUSTER:-}" ] && [ -z "${EKS_CLUSTER:-}" ] && [ -z "${AKS_CLUSTER:-}" ]; then
      echo "No kube credentials configured — dry-run only."
      dry_run_plan
      exit 0
    fi
    deploy_kustomize
    ;;
  ssh)
    deploy_ssh
    ;;
  webhook)
    deploy_webhook
    ;;
  *)
    echo "ERROR: unknown DEPLOY_METHOD=${METHOD}" >&2
    exit 1
    ;;
esac

echo "==> Deploy complete"
