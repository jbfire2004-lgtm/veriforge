# VeriForge SaaS API — multi-stage (pnpm preferred, npm fallback)
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      pnpm install; \
    fi

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN pnpm exec prisma generate || npx prisma generate
RUN pnpm run build || npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3020

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 \
  && apk add --no-cache wget postgresql-client findutils \
  && corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --prod --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      pnpm install --prod; \
    fi

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY scripts ./scripts
COPY src/rbac ./src/rbac

USER nodejs
EXPOSE 3020

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3020/health/ready || exit 1

# API default; migrate Job uses scripts/migrate-deploy.sh or repo scripts/migrate.sh
CMD ["node", "dist/index.js"]
