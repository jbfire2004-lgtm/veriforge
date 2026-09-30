process.env.NODE_ENV = 'test';
process.env.PORT = '3114';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_access:vera_access_secret@localhost:5446/vera_access?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
