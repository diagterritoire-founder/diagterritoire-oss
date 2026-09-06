#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL est obligatoire pour le controle runtime.}"

PORT="${DT_RUNTIME_PORT:-3100}"
HOST="127.0.0.1"
BASE_URL="http://${HOST}:${PORT}"
LOG="${TMPDIR:-/tmp}/diagterritoire-production-runtime.log"
API_BODY="${TMPDIR:-/tmp}/diagterritoire-production-runtime-api.json"

test -d .next || {
  echo "Build production absent : executez npm run build."
  exit 1
}

npm run db:check-pilot >/dev/null
echo "PostgreSQL pilote : connexion et donnees OK"

if [ -z "${AUTH_SECRET:-}" ]; then
  AUTH_SECRET="$(node -e "process.stdout.write(require(\"crypto\").randomBytes(32).toString(\"hex\"))")"
  export AUTH_SECRET
  echo "AUTH_SECRET : secret ephemere genere pour le smoke test"
fi

export AUTH_TRUST_HOST=true
export AUTH_URL="$BASE_URL"

rm -f "$LOG" "$API_BODY"

./node_modules/.bin/next start -H "$HOST" -p "$PORT" >"$LOG" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

READY=0
for _ in $(seq 1 30); do
  STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/connexion" 2>/dev/null || true)"

  if [ "$STATUS" = "200" ]; then
    READY=1
    break
  fi

  kill -0 "$SERVER_PID" 2>/dev/null || break
  sleep 1
done

if [ "$READY" != "1" ]; then
  echo "Runtime production indisponible."
  cat "$LOG"
  exit 1
fi

check_status() {
  EXPECTED="$1"
  PATHNAME="$2"
  ACTUAL="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL$PATHNAME")"
  printf "%s : %s\n" "$PATHNAME" "$ACTUAL"
  test "$ACTUAL" = "$EXPECTED"
}

check_status 200 "/connexion"
check_status 307 "/"
check_status 307 "/dashboard"
check_status 200 "/api/auth/session"

API_STATUS="$(curl -sS -o "$API_BODY" -w "%{http_code}" "$BASE_URL/api/territorial-analysis/territory-commune-dzaoudzi-labattoir")"
printf "%s : %s\n" "/api/territorial-analysis/..." "$API_STATUS"
test "$API_STATUS" = "401"
grep -Fq '"error":"Authentification requise."' "$API_BODY"

if grep -Fq "[auth][error]" "$LOG"; then
  echo "Erreur Auth.js detectee."
  cat "$LOG"
  exit 1
fi

echo "Production runtime check: OK"
