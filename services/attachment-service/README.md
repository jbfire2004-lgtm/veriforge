# Vera Attachment Service

File storage microservice with S3-compatible backends, thumbnails, virus-scan hook, and secure pre-signed downloads.

## Features

- Multipart upload with MIME and size validation
- Metadata in PostgreSQL (`attachments` table)
- Multi-company isolation via JWT
- Generic module linking (`module_type`, `module_record_id`)
- Image thumbnails (Sharp)
- Optional virus scan webhook (`VIRUS_SCAN_URL`)
- Storage adapters: **local** (dev) and **S3** (production / MinIO)
- Pre-signed URLs (S3) or HMAC download tokens (local)

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/attachment/upload` | JWT | Upload file (multipart `file`) |
| GET | `/attachment/{id}` | JWT | Metadata + secure download/thumbnail URLs |
| GET | `/attachment/{id}/download` | JWT or `?token=` | Stream file |
| GET | `/attachment/{id}/thumbnail` | JWT or `?token=` | Stream thumbnail |

## Upload (multipart)

```
POST /attachment/upload
Authorization: Bearer <token>

company_id: uuid
project_id: uuid (optional)
module_type: pm-hazard
module_record_id: uuid
file: <binary>
```

## Quick start

```bash
cd services/attachment-service
cp .env.example .env
docker compose up -d attachment-db
npm install
npx prisma migrate deploy
npm run dev
```

Port **3004**. Postgres **5436**.

## S3 storage

```env
STORAGE_DRIVER=s3
S3_ENDPOINT=https://minio.example.com
S3_BUCKET=vera-attachments
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_FORCE_PATH_STYLE=true
```

## Virus scan hook

POST `VIRUS_SCAN_URL` with JSON:

```json
{
  "attachmentId": "uuid",
  "companyId": "uuid",
  "filePath": "company/module/id/file.jpg",
  "fileType": "image/jpeg",
  "fileSize": 12345
}
```

Response `{ "clean": false, "reason": "..." }` or `{ "infected": true }` rejects upload.

## Tests

```bash
npm test
```
