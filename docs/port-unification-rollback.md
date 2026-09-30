# Port unification rollback

Revert the :5175 canonical port changes:

```powershell
cd C:\Projects\veri-temp

# Remove new file
Remove-Item vera-frontend\lib\dev-ports.ts -ErrorAction SilentlyContinue

# Restore from git if tracked, otherwise manually revert these files:
git checkout -- vera-frontend/lib/api-fetch.ts `
  vera-frontend/lib/hub/feed-api.ts `
  vera-frontend/lib/job-board/seo.ts `
  vera-frontend/lib/safety-blog/seo.ts `
  vera-frontend/lib/expert-qa/seo.ts `
  vera-frontend/proxy.ts `
  vera-frontend/.env.example `
  vera-frontend/.env.local `
  apps/veriforge-frontend/vite.config.ts `
  apps/veriforge-frontend/.env.example `
  apps/veriforge-frontend/src/lib/module-links.ts `
  scripts/dev-veriforge.mjs `
  docs/VERIFORGE-LOCAL-PORTS.md `
  .env.example `
  backend/.env
```

## Manual restore values (if not in git)

**vera-frontend/.env.local**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_BASE_PATH=/vera
NEXT_PUBLIC_SITE_URL=http://localhost:5175/vera
NEXTAUTH_URL="http://localhost:5175/vera"
```

**backend/.env**
```
PUBLIC_BASE_URL="http://localhost:3000"
CORS_ORIGIN unset or previous value
```

**vite.config.ts** — remove `/nest` proxy block.

**proxy.ts** — remove `:3000` → `:5175` redirect block.
