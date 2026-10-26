#!/usr/bin/env bash
set -Eeuo pipefail

# External probe: no credentials, no response body, no redirects, TLS checked.
URL="${DT_MONITOR_URL:-https://dzaoudzi-labattoir.diagterritoire.fr/connexion}"
ATTEMPTS="${DT_MONITOR_ATTEMPTS:-3}"
RETRY_SECONDS="${DT_MONITOR_RETRY_SECONDS:-10}"
CONNECT_TIMEOUT="${DT_MONITOR_CONNECT_TIMEOUT:-5}"
MAX_TIME="${DT_MONITOR_MAX_TIME:-12}"

die() { echo "AVAILABILITY-CONFIG-ERROR: $*" >&2; exit 2; }

case "$URL" in
  https://*) ;;
  http://127.0.0.1:*|http://localhost:*) ;; # Local-only test endpoint
  *) die "HTTPS is mandatory for remote checks." ;;
esac

for pair in \
  "DT_MONITOR_ATTEMPTS:$ATTEMPTS:1:10" \
  "DT_MONITOR_RETRY_SECONDS:$RETRY_SECONDS:0:60" \
  "DT_MONITOR_CONNECT_TIMEOUT:$CONNECT_TIMEOUT:1:30" \
  "DT_MONITOR_MAX_TIME:$MAX_TIME:1:60"; do
  IFS=: read -r name value min max <<<"$pair"
  [[ "$value" =~ ^[0-9]+$ ]] || die "$name must be an integer."
  (( 10#$value >= min && 10#$value <= max )) || die "$name out of allowed range."
done
ATTEMPTS=$((10#$ATTEMPTS))

command -v curl >/dev/null 2>&1 || die "curl is required."

for (( attempt=1; attempt<=ATTEMPTS; attempt++ )); do
  # 302/307, 5xx, TLS failures, DNS errors and timeouts are not successes.
  status="$(curl -sS -o /dev/null -w "%{http_code}" \
    --connect-timeout "$CONNECT_TIMEOUT" \
    --max-time "$MAX_TIME" \
    --max-redirs 0 \
    --proto '=http,https' \
    "$URL" 2>/dev/null)" || status="000"

  if [[ "$status" == "200" ]]; then
    echo "AVAILABILITY-OK: login endpoint HTTP 200 (attempt $attempt)."
    exit 0
  fi

  echo "AVAILABILITY-RETRY: attempt $attempt/$ATTEMPTS, status=$status." >&2
  if (( attempt < ATTEMPTS )); then sleep "$RETRY_SECONDS"; fi
done

echo "AVAILABILITY-FAIL: endpoint did not return HTTP 200 after $ATTEMPTS attempts." >&2
exit 1
