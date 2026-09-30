# Vera Core Completion Manifest (Batch 1 + 2)

## New files

- `docs/architecture/vera-core-phase-1-1.25-1.5.md`
- `docs/api-contract-phase-1-to-1.5.md`
- `docs/phase-1-to-1.5-batch1-2-manifest.md`
- `backend/prisma/migrations/20260507150000_core_action_item_parent_xor/migration.sql`
- `vera-frontend/src/pages/core-daily-log/list.tsx`
- `vera-frontend/src/pages/core-daily-log/new.tsx`
- `vera-frontend/src/pages/core-daily-log/edit.tsx`
- `vera-frontend/src/pages/core-meeting-record/list.tsx`
- `vera-frontend/src/pages/core-meeting-record/new.tsx`
- `vera-frontend/src/pages/core-meeting-record/edit.tsx`
- `vera-frontend/app/core/daily-logs/page.tsx`
- `vera-frontend/app/core/daily-logs/new/page.tsx`
- `vera-frontend/app/core/daily-logs/edit/[id]/page.tsx`
- `vera-frontend/app/core/meeting-records/page.tsx`
- `vera-frontend/app/core/meeting-records/new/page.tsx`
- `vera-frontend/app/core/meeting-records/edit/[id]/page.tsx`
- `vera-frontend/src/hooks/useCoreDailyLogMutations.ts`
- `vera-frontend/src/hooks/useCoreDailyLogById.ts`
- `vera-frontend/src/hooks/useCoreMeetingRecordMutations.ts`
- `vera-frontend/src/hooks/useCoreMeetingRecordById.ts`

## Updated files

- `backend/src/modules/core-action-items/dto/create-core-action-item.dto.ts`
  - Added `CANCELLED` to allowed status enum (aligns with DB constraint).
- `vera-frontend/src/components/core-action-items/core-action-item.schema.ts`
  - Added `CANCELLED` to UI enum for consistent status handling.
- `vera-frontend/lib/pm-safety-workflow.ts`
  - Added cookie credential inclusion for all PM safety requests.
- `vera-frontend/src/components/core-action-items/CoreActionItemForm.tsx`
  - Omit empty `dueAt` instead of sending `null`.
- `vera-frontend/src/components/core-compliance-note/CoreComplianceNoteForm.tsx`
  - Omit empty `dueAt` instead of sending `null`.
- `vera-frontend/app/pm/safety/page.tsx`
- `vera-frontend/app/pm/safety/new/page.tsx`
- `vera-frontend/app/pm/safety/assess/page.tsx`
- `vera-frontend/app/pm/safety/[id]/page.tsx`
- `vera-frontend/app/core/upload/page.tsx`
  - Added server session guard + callback-preserving redirect.
- `vera-frontend/app/auth/login/page.tsx`
  - Callback-aware redirect resolution on successful login.
- `vera-frontend/app/verify/core/training/[id]/page.tsx`
  - Completion handoff CTA/redirect to PM safety assessment.
- `vera-frontend/app/admin/page.tsx`
  - Added Phase 1.5 and Phase 1.25 launch links.
- `vera-frontend/src/components/core-daily-log/CoreDailyLogTable.tsx`
  - Added edit navigation link.
- `vera-frontend/src/components/core-meeting-record/CoreMeetingRecordTable.tsx`
  - Added edit navigation link.
- `vera-frontend/app/admin/workers/[id]/training/page.tsx`
  - API base normalization, credentialed requests, completion endpoint integration, and mutation race hardening.
- `backend/src/training-records/training-records.controller.ts`
  - Added `PATCH /training-records/:id/complete`.
- `backend/src/training-records/training-records.service.ts`
  - Added `markComplete(id)` implementation.
- `vera-frontend/proxy.ts`
  - Updated to NextAuth cookies + callback-preserving redirect to `/auth/login`.

## New route client page modules (to support server-guard wrappers)

- `vera-frontend/src/pages/pm/safety/list.tsx`
- `vera-frontend/src/pages/pm/safety/new.tsx`
- `vera-frontend/src/pages/pm/safety/assess.tsx`
- `vera-frontend/src/pages/pm/safety/review.tsx`
- `vera-frontend/src/pages/core/upload.tsx`

## Notes

- The DB parent-link invariant for `CoreActionItem` is now enforced at database level
  for new writes using a NOT VALID check constraint migration.
- Existing historical rows are not retro-validated in this migration step.

