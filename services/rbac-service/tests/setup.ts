process.env.NODE_ENV = 'test';
process.env.PORT = '3098';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_rbac:vera_rbac_secret@localhost:5434/vera_rbac?schema=public';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-minimum-32-characters';
process.env.PERMISSION_CACHE_TTL_MS = '5000';
process.env.LOG_LEVEL = 'error';
process.env.RBAC_SERVICE_KEY = 'test-hook-key';
