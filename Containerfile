# Podman/Docker build for the LOB Dashboard — a static Vite/React SPA.
# Build:  podman build -t lob-dashboard .
# Run:    podman run --rm -p 8080:8080 lob-dashboard

FROM docker.io/library/node:20-alpine AS build
WORKDIR /app

# Install with only the manifests present first so this layer only
# invalidates when dependencies actually change, not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.base.json ./
COPY apps/web ./apps/web
RUN npx vite build --config apps/web/vite.config.ts

# nginx-unprivileged runs as a non-root, arbitrary UID out of the box and
# listens on 8080 — no extra config needed for rootless Podman or an
# OpenShift-style restricted SCC that rejects root/privileged ports.
FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 8080
