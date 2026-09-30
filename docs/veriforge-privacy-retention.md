# VeriForge privacy & data retention

## Subject rights (API)

| Operation | Method | Auth |
|-----------|--------|------|
| Export (DSAR pack) | `GET /privacy/export` | Bearer JWT (self only) |
| Delete / scramble | `DELETE /privacy/me` | Bearer JWT (self; **owners blocked**) |

Owners must transfer ownership before account deletion.

## Encryption

- Display names written as `fullNameEnc` (AES-256-GCM) with `FIELD_ENCRYPTION_KEY` required in production.
- API display prefers decrypted `fullNameEnc`.
- MFA TOTP secrets stored only as `mfaSecretEnc`.

## Retention defaults (env-overridable)

| Record | Default days | Env |
|--------|--------------|-----|
| User accounts | 3650 | `PII_USER_RETENTION_DAYS` |
| Audit logs | 2555 (~7y) | `AUDIT_LOG_RETENTION_DAYS` |

Operational purge of audit logs beyond retention should run as a scheduled job (ops backlog if not already scheduled).

## Encryption at rest

Application-level field encryption is mandatory for PII sensitive fields.
Cloud disk / RDS volume encryption must be enabled by environment (checklist in `docs/veriforge-security-hardening.md`).
