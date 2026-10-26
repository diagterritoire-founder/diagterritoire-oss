#!/usr/bin/env bash
set -Eeuo pipefail

# Read-only local check. Run as the backup owner (diagterritoire), not root.
BACKUP_DIR="${DT_MONITOR_BACKUP_DIR:-/var/backups/diagterritoire}"
MAX_AGE_HOURS="${DT_MONITOR_MAX_AGE_HOURS:-36}"
CHECK_SYSTEMD="${DT_MONITOR_SYSTEMD_CHECKS:-1}"

fail() { echo "BACKUP-HEALTH-FAIL: $*" >&2; exit 1; }
invalid() { echo "BACKUP-HEALTH-CONFIG-ERROR: $*" >&2; exit 2; }

[[ "$MAX_AGE_HOURS" =~ ^[0-9]+$ ]] || invalid "age must be an integer."
(( 10#$MAX_AGE_HOURS >= 1 && 10#$MAX_AGE_HOURS <= 168 )) ||
  invalid "age must be between 1 and 168 hours."
MAX_AGE_HOURS=$((10#$MAX_AGE_HOURS))
[[ "$CHECK_SYSTEMD" == "0" || "$CHECK_SYSTEMD" == "1" ]] ||
  invalid "DT_MONITOR_SYSTEMD_CHECKS must be 0 or 1."

for tool in stat sha256sum pg_restore; do
  command -v "$tool" >/dev/null 2>&1 || invalid "$tool is required."
done

if [[ "$CHECK_SYSTEMD" == "1" ]]; then
  command -v systemctl >/dev/null 2>&1 || invalid "systemctl is required."
  systemctl is-active --quiet diagterritoire-backup.timer ||
    fail "backup timer is not active."
  result="$(systemctl show diagterritoire-backup.service -p Result --value)" ||
    fail "unable to query backup service status."
  [[ "$result" == "success" ]] || fail "last backup service result is not success."
fi

[[ -d "$BACKUP_DIR" && -r "$BACKUP_DIR" ]] ||
  fail "backup directory missing or unreadable."

shopt -s nullglob
files=("$BACKUP_DIR"/diagterritoire-*.dump)
newest=""
newest_mtime=0
for path in "${files[@]}"; do
  [[ -f "$path" ]] || continue
  mtime="$(stat -c %Y -- "$path")" || fail "unable to read dump timestamp."
  if (( mtime > newest_mtime )); then
    newest="$path"
    newest_mtime="$mtime"
  fi
done
[[ -n "$newest" ]] || fail "no PostgreSQL dump found."

now="$(date +%s)"
age=$((now - newest_mtime))
(( age >= -300 )) || fail "backup timestamp is in the future."
(( age <= MAX_AGE_HOURS * 3600 )) ||
  fail "latest backup is older than $MAX_AGE_HOURS hours."

checksum="$newest.sha256"
[[ -f "$checksum" && -r "$checksum" ]] ||
  fail "checksum file missing or unreadable."
(
  cd -- "$(dirname -- "$newest")"
  sha256sum --status -c -- "$(basename -- "$checksum")"
) || fail "checksum verification failed."

pg_restore --list "$newest" >/dev/null 2>&1 ||
  fail "pg_restore cannot read the archive."

echo "BACKUP-HEALTH-OK: current local archive, checksum valid, pg_restore readable."
