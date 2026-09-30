process.env.NODE_ENV = 'test';
process.env.PORT = '3133';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_drift:vera_cail_drift_secret@localhost:5465/vera_cail_drift?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
