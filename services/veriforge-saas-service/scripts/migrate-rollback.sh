#!/usr/bin/env sh
# Manual rollback helper (dev / emergency only).
# Usage: ./scripts/migrate-rollback.sh 20260720000000_init
set -eu

NAME="${1:-}"
if [ -z "$NAME" ]; then
  echo "Usage: $0 <migration_folder_name>"
  echo "Example: $0 20260720000000_init"
  exit 1
fi

DOWN="prisma/rollbacks/${NAME}.down.sql"
if [ ! -f "$DOWN" ]; then
  echo "Missing rollback file: $DOWN"
  exit 1
fi

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "WARNING: Applying rollback $DOWN"
echo "This may destroy data. Ctrl+C within 5s to abort."
sleep 5

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DOWN"

echo "Removing Prisma history row for $NAME (if present)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "DELETE FROM \"_prisma_migrations\" WHERE migration_name = '$NAME';"

echo "Rollback complete. Re-deploy a known-good app image that matches the restored schema."
