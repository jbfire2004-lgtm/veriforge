# syntax=docker/dockerfile:1
# Nest API. Build from the repo root so file:../packages/* resolves:
#   docker build -f backend/Dockerfile -t veriforge-nest:staging .

FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat python3 make g++
# file:../packages/* run "prepare" → tsc during npm ci. typescript is only a
# devDependency of those packages, so it is not on PATH unless installed here.
RUN npm install -g typescript@5.3.3
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
COPY packages ./packages
# npm ci runs each file: package's prepare (tsc) before that package's deps exist.
# Compile only the packages backend depends on, leaves first across passes.
RUN node -e "const p=require('./backend/package.json'); const deps={...p.dependencies,...(p.devDependencies||{})}; const list=Object.values(deps).filter(s=>typeof s==='string'&&s.startsWith('file:../packages/')).map(s=>s.slice('file:../packages/'.length)); require('fs').writeFileSync('/tmp/vera-pkgs.txt', list.join('\n')+'\n');" \
 && pass=1 \
 && while [ "$pass" -le 8 ]; do \
      while IFS= read -r name; do \
        [ -n "$name" ] || continue; \
        dir="/app/packages/$name"; \
        [ -f "$dir/dist/.docker-built" ] && continue; \
        npm install --prefix "$dir" --ignore-scripts --no-audit --no-fund >"/tmp/$name.npm.log" 2>&1 || continue; \
        npm install --prefix "$dir" --no-save --ignore-scripts --no-audit --no-fund @types/node@20 >>"/tmp/$name.npm.log" 2>&1 || continue; \
        if (cd "$dir" && tsc -p tsconfig.json >"/tmp/$name.tsc.log" 2>&1); then \
          touch "$dir/dist/.docker-built"; \
        fi; \
      done < /tmp/vera-pkgs.txt; \
      pass=$((pass + 1)); \
    done \
 && failed=0 \
 && while IFS= read -r name; do \
      [ -n "$name" ] || continue; \
      if [ ! -f "/app/packages/$name/dist/.docker-built" ]; then \
        echo "PACKAGE BUILD FAILED: $name"; \
        echo "--- npm ---"; cat "/tmp/$name.npm.log" || true; \
        echo "--- tsc ---"; cat "/tmp/$name.tsc.log" || true; \
        failed=1; \
      fi; \
    done < /tmp/vera-pkgs.txt \
 && test "$failed" -eq 0
WORKDIR /app/backend
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS build
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ARG NODE_HEAP_MB=8192
ENV NODE_OPTIONS=--max-old-space-size=${NODE_HEAP_MB}
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages ./packages
COPY backend ./backend
WORKDIR /app/backend
RUN npx prisma generate
RUN npx tsc -p tsconfig.build.json \
 && mkdir -p dist/fall-clearance \
 && if [ -d src/fall-clearance/data ]; then cp -a src/fall-clearance/data dist/fall-clearance/data; fi

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat wget
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV SMS_MONITORING_ENABLED=1
ENV SMS_AI_DECISION_LOGGING=1
ENV SMS_LLM_ENABLED=0
RUN addgroup -S vera && adduser -S vera -G vera
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package.json ./package.json
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/packages ./packages
RUN mkdir -p /app/uploads && chown -R vera:vera /app
USER vera
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=5 \
  CMD wget -qO- --header="X-Forwarded-Proto: https" http://127.0.0.1:3001/health || exit 1
CMD ["node", "dist/main.js"]
