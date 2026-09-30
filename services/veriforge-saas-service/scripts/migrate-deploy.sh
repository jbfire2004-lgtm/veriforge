#!/usr/bin/env sh
# Deployment-safe migrate + seed entrypoint for Compose / K8s Job.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Preflight: destructive migration check"
if [ -f scripts/check-destructive-migrations.sh ]; then
  sh scripts/check-destructive-migrations.sh
elif command -v npx >/dev/null 2>&1; then
  npx tsx scripts/check-destructive-migrations.ts
fi

echo "==> Prisma migrate deploy (history → _prisma_migrations)"
npx prisma migrate deploy

if [ "${RUN_DB_SEED:-1}" = "1" ]; then
  echo "==> Seed catalog (roles, modules, permissions) — idempotent"
  if npx prisma db seed; then
    :
  elif [ -f prisma/seed.sql ] && command -v psql >/dev/null 2>&1; then
    echo "Falling back to prisma/seed.sql"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seed.sql
  else
    echo "WARN: seed skipped (no prisma seed / psql)"
  fi
fi

echo "==> Migration status"
npx prisma migrate status || true

echo "==> Migrate pipeline complete"
