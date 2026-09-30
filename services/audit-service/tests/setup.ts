process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_audit:vera_audit_secret@localhost:5435/vera_audit?schema=public';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-minimum-32-characters';
process.env.AUDIT_SERVICE_KEY = 'test-audit-ingest-key';
process.env.LOG_LEVEL = 'error';
process.env.AUDIT_DEFAULT_LIMIT = '50';
process.env.AUDIT_MAX_LIMIT = '200';
