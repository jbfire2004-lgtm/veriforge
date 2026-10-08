#!/usr/bin/env bash
# VeriForge production deploy — pull/build images, migrate, recreate app + worker.
#
# Usage (from repo root):
#   bash infra/veriforge/scripts/production-deploy.sh
#   IMAGE_TAG=sha-abc123 bash infra/veriforge/scripts/production-deploy.sh
#   bash infra/veriforge/scripts/production-deploy.sh --build
#
# Requires: docker compose, infra/veriforge/.env (from env/.env.production.example)
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/../../.." && pwd)"
COMPOSE_DIR="${ROOT}/infra/veriforge"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.production.yml"
ENV_FILE="${COMPOSE_DIR}/.env"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DO_BUILD=0
SKIP_MIGRATE=0

for arg in "$@"; do
  case "$arg" in
    --build) DO_BUILD=1 ;;
    --skip-migrate) SKIP_MIGRATE=1 ;;
    --help|-h)
      echo "Usage: $0 [--build] [--skip-migrate]"
      exit 0
      ;;
  esac
done

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: missing ${ENV_FILE}" >&2
  echo "Copy env/.env.production.example → .env and fill secrets." >&2
  exit 1
fi

# Load secrets for local shell checks (compose also uses --env-file)
set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

reject_placeholder() {
  local name="$1"
  local min="${2:-32}"
  local val="${!name:-}"
  if [ -z "$val" ] || printf '%s' "$val" | grep -Eq 'USE_SECRET_MANAGER|FROM_SECRETS_MANAGER|CHANGE_ME|REPLACE_ME'; then
    echo "ERROR: ${name} is missing or still a placeholder. Fill infra/veriforge/.env on the server; do not copy a laptop .env." >&2
    exit 1
  fi
  if [ "${#val}" -lt "$min" ]; then
    echo "ERROR: ${name} must be at least ${min} characters" >&2
    exit 1
  fi
}

reject_placeholder POSTGRES_PASSWORD 12
reject_placeholder JWT_ACCESS_SECRET 32
reject_placeholder JWT_REFRESH_SECRET 32
reject_placeholder NEXTAUTH_SECRET 32
reject_placeholder FIELD_ENCRYPTION_KEY 32
reject_placeholder NEST_JWT_SECRET 32

case "${APP_PUBLIC_URL:-}" in
  https://*)
    if [ "${COOKIE_SECURE:-}" != "true" ] || [ "${ENFORCE_HTTPS:-}" != "true" ] || [ "${VERA_ENFORCE_HTTPS:-}" != "true" ] || [ "${ENABLE_ORIGIN_GUARD:-}" != "true" ]; then
      echo "ERROR: https APP_PUBLIC_URL requires COOKIE_SECURE=true, ENFORCE_HTTPS=true, VERA_ENFORCE_HTTPS=true, ENABLE_ORIGIN_GUARD=true" >&2
      exit 1
    fi
    if [ "${RUN_DB_SEED:-0}" != "0" ]; then
      echo "ERROR: RUN_DB_SEED must be 0 on a public host" >&2
      exit 1
    fi
    ;;
  http://localhost*|http://127.0.0.1*)
    echo "==> Local HTTP origin; HTTPS cookie flags are not required"
    ;;
  *)
    echo "ERROR: APP_PUBLIC_URL must be https:// for EC2, or http://localhost for a local trial" >&2
    exit 1
    ;;
esac

