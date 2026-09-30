# VeriForge Next.js app — multi-stage (monorepo root context)
# Build from repo root:
#   docker build -f infra/veriforge/Dockerfile -t veriforge-app:latest .
#
# Compose sets context to ../.. (repo root).

# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /repo

# ── Stage 1: install vera-frontend + local workspace packages ────────────────
FROM base AS deps
COPY vera-frontend/package.json vera-frontend/package-lock.json* vera-frontend/pnpm-lock.yaml* ./vera-frontend/
COPY packages ./packages
WORKDIR /repo/vera-frontend
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      pnpm install; \
    fi

# ── Stage 2: builder ─────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /repo/vera-frontend/node_modules ./vera-frontend/node_modules
COPY --from=deps /repo/packages ./packages
COPY vera-frontend ./vera-frontend
WORKDIR /repo/vera-frontend

ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm run build || npm run build

# ── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nextjs -u 1001 -G nodejs \
  && apk add --no-cache wget

COPY --from=builder /repo/vera-frontend/public ./public
# Standalone may nest under vera-frontend/ depending on tracing root
COPY --from=builder --chown=nextjs:nodejs /repo/vera-frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/vera-frontend/.next/static ./.next/static

# If standalone nested the app dir, normalize to /app/server.js
RUN if [ ! -f /app/server.js ] && [ -f /app/vera-frontend/server.js ]; then \
      cp -a /app/vera-frontend/. /app/ && rm -rf /app/vera-frontend; \
    fi

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
