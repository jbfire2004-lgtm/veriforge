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
  echo "==> Build images"
  "${COMPOSE[@]}" build api app
else
  echo "==> Pull images (if registry configured)"
  "${COMPOSE[@]}" pull api app worker 2>/dev/null || true
fi

if [ "$SKIP_MIGRATE" != "1" ]; then
  echo "==> Stop app/api/worker during migrate window"
  "${COMPOSE[@]}" stop app api worker gateway 2>/dev/null || true

  echo "==> Prisma migrate deploy"
  "${COMPOSE[@]}" run --rm --no-deps migrate \
    || "${COMPOSE[@]}" run --rm migrate
else
  echo "==> Skipping migrate (--skip-migrate)"
fi

echo "==> Recreate api + worker + app + gateway"
"${COMPOSE[@]}" up -d --force-recreate --no-deps api
"${COMPOSE[@]}" up -d --force-recreate --no-deps worker
"${COMPOSE[@]}" up -d --force-recreate --no-deps app
"${COMPOSE[@]}" up -d --force-recreate --no-deps gateway

echo "==> Restart worker services (cron)"
"${COMPOSE[@]}" restart worker

echo "==> Health checks"
sleep 5
"${COMPOSE[@]}" ps

API_OK=0
APP_OK=0
for i in $(seq 1 20); do
  if "${COMPOSE[@]}" exec -T api wget -qO- http://127.0.0.1:3020/health/ready >/dev/null 2>&1; then
    API_OK=1
  fi
  if "${COMPOSE[@]}" exec -T app wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1; then
    APP_OK=1
  fi
  if [ "$API_OK" = "1" ] && [ "$APP_OK" = "1" ]; then
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

echo "==> Deploy complete"
echo "    Gateway: http://localhost:${HTTP_PORT:-80}"
echo "    Logs:    ${COMPOSE[*]} logs -f app api worker"
