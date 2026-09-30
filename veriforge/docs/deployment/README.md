# Deployment Documentation

Build, environment, and global rollout for forged-metal VeriForge.

## Build instructions

```bash
# Frontend
cd vera-frontend
npm run typecheck
npm run lint
npm run build
npm start

# Optional forged-metal static gates
npm run vf:debug:all

# Backend
cd backend
npm run build
npm run start:prod
```

Clean Next cache if needed: `npm run clean` then `npm run build`.

See `veriforge/BUILD-PROMPT.md` for UI production wiring gates.

## Environment setup

| Area | Notes |
|------|-------|
| Node | 20+ recommended |
| Frontend env | API base URL, auth secrets as used by Next/Auth |
| Backend env | DB, JWT secret, tenant mode (shared vs dedicated) |
| Tenancy | Seed tenants e.g. `tenant-alloy`, `tenant-forgeco` |
| Storage | Per-tenant buckets `veriforge-tenant-{slug}` |

Never commit secrets (`.env`, credentials). Debug classes (`vf-debug*`) must be **off** in production.

## Global deployment playbook

UI console: `/veriforge/deployment`  
API: `/veriforge/deployment`  
Deep dive: `docs/VERIFORGE-GLOBAL-DEPLOYMENT-PLAYBOOK.md`

### Sections

1. **Infrastructure** — multi-region, tenant-aware routing, LB, auto-scale, DR  
2. **Localization** — language packs, regional rules, local training  
3. **Compliance alignment** — OSHA · COR · ISO · CSA · EU  
4. **Rollout** — Pilot → Regional → Global  
5. **Training** — operator enablement for new regions  
6. **Support** — industrial support lanes  
7. **Monitoring** — health, forge analytics sync  

### API actions (examples)

| Method | Path |
|--------|------|
| `GET` | `/veriforge/deployment` |
| `GET` | `/veriforge/deployment/analytics` |
| `POST` | `/veriforge/deployment/rollout/advance` |
| `POST` | `/veriforge/deployment/localization/toggle/:id` |
| `POST` | `/veriforge/deployment/infrastructure/scale` |
| `POST` | `/veriforge/deployment/monitoring/refresh` |

## Performance & a11y gates before go-live

- [ ] `PERFORMANCE-PACK.md` budgets met  
- [ ] `ACCESSIBILITY-SYSTEM.md` §8 signed off  
- [ ] `QA-SUITE.md` sections 1–7 passed  
- [ ] `vf-debug*` removed  
- [ ] Critical routes pulse correctly; reduced-motion safe  

## Identity lock (prod)

| Token | Value |
|-------|-------|
| Iron black | `#0D0D0D` |
| Steel grey | `#424242` |
| Forge red | `#C62828` |
| Safety white | `#FAFAFA` |
| Geometry | `border-radius: 0` |
| Fonts | Orbitron + Exo 2 |
