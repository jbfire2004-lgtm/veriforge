# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=8192
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV SMS_MONITORING_ENABLED=1
ENV SMS_AI_DECISION_LOGGING=1
ENV SMS_LLM_ENABLED=0
RUN addgroup -S vera && adduser -S vera -G vera
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
USER vera
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/v1/sms/health || wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "dist/main.js"]
