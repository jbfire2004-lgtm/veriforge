# Vera PM — Attachments & Media System

Production API: `/api/v1/pm/attachments-media` · Spec alias: `/api/v1/pm/attachment` · UI: `/pm/attachments-media`

## Architecture

| Layer | Path |
|-------|------|
| Module | `backend/src/pm-attachments-media/` |
| Storage | `pm_attachments` (`PmPmAttachment`) |
| Annotations | `attachment_annotations` |
| Audit | `attachment_audit` |
| Migration | `20260521320000_pm_attachments_media` |

## Workflow statuses

`uploaded` → `processed` / `linked` → `annotated` · Failed virus scan → `archived`

## Allowed media

JPEG, PNG, WebP, GIF, PDF, MP4 — max 25MB default.

## Offline

`pmAttachments.sync` — download project bundle or upload `attachments` + `annotations` arrays.

See `docs/vera-pm-attachments-media-developer-pack.md` for full API and integration map.
