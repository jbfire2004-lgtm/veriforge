#!/usr/bin/env bash
# VeriForge production migrate entrypoint — Prisma migrate deploy (+ optional seed).
# Usage:
#   DATABASE_URL=postgres://... bash scripts/migrate.sh
#   bash scripts/migrate.sh --seed
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
SAAS="${ROOT}/services/veriforge-saas-service"
SEED="${RUN_DB_SEED:-0}"

for arg in "$@"; do
  case "$arg" in
    --seed) SEED=1 ;;
    --no-seed) SEED=0 ;;
  esac
done

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is required" >&2
  exit 1
fi

cd "$SAAS"

echo "==> VeriForge migrate (cwd=$(pwd))"

if command -v pnpm >/dev/null 2>&1; then
  PM=(pnpm exec)
  RUN=(pnpm run)
elif command -v npx >/dev/null 2>&1; then
  PM=(npx)
  RUN=(npm run)
else
  echo "ERROR: pnpm or npx required" >&2
  exit 1
fi

if [ -f scripts/check-destructive-migrations.sh ]; then
  echo "==> Preflight: destructive migration check"
  sh scripts/check-destructive-migrations.sh
fi

echo "==> prisma migrate deploy"
"${PM[@]}" prisma migrate deploy

if [ "$SEED" = "1" ]; then
  echo "==> Seed catalog (idempotent)"
  if "${RUN[@]}" db:seed; then
    :
  elif [ -f prisma/seed.sql ] && command -v psql >/dev/null 2>&1; then
    echo "Falling back to prisma/seed.sql"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seed.sql
  else
    echo "WARN: seed skipped"
  fi
fi

echo "==> prisma migrate status"
"${PM[@]}" prisma migrate status || true

echo "==> Migrate complete"
