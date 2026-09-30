process.env.NODE_ENV = 'test';
process.env.PORT = '3122';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_ingest:vera_cail_ingest_secret@localhost:5454/vera_cail_ingest?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
