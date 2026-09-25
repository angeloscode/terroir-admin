#!/usr/bin/env bash
# PID 1 — tini (-g пробрасывает сигналы всей группе). Здесь два процесса:
# Next.js (127.0.0.1:3000, наружу не торчит) и Caddy (80/443).
# Если падает любой из них — контейнер завершается, и Docker его перезапускает.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${AUTH_SECRET:?AUTH_SECRET is required}"
export AUTH_TRUST_HOST="${AUTH_TRUST_HOST:-true}"

if [[ "${RUN_MIGRATIONS:-true}" == "true" ]]; then
  echo "[entrypoint] prisma migrate deploy"
  prisma migrate deploy --schema /app/admin/prisma/schema.prisma
fi

echo "[entrypoint] starting admin (next) on 127.0.0.1:3000"
( cd /app/admin && HOSTNAME=127.0.0.1 PORT=3000 exec node server.js ) &

echo "[entrypoint] starting caddy"
caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &

wait -n
code=$?
echo "[entrypoint] a process exited with code ${code}, shutting down"
exit "${code}"
