# VeraPM Unified Safety Forms System

## Overview

All 25 safety forms share one JSON-driven engine, one API (`/api/v1/pm/safety-forms`), and one frontend form renderer under `/pm/safety-forms`.

## Backend

- Module: `backend/src/forms/`
- Tables: `safety_form_definitions`, `safety_forms`, `safety_form_submissions`, `safety_form_attachments`, `safety_form_signatures`, `safety_form_actions`, `safety_form_versions`, `safety_form_audit_log`
- Definitions catalog: `backend/src/forms/definitions/catalog.ts` (25 forms)
- Field sync: `safetyFormV2.submit` batch action

## Frontend

- API client: `vera-frontend/lib/safety-forms.ts`
- Engine: `vera-frontend/src/components/safety-forms/engine/`
- Shared components: `vera-frontend/src/components/safety-forms/components/`
- Routes: `/pm/safety-forms`, `/pm/safety-forms/fill/[definitionId]`, `/pm/safety-forms/[id]`, `/pm/safety-forms/dashboard`

## Premium UI

- Theme tokens: `vera-frontend/src/components/safety-forms/theme/safety-forms-theme.css`
- UI primitives: `vera-frontend/src/components/safety-forms/ui/`
- All safety-form routes wrap in `SfShell` via `app/pm/safety-forms/layout.tsx`
- Design: deep slate + electric blue, glass headers, floating labels, section progress tracker

## Form IDs

`pha`, `daily-flha`, `site-orientation`, `training-verification`, `competency-evaluation`, `fit-testing`, `pre-use-inspection`, `equipment-return`, `general-inspection`, `corrective-action`, `heca-observation`, `bbo`, `incident-report`, `near-miss`, `emergency-response`, `worker-site-access`, `confined-space`, `hot-work`, `lockout-tagout`, `leading-indicator`, `lagging-indicator`, `toolbox-talk`, `crane-lift-plan`, `pme-check`, `trailer-unloading`
