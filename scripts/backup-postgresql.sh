#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

: "${DATABASE_URL:?DATABASE_URL is required}"
command -v pg_dump >/dev/null 2>&1 || { echo "ERROR: pg_dump is required." >&2; exit 1; }
command -v pg_restore >/dev/null 2>&1 || { echo "ERROR: pg_restore is required." >&2; exit 1; }

BACKUP_DIR="${BACKUP_DIR:-/var/backups/diagterritoire}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

case "$RETENTION_DAYS" in
  ""|*[!0-9]*) echo "ERROR: RETENTION_DAYS must be a non-negative integer." >&2; exit 1 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(realpath "$SCRIPT_DIR/..")"
BACKUP_DIR="$(realpath -m "$BACKUP_DIR")"

case "$BACKUP_DIR/" in
  "$REPO_ROOT/"*) echo "ERROR: refusing to write database backups inside the Git repository." >&2; exit 1 ;;
esac

mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$BACKUP_DIR/diagterritoire-$TIMESTAMP.dump"
TEMP="$BACKUP.part"

cleanup() {
  rm -f "$TEMP"
}
trap cleanup EXIT

pg_dump "$DATABASE_URL" --format=custom --no-owner --no-acl --file="$TEMP"
pg_restore --list "$TEMP" >/dev/null
chmod 600 "$TEMP"
mv "$TEMP" "$BACKUP"
trap - EXIT

BACKUP_NAME="$(basename "$BACKUP")"
(
  cd "$BACKUP_DIR"
  sha256sum "$BACKUP_NAME" > "$BACKUP_NAME.sha256"
)
chmod 600 "$BACKUP.sha256"

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name "diagterritoire-*.dump" -o -name "diagterritoire-*.dump.sha256" \) -mtime "+$RETENTION_DAYS" -delete

printf "Backup created: %s\n" "$BACKUP"
printf "Checksum: %s.sha256\n" "$BACKUP"
