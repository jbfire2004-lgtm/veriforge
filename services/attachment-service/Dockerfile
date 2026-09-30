FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache vips-dev build-base python3
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache vips && addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
RUN mkdir -p /app/data/uploads && chown -R nodejs:nodejs /app/data
USER nodejs
EXPOSE 3004
HEALTHCHECK CMD wget -qO- http://localhost:3004/health/ready || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
