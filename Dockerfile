# -----------------------------------------------------------------------------
# LOB Dashboard — single container (frontend + BFF)
#
# Builds the Vite React SPA and the Express tRPC BFF, then runs ONE Node
# process that serves both the API (/trpc, /health) and the static UI on
# port 4000.
# -----------------------------------------------------------------------------

# ---- Stage 1: install dependencies + build -----------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Manifests first (better layer cache)
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY apps/bff/package.json ./apps/bff/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared ./packages/shared

# Install (prefer lockfile when present)
RUN if [ -f package-lock.json ]; then \
      npm ci --ignore-scripts; \
    else \
      npm install --ignore-scripts; \
    fi

# App source
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
COPY apps/bff ./apps/bff

# Build frontend (static assets → apps/web/dist)
ENV NODE_ENV=production
RUN npx vite build --config apps/web/vite.config.ts

# Build BFF (TypeScript → apps/bff/dist)
RUN npx tsc -p apps/bff/tsconfig.json

# ---- Stage 2: slim runtime ---------------------------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    STATIC_DIR=/app/public

# Production dependencies only
COPY package.json package-lock.json* ./
COPY apps/bff/package.json ./apps/bff/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared ./packages/shared

RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev --ignore-scripts; \
    else \
      npm install --omit=dev --ignore-scripts; \
    fi

# Compiled BFF + built SPA
COPY --from=builder /app/apps/bff/dist ./apps/bff/dist
COPY --from=builder /app/apps/web/dist ./public

WORKDIR /app/apps/bff

EXPOSE 4000

# Healthcheck without relying on wget/curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
