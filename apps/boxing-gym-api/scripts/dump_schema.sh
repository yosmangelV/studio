#!/usr/bin/env bash
# Regenerates schema/public.sql from the live database (read-only).
#
# Needs SUPABASE_DB_URL in apps/boxing-gym-api/.env (Supabase → Connect →
# Session pooler URI) and any psql on PATH, or PSQL=/path/to/psql.
# The connection string is never printed.
set -euo pipefail

cd "$(dirname "$0")/.."

PSQL="${PSQL:-psql}"
DB_URL="${SUPABASE_DB_URL:-}"
if [[ -z "$DB_URL" && -f .env ]]; then
  DB_URL="$(grep -E '^SUPABASE_DB_URL=' .env | cut -d= -f2- | tr -d "\"'\r")"
fi
if [[ -z "$DB_URL" ]]; then
  echo "SUPABASE_DB_URL is not set (env or .env)." >&2
  exit 1
fi

mkdir -p schema
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

PGOPTIONS='-c default_transaction_read_only=on' \
  "$PSQL" "$DB_URL" -X -q -A -t -f scripts/schema_snapshot.sql >"$tmp" 2>&1 \
  || { sed -E 's#postgres(ql)?://[^ ]*#<redacted>#g' "$tmp" >&2; exit 1; }

mv "$tmp" schema/public.sql
trap - EXIT
echo "Wrote schema/public.sql ($(wc -l <schema/public.sql | tr -d ' ') lines)."
