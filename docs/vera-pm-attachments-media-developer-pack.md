# Attachments & Media — Developer-Ready Pack

Unified PM attachment upload, virus scan policy, thumbnail generation, image annotation, module linking, offline sync, and CAIL scene tagging across all safety modules.

**Primary API:** `/api/v1/pm/attachments-media`  
**Spec alias API:** `/api/v1/pm/attachment`  
**UI:** `/pm/attachments-media`  
**Offline sync:** `pmAttachments.sync`  
**Backend:** `backend/src/pm-attachments-media/`  
**Migration:** `20260521320000_pm_attachments_media`  
**Storage table:** `pm_attachments` (`PmPmAttachment`)

---

## 1. Backend architecture

### Service mapping

| Spec service | Implementation |
|--------------|----------------|
| attachment-service | `PmAttachmentsMediaService.upload`, `getById` |
| media-processing-service | `processAttachment` (virus + thumbnail + compression metadata) |
| image-annotation-service | `annotate` → `PmAttachmentAnnotation` |
| offline-media-service | `syncBundle`, `applyOfflineSync` |
| virus-scan-service | `VirusScanEngine` |
| thumbnail-service | `ThumbnailEngine` |
| audit-service | `PmAttachmentAuditLog` |

### Core engines

| Component | File | Responsibility |
|-----------|------|----------------|
| File Upload Engine | `file-upload.engine.ts` | MIME/extension/size validation |
| File Storage Engine | `storageKey` / `dataUrl` / `coreFileId` | Persist file reference |
| File Metadata Engine | `PmPmAttachment` fields | module link, size, status |
| Media Annotation Engine | `annotate` | JSON markup on images |
| Media Compression Engine | `media-compression.engine.ts` | Compression metadata (v1 passthrough) |
| Offline Attachment Engine | `applyOfflineSync` | Replay uploads + annotations |
| Attachment Linking Engine | `attachment-linking.engine.ts` | Known `module_type` validation |

### Module wiring

- `PrismaModule` — `PmPmAttachment`, annotations, audit
- Optional `coreFileId` — links to `CoreFile` from core-upload

---

## 2. Database schema

### `attachments` → `PmPmAttachment` (`pm_attachments`)

| Field | Spec alias |
|-------|------------|
| id | UUID PK |
| companyId | company_id |
| projectId | project_id |
| entityType | module_type |
| entityId | module_record_id |
| storageKey | file_path |
| mimeType | file_type |
| fileSize | file_size |
| thumbnailPath / thumbnailDataUrl | thumbnail_path |
| uploadedByUserId | uploaded_by |
| createdAt | uploaded_at |
| status | workflow state |
| virusScanStatus | virus scan result |

### `attachment_annotations` → `PmAttachmentAnnotation`

| Field | Spec |
|-------|------|
| attachmentId | attachment_id |
| annotationType | annotation_type |
| annotationData | annotation_data (jsonb) |
| createdByUserId | created_by |
| createdAt | created_at |

### `attachment_audit` → `PmAttachmentAuditLog`

| Field | Spec |
|-------|------|
| eventType | event_type |
| eventData | event_data (jsonb) |
| createdAt | timestamp |

---

## 3. API contract

### Spec paths (`/api/v1/pm/attachment`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Upload + process + link |
| GET | `/:id` | Attachment + annotations |
| GET | `/:id/thumbnail` | Thumbnail payload |
| POST | `/:id/annotate` | Add annotation |
| POST | `/offline/sync` | Upload offline batch |

### Full API (`/api/v1/pm/attachments-media`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Same as spec |
| GET | `/:id`, `/:id/thumbnail`, `/:id/predict` | Detail + CAIL |
| POST | `/:id/annotate` | Annotation |
| GET | `/entity/list?moduleType=&moduleRecordId=` | List by module |
| GET | `/analytics/project/:id` | Usage analytics |
| GET | `/sync/project/:id` | Offline download |
| POST | `/offline/sync` | Offline upload |

### Upload body

```json
{
  "companyId": 1,
  "projectId": 1,
  "moduleType": "inspection",
  "moduleRecordId": "uuid-inspection-id",
  "fileName": "deficiency-photo.jpg",
  "mimeType": "image/jpeg",
  "dataUrl": "data:image/jpeg;base64,...",
  "fileSize": 245000,
  "clientSyncId": "att-field-1"
}
```

---

## 4. Frontend architecture

| Route | Screen | File |
|-------|--------|------|
| `/pm/attachments-media` | Media hub | `attachments-media/dashboard.tsx` |

