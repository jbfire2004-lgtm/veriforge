#!/usr/bin/env sh
# Shell preflight (no Node) — used in production images.
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
MIG="$ROOT/prisma/migrations"
ALLOW="${ALLOW_DESTRUCTIVE_MIGRATIONS:-0}"

if [ ! -d "$MIG" ]; then
  echo "No migrations directory at $MIG"
  exit 0
fi

# Portable recursive grep for destructive DDL in migration.sql files
hits=""
# shellcheck disable=SC2044
for f in $(find "$MIG" -type f -name 'migration.sql' 2>/dev/null); do
  case "$f" in
    */_templates/*) continue ;;
  esac
  if grep -Eiq 'DROP[[:space:]]+(TABLE|COLUMN|TYPE)|TRUNCATE|DROP[[:space:]]+VALUE|DROP[[:space:]]+CONSTRAINT' "$f"; then
    hits="$hits\n  - $f"
  fi
done

if [ -n "$hits" ] && [ "$ALLOW" != "1" ]; then
  printf 'Destructive migration SQL detected:%b\n' "$hits"
  echo "Set ALLOW_DESTRUCTIVE_MIGRATIONS=1 after review, or rewrite as expand/contract."
  exit 1
fi

if [ -n "$hits" ] && [ "$ALLOW" = "1" ]; then
  echo "ALLOW_DESTRUCTIVE_MIGRATIONS=1 — continuing despite destructive SQL."
fi

echo "Migration safety check OK."