COMPOSE=(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE")
export IMAGE_TAG

cd "$COMPOSE_DIR"

echo "==> VeriForge production deploy (tag=${IMAGE_TAG})"

# Ensure data plane is up first
echo "==> Start db + redis"
"${COMPOSE[@]}" up -d db redis
"${COMPOSE[@]}" ps db redis

echo "==> Wait for db healthy"
PGUSER="${POSTGRES_USER:-veriforge}"
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T db pg_isready -U "$PGUSER" >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "ERROR: postgres not healthy" >&2
    exit 1
  fi
done

if [ "$DO_BUILD" = "1" ]; then
  echo "==> Build images (one at a time)"
  "${COMPOSE[@]}" build api
  "${COMPOSE[@]}" build app
  "${COMPOSE[@]}" build nest
else
  echo "==> Pull images (if registry configured)"
  "${COMPOSE[@]}" pull api app worker nest 2>/dev/null || true
fi

if printf '%s' "${NEST_DATABASE_URL:-}" | grep -Eq '@db[:/]'; then
  echo "==> Ensure local Nest database vera_nest exists"
  NEST_DB_NAME="$(printf '%s' "${NEST_DATABASE_URL}" | sed -E 's#.*/([^/?]+)(\?.*)?$#\1#')"
  case "$NEST_DB_NAME" in
    ''|*[!A-Za-z0-9_]*)
      echo "ERROR: NEST_DATABASE_URL database name must be letters, numbers, and underscores" >&2
      exit 1
      ;;
  esac
  if ! "${COMPOSE[@]}" exec -T db psql -U "$PGUSER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${NEST_DB_NAME}'" | grep -q 1; then
    "${COMPOSE[@]}" exec -T db psql -U "$PGUSER" -d postgres -c "CREATE DATABASE \"${NEST_DB_NAME}\""
  fi
else
  echo "==> Nest database host is external; create that database before migrate"
fi

if [ "$SKIP_MIGRATE" != "1" ]; then
  echo "==> Stop app/api/worker/nest during migrate window"
  "${COMPOSE[@]}" stop app api worker nest gateway 2>/dev/null || true

  echo "==> SaaS Prisma migrate deploy"
  "${COMPOSE[@]}" run --rm --no-deps migrate \
    || "${COMPOSE[@]}" run --rm migrate

  echo "==> Nest Prisma migrate deploy"
  "${COMPOSE[@]}" run --rm --no-deps nest-migrate \
    || "${COMPOSE[@]}" run --rm nest-migrate
else
  echo "==> Skipping migrate (--skip-migrate)"
fi

echo "==> Recreate api + worker + nest + app + gateway"
"${COMPOSE[@]}" up -d --force-recreate --no-deps api
"${COMPOSE[@]}" up -d --force-recreate --no-deps worker
"${COMPOSE[@]}" up -d --force-recreate --no-deps nest
"${COMPOSE[@]}" up -d --force-recreate --no-deps app
"${COMPOSE[@]}" up -d --force-recreate --no-deps gateway

echo "==> Restart worker services (cron)"
"${COMPOSE[@]}" restart worker

echo "==> Health checks"
sleep 5
"${COMPOSE[@]}" ps

API_OK=0
APP_OK=0
NEST_OK=0
for i in $(seq 1 30); do
  if "${COMPOSE[@]}" exec -T api wget -qO- http://127.0.0.1:3020/health/ready >/dev/null 2>&1; then
    API_OK=1
  fi
  if "${COMPOSE[@]}" exec -T app wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1; then
    APP_OK=1
  fi
  if "${COMPOSE[@]}" exec -T nest wget -qO- --header="X-Forwarded-Proto: https" http://127.0.0.1:3001/health >/dev/null 2>&1; then
    NEST_OK=1
  fi
  if [ "$API_OK" = "1" ] && [ "$APP_OK" = "1" ] && [ "$NEST_OK" = "1" ]; then
    break
  fi
  sleep 3
done

if [ "$API_OK" != "1" ]; then
  echo "WARN: api health not ready yet — check logs: docker compose -f ${COMPOSE_FILE} logs api" >&2
fi
if [ "$APP_OK" != "1" ]; then
  echo "WARN: app health not ready yet — check logs: docker compose -f ${COMPOSE_FILE} logs app" >&2
fi
if [ "$NEST_OK" != "1" ]; then
  echo "WARN: nest health not ready yet — check logs: docker compose -f ${COMPOSE_FILE} logs nest" >&2
fi

echo "==> Deploy complete"
echo "    Gateway: http://localhost:${HTTP_PORT:-80}"
echo "    Nest:    proxied at /nest/"
echo "    Logs:    ${COMPOSE[*]} logs -f app api nest worker"
