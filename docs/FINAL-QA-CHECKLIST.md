# Vera Final QA Checklist

Use this checklist for production-readiness signoff. Mark each item with:
- `[ ]` not started
- `[~]` in progress
- `[x]` pass
- `[!]` blocked / defect found

## Machine-validated gates (required)

- [x] Run one-command go-live checklist: `npm run go-live:checklist`
- [x] Run tenant onboarding automation: `node scripts/onboard-tenant.mjs`
- [x] Run go-live smoke suite: `node scripts/go-live-smoke.mjs`
- [x] Run synthetic probes for target env: `node scripts/synthetic-probe.mjs`
- [!] Confirm CI workflows green. (blocked: backend lint/typecheck now pass locally; frontend lint has warnings only; frontend `typecheck` still fails with legacy strict TypeScript errors across app/components and must be triaged before branch-protection pass)
  - `backend-ci.yml`
  - `vera-core-ci.yml`
  - `vera-e2e.yml`
  - `go-live-smoke.yml`
  - `services-ci.yml`

## Core Flows

### 1) Login
- [~] Supervisor login succeeds and redirects to authenticated landing page. (API login verified; UI redirect pending)
- [x] Provider login succeeds and role-scoped routes are visible.
- [x] Worker login succeeds and restricted admin/provider routes are hidden/forbidden.
- [x] Invalid credentials show friendly message (no stack trace/raw JSON).
- [~] Expired/deactivated session shows clean re-auth path. (invalid-token unauthorized flow verified; full expiry/deactivation scenario pending)

### 2) Provider issues credential
- [x] Provider can open credential issue workflow.
- [x] Required fields validated client + API.
- [x] Credential issuance writes audit event and is visible in credential view.
- [x] Unauthorized role cannot issue credentials (403).

### 3) Ingestion creates credential
- [x] Upload preview works for JSON/PDF/image. (JSON + PDF + image MIME path verified)
- [x] Low-confidence rows are clearly flagged.
- [x] Confirm ingest creates records and shows run summary.
- [x] Failed rows are reported with row-level messages.
- [x] Ingested credentials appear in wallet/credential detail.

### 4) Project compliance view
- [x] Compliance summary loads with acceptable latency.
- [x] Non-compliant and expiring lists render correctly.
- [x] Alert resolution works and list updates.
- [x] Empty-state is clear when there are no alerts/non-compliant workers.

### 5) Safety form creation/approval
- [x] Form creation works for common form types.
- [x] Draft save + submit transitions are stable.
- [x] Supervisor approval/rejection transition works.
- [x] Unauthorized approval attempts are blocked.

### 6) Offline safety form + sync
- [ ] Offline cached forms are visible when disconnected.
- [x] Offline draft/edit works.
- [x] Sync after reconnect merges and updates server state.
- [x] Duplicate sync IDs do not create duplicate forms.

## UX / Mobile / Accessibility

- [~] No horizontal overflow on main workflows (ingestion/compliance/safety/credential detail) at 320-390px widths. (auth/login redirect flow verified; authenticated routes pending)
- [!] Tap targets are comfortable (>= 44px) for primary actions. (login flow shows small interactive targets)
- [ ] Keyboard navigation reaches all form fields and primary actions.
- [~] Form controls have labels (`label` + `htmlFor`). (verified on login flow; authenticated route forms pending)
- [~] Loading states present for initial fetch and long actions. (static route load path showed no loading indicator)
- [ ] Empty states present for major list views.
- [ ] Error states are user-friendly and actionable.
- [ ] Basic contrast check passes for status/alert text.

## Performance Smoke Checks

- [x] Ingestion run query/log timings reviewed (p95 acceptable for expected payload size).
- [x] Compliance evaluate timings reviewed.
- [x] Safety list/detail query timings reviewed.
- [ ] No obvious N+1 behavior in logs for high-volume pages.

## Defect Triage Rules

- **P0**: Data loss/corruption, auth bypass, security issue, app crash on core flow.
- **P1**: Core flow blocked, severe usability issue, major mobile breakage.
- **P2**: Cosmetic or minor friction issue.

Ship gate: no open P0/P1 defects.
