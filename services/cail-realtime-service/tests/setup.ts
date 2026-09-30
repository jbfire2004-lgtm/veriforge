process.env.NODE_ENV = 'test';
process.env.PORT = '3127';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_realtime:vera_cail_realtime_secret@localhost:5459/vera_cail_realtime?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
