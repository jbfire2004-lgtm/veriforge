process.env.NODE_ENV = 'test';
process.env.PORT = '3096';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_offline:vera_offline_secret@localhost:5437/vera_offline?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.SYNC_WORKER_ENABLED = 'false';
process.env.LOG_LEVEL = 'error';
