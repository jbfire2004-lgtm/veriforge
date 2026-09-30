process.env.NODE_ENV = 'test';
process.env.PORT = '3097';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_jha:vera_jha_secret@localhost:5439/vera_jha?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
