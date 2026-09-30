process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_permit:vera_permit_secret@localhost:5462/vera_permit?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
