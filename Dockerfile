# Один контейнер: Caddy (вход, HTTPS) + статика Astro + Next.js админка на /admin
# Контекст сборки — корень /Users/angelos/test (оба проекта рядом)

ARG NODE_IMAGE=node:24-bookworm-slim

# ---------- Astro: статический сайт ----------
FROM ${NODE_IMAGE} AS site
WORKDIR /src
COPY terroir-black-sea/package.json terroir-black-sea/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY terroir-black-sea/ ./
ARG PUBLIC_SITE_URL=http://localhost
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL} \
    ASTRO_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Next.js: админка (standalone) ----------
FROM ${NODE_IMAGE} AS admin
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY terroir-admin/package.json terroir-admin/package-lock.json ./
COPY terroir-admin/prisma ./prisma
RUN npm ci --no-audit --no-fund
COPY terroir-admin/ ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# ---------- Runtime ----------
FROM ${NODE_IMAGE} AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl tini ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g prisma@5.22.0 --no-audit --no-fund \
 && npm cache clean --force
COPY --from=caddy:2 /usr/bin/caddy /usr/bin/caddy

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    XDG_DATA_HOME=/data \
    XDG_CONFIG_HOME=/config

WORKDIR /app

# Next standalone: server.js + минимальные node_modules
COPY --from=admin --chown=node:node /src/.next/standalone ./admin
COPY --from=admin --chown=node:node /src/.next/static ./admin/.next/static
COPY --from=admin --chown=node:node /src/public ./admin/public
COPY --from=admin --chown=node:node /src/prisma ./admin/prisma
COPY --from=admin --chown=node:node /src/scripts ./admin/scripts
# bcryptjs бандлится в чанки Next, а скрипту create-admin нужен отдельный модуль
COPY --from=admin --chown=node:node /src/node_modules/bcryptjs ./admin/node_modules/bcryptjs

# Astro dist
COPY --from=site --chown=node:node /src/dist /srv/site

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN printf '#!/bin/sh\nexec node /app/admin/scripts/create-admin.mjs "$@"\n' > /usr/local/bin/create-admin \
 && chmod 755 /usr/local/bin/create-admin

# Caddy слушает 80/443 без root
RUN apt-get update && apt-get install -y --no-install-recommends libcap2-bin \
 && setcap cap_net_bind_service=+ep /usr/bin/caddy \
 && apt-get purge -y libcap2-bin && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /data /config && chown node:node /data /config

USER node
EXPOSE 80 443 443/udp
VOLUME ["/data"]

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/admin/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" \
   && node -e "fetch('http://127.0.0.1:8081/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "-g", "--", "/usr/local/bin/entrypoint.sh"]
