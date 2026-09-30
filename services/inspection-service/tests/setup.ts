process.env.NODE_ENV = 'test';
process.env.PORT = '3098';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_inspection:vera_inspection_secret@localhost:5460/vera_inspection?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
