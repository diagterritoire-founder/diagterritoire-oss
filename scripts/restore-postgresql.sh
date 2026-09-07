#!/usr/bin/env bash
set -Eeuo pipefail

: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${TARGET_DATABASE_URL:?TARGET_DATABASE_URL is required}"
: "${RESTORE_CONFIRM_DATABASE:?RESTORE_CONFIRM_DATABASE is required}"

command -v psql >/dev/null 2>&1 || { echo "ERROR: psql is required." >&2; exit 1; }
command -v pg_restore >/dev/null 2>&1 || { echo "ERROR: pg_restore is required." >&2; exit 1; }
command -v sha256sum >/dev/null 2>&1 || { echo "ERROR: sha256sum is required." >&2; exit 1; }

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: backup file not found." >&2
  exit 1
fi

BACKUP_FILE="$(realpath "$BACKUP_FILE")"
CHECKSUM_FILE="$BACKUP_FILE.sha256"

if [ ! -f "$CHECKSUM_FILE" ]; then
  echo "ERROR: checksum file not found." >&2
  exit 1
fi

BACKUP_DIR="$(dirname "$BACKUP_FILE")"
CHECKSUM_NAME="$(basename "$CHECKSUM_FILE")"

printf "Verifying backup checksum...\n"
(
  cd "$BACKUP_DIR"
  sha256sum -c "$CHECKSUM_NAME"
)

pg_restore --list "$BACKUP_FILE" >/dev/null

TARGET_DB="$(psql "$TARGET_DATABASE_URL" -Atqc "SELECT current_database();")"

if [ -z "$TARGET_DB" ]; then
  echo "ERROR: unable to identify target database." >&2
  exit 1
fi

if [ "$RESTORE_CONFIRM_DATABASE" != "$TARGET_DB" ]; then
  echo "ERROR: restore confirmation does not match target database." >&2
  exit 1
fi

OBJECT_COUNT="$(psql "$TARGET_DATABASE_URL" -Atqc "SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname = 'public' AND c.relkind IN ('r','p','v','m','S','f');")"

if [ "$OBJECT_COUNT" != "0" ]; then
  echo "ERROR: target database is not empty; restore refused." >&2
  exit 1
fi

printf "Restoring backup into database: %s\n" "$TARGET_DB"
pg_restore \
  --exit-on-error \
  --no-owner \
  --no-acl \
  --dbname="$TARGET_DATABASE_URL" \
  "$BACKUP_FILE"

printf "Restore completed: %s\n" "$TARGET_DB"