**Libs:**
- `vera-frontend/lib/pm-attachments-media.ts`
- `vera-frontend/lib/pm-attachment.ts` (spec paths)

| Spec screen | Vera |
|-------------|------|
| Attachment Upload Screen | Upload tab |
| Attachment Viewer | Detail + thumbnail |
| Annotation Editor | Annotate API |
| Offline Attachment Queue | `pmAttachments.sync` |

### Spec components

| Component | API |
|-----------|-----|
| FileUploader | `POST /upload` |
| ImageAnnotator | `POST /:id/annotate` |
| ThumbnailGrid | `GET /:id/thumbnail` |
| VideoPlayer / PDFViewer | `dataUrl` / `storageKey` on GET |

---

## 5. Workflow logic

### States (`PmAttachmentStatus`)

| Spec | Vera status |
|------|-------------|
| Uploaded | `uploaded` (transient) |
| Processed | `processed` |
| Annotated | `annotated` |
| Linked | `linked` (has module link after process) |
| Archived | `archived` (virus scan failed) |

### Transitions

```
Uploaded → (virus scan + thumbnail + CAIL) → Processed/Linked
Processed → Annotated (on first annotation)
Any → Archived (virus scan failed)
```

### Validation

| Rule | Enforcement |
|------|-------------|
| File type allowed | `FileUploadEngine` — images, PDF, MP4 |
| File size within limits | Default 25MB |
| Virus scan passed | `VirusScanEngine` — blocks executables |

---

## 6. CAIL intelligence logic

**`GET /attachments-media/:id/predict`**

| Output | Description |
|--------|-------------|
| autoTags | photo, document, module type, hazard/equipment hints |
| hazardDetected | Filename keyword heuristic |
| equipmentIdentified | Equipment keyword heuristic |
| sceneClassification | inspection_evidence, hazard_documentation, etc. |
| confidence | 0.55–0.95 |

Stored on attachment as `cailTagsJson` after processing.

---

## 7. Offline mode

### Download

`GET /attachments-media/sync/project/:projectId` — project attachments + annotations.

### Upload

```json
{
  "projectId": 1,
  "attachments": [
    {
      "moduleType": "incident",
      "moduleRecordId": "uuid",
      "fileName": "scene.jpg",
      "mimeType": "image/jpeg",
      "dataUrl": "data:image/jpeg;base64,...",
      "clientSyncId": "att-1"
    }
  ],
  "annotations": [
    {
      "attachmentId": "uuid",
      "annotationType": "arrow",
      "annotationData": { "x": 10, "y": 20 },
      "clientSyncId": "ann-1"
    }
  ]
}
```

**Field handler:** `pmAttachments.sync`

---

## 8. Integration map

| Module | `moduleType` | Notes |
|--------|--------------|-------|
| JHA / FLHA | `jha_flha` | Per-form attachments |
| Inspections | `inspection` | Deficiency photos |
| Incidents | `incident` | Scene evidence |
| Corrective Actions | `capa` | Evidence attachments |
| Equipment | `equipment` | Condition photos |
| SDS | `sds` | Label scans |
| PM Module | `pm_task`, `project` | Task/project media |
| Safety Stations | `safety_station` | Station captures |
| Emergency | `emergency` | Event attachments |
| Document Control | `document` | Controlled doc media |
| Site Access | `access` | Override evidence |
| Training | `training` | Certificates |
| Hazard Control | `hazard_control` | Unified HC evidence |

Module-specific tables (e.g. `PmInspectionAttachment`) remain for backward compatibility; new cross-module media should use this unified API.

---

## 9. Analytics

**GET `/analytics/project/:projectId`**

| Metric | Description |
|--------|-------------|
| uploads30d | Total uploads |
| annotated30d | Attachments in annotated status |
| annotationFrequency30d | Annotation row count |
| annotationRate | Annotations per attachment |
| moduleAttachmentDensity | Count/density by module_type |

---

## File index

```
backend/src/pm-attachments-media/
  pm-attachments-media.service.ts
  pm-attachments-media.controller.ts
  pm-attachment.controller.ts
  pm-attachments-cail-intelligence.service.ts
  file-upload.engine.ts
  virus-scan.engine.ts
  thumbnail.engine.ts
  media-compression.engine.ts
  attachment-linking.engine.ts

vera-frontend/
  lib/pm-attachments-media.ts
  lib/pm-attachment.ts
  src/pages/pm/attachments-media/dashboard.tsx

docs/
  vera-pm-attachments-media-developer-pack.md
```

## Deploy

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Restart backend to load `PmAttachmentsMediaModule` and `PmAttachmentController`.
