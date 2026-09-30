process.env.NODE_ENV = 'test';
process.env.PORT = '3117';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_emergency:vera_emergency_secret@localhost:5449/vera_emergency?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';
